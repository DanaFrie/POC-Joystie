/**
 * Client-side game room create/join for localhost — skips undeployed callables (CORS).
 */
import { push, ref, set, update, get, remove } from 'firebase/database';
import type { GameOnboardingContext } from '@/constants/game';
import { GAME_WIN_SCORE } from '@/constants/game';
import { getDatabaseInstance } from '@/lib/firebase';
import { gameRoomPath, GAME_ROOMS_PATH } from '@/lib/game/paths';
import { DEFAULT_PADDLE_WIDTH } from '@/lib/game/physics';
import { beginCountdown } from '@/lib/game/rooms';
import { getCurrentUserId } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('LocalGameRooms');

function randomJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code.toUpperCase();
}

function defaultBall(now: string) {
  return { x: 0.5, y: 0.5, vx: 0, vy: 0, updatedBy: 'parent', updatedAt: now };
}

function compactOnboardingContext(
  input: GameOnboardingContext
): GameOnboardingContext | undefined {
  const ctx: GameOnboardingContext = {};
  if (input.childId) ctx.childId = input.childId;
  if (input.challengeId) ctx.challengeId = input.challengeId;
  if (input.bondingInviteId) ctx.bondingInviteId = input.bondingInviteId;
  if (input.parentStepId) ctx.parentStepId = input.parentStepId;
  if (input.childStepId) ctx.childStepId = input.childStepId;
  return Object.keys(ctx).length > 0 ? ctx : undefined;
}

export async function createGameRoomLocal(input: GameOnboardingContext = {}) {
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('Must be signed in');

  const db = await getDatabaseInstance();
  const roomRef = push(ref(db, GAME_ROOMS_PATH));
  const roomId = roomRef.key;
  if (!roomId) throw new Error('Failed to allocate room id');

  const now = new Date().toISOString();
  const joinCode = randomJoinCode();
  const onboardingContext = compactOnboardingContext(input);

  await set(roomRef, {
    parentId: uid,
    childUid: null,
    joinCode,
    phase: 'waiting_child',
    playReady: { parent: false, child: false },
    hasStartedRound: false,
    ball: defaultBall(now),
    paddles: { parentX: 0.5, childX: 0.5, width: DEFAULT_PADDLE_WIDTH },
    score: { shared: 0 },
    activeSide: 'parent',
    winner: null,
    gameOutcome: null,
    onboardingAdvanced: false,
    onboardingAdvancedAt: null,
    createdAt: now,
    updatedAt: now,
    ...(input.childId ? { childId: input.childId } : {}),
    ...(input.challengeId ? { challengeId: input.challengeId } : {}),
    ...(input.bondingInviteId ? { bondingInviteId: input.bondingInviteId } : {}),
    ...(onboardingContext ? { onboardingContext } : {}),
  });

  logger.log('createGameRoomLocal', { roomId, parentId: uid });
  return { roomId, joinCode, winScore: GAME_WIN_SCORE };
}

export async function joinGameRoomLocal(roomId: string, joinCode: string) {
  const uid = await getCurrentUserId({ allowAnonymous: true });
  if (!uid) throw new Error('Must be signed in');

  const db = await getDatabaseInstance();
  const roomRef = ref(db, gameRoomPath(roomId));
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error('Room not found');

  const room = snap.val() as {
    joinCode?: string;
    parentId?: string;
    childUid?: string | null;
    phase?: string;
    playReady?: { parent?: boolean; child?: boolean };
  };
  const normalized = joinCode.trim().toUpperCase();
  if (room.joinCode !== normalized) throw new Error('Invalid join code');
  if (room.parentId === uid) {
    throw new Error('Parent cannot join as child in the same account');
  }
  if (room.childUid && room.childUid !== uid) {
    throw new Error('Room already has a child');
  }

  if (room.childUid === uid) {
    logger.log('joinGameRoomLocal already joined', { roomId, childUid: uid });
    return {
      roomId,
      phase: (room.phase as 'waiting_ready') ?? 'waiting_ready',
      winScore: GAME_WIN_SCORE,
    };
  }

  const now = new Date().toISOString();
  const parentAlreadyReady = room.playReady?.parent === true;
  // Do not rewrite playReady — parent may already have tapped consent.
  await update(roomRef, {
    childUid: uid,
    parentId: room.parentId,
    phase: 'waiting_ready',
    updatedAt: now,
  });

  logger.log('joinGameRoomLocal', {
    roomId,
    childUid: uid,
    parentAlreadyReady,
  });

  if (parentAlreadyReady) {
    await beginCountdown(roomId);
  }

  return { roomId, phase: 'waiting_ready' as const, winScore: GAME_WIN_SCORE };
}

export async function completeGameOnboardingLocal(roomId: string) {
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('Must be signed in');

  const db = await getDatabaseInstance();
  const roomRef = ref(db, gameRoomPath(roomId));
  const snap = await get(roomRef);
  if (!snap.exists()) throw new Error('Room not found');

  const room = snap.val() as {
    parentId?: string;
    phase?: string;
    winner?: string | null;
    score?: { shared?: number };
    onboardingAdvanced?: boolean;
  };

  if (room.parentId !== uid) {
    throw new Error('Only parent can complete onboarding game');
  }

  const won =
    room.phase === 'finished' &&
    room.winner === 'shared' &&
    (room.score?.shared ?? 0) >= GAME_WIN_SCORE;

  if (!won) throw new Error('Game not won yet');

  const now = new Date().toISOString();
  await update(roomRef, {
    onboardingAdvanced: true,
    onboardingAdvancedAt: now,
    updatedAt: now,
  });

  logger.log('completeGameOnboardingLocal', { roomId });
  return {
    roomId,
    onboardingAdvanced: true,
    winScore: GAME_WIN_SCORE,
    score: room.score?.shared ?? GAME_WIN_SCORE,
  };
}

export async function endOnboardingGameRoomLocal(roomId: string) {
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('Must be signed in');

  const db = await getDatabaseInstance();
  const roomRef = ref(db, gameRoomPath(roomId));
  const snap = await get(roomRef);
  if (!snap.exists()) {
    return { roomId, removed: false, alreadyGone: true as const };
  }

  const room = snap.val() as {
    parentId?: string;
    phase?: string;
    winner?: string | null;
    score?: { shared?: number };
    onboardingAdvanced?: boolean;
  };

  if (room.parentId !== uid) {
    throw new Error('Only parent can end onboarding game');
  }

  const won =
    room.phase === 'finished' &&
    room.winner === 'shared' &&
    (room.score?.shared ?? 0) >= GAME_WIN_SCORE;

  if (!won) throw new Error('Game not won yet');

  const now = new Date().toISOString();
  if (!room.onboardingAdvanced) {
    await update(roomRef, {
      onboardingAdvanced: true,
      onboardingAdvancedAt: now,
      gameOutcome: 'won',
      updatedAt: now,
    });
  }

  await remove(roomRef);
  await remove(ref(db, `onboardingBondingPublic/${uid}`));

  logger.log('endOnboardingGameRoomLocal', { roomId });
  return {
    roomId,
    removed: true as const,
    winScore: GAME_WIN_SCORE,
    score: room.score?.shared ?? GAME_WIN_SCORE,
  };
}
