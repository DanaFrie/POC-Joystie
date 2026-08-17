/**
 * Ball game room client (Firebase Realtime Database).
 */
import {
  ref,
  onValue,
  update,
  get,
  type Unsubscribe,
} from 'firebase/database';
import { getDatabaseInstance } from '@/lib/firebase';
import { gameRoomPath } from '@/lib/game/paths';
import type {
  GameBallState,
  GameOutcome,
  GamePlayReadyState,
  GamePlayerRole,
  GamePaddlesState,
  GameRoomState,
  GameScoreState,
  GameWinner,
} from '@/types/game';
import type { GameOnboardingContext } from '@/constants/game';
import { ballTowardFromVy } from '@/lib/game/ballDirection';
import {
  clampBallCenter,
  clampPaddleCenterX,
  createStartBall,
  DEFAULT_PADDLE_WIDTH,
} from '@/lib/game/physics';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('GameRooms');

function parseRoom(roomId: string, raw: Record<string, unknown> | null): GameRoomState | null {
  if (!raw) return null;
  const ball = raw.ball as GameBallState | undefined;
  const paddles = raw.paddles as GamePaddlesState | undefined;
  const score = raw.score as GameScoreState | undefined;
  if (!ball) return null;
  const ballCenter = clampBallCenter(
    Number.isFinite(ball.x) ? ball.x : 0.5,
    Number.isFinite(ball.y) ? ball.y : 0.5
  );
  const normalizedBall: GameBallState = {
    x: ballCenter.x,
    y: ballCenter.y,
    vx: Number.isFinite(ball.vx) ? ball.vx : 0,
    vy: Number.isFinite(ball.vy) ? ball.vy : 0,
    toward:
      ball.toward === 'parent' || ball.toward === 'child'
        ? ball.toward
        : ballTowardFromVy(Number.isFinite(ball.vy) ? ball.vy : 0),
    updatedBy: ball.updatedBy || 'parent',
    updatedAt: ball.updatedAt || new Date().toISOString(),
  };
  const normalizedPaddles: GamePaddlesState = {
    parentX: clampPaddleCenterX(
      Number.isFinite(paddles?.parentX) ? paddles!.parentX : 0.5,
      Number.isFinite(paddles?.width) ? paddles!.width : DEFAULT_PADDLE_WIDTH
    ),
    childX: clampPaddleCenterX(
      Number.isFinite(paddles?.childX) ? paddles!.childX : 0.5,
      Number.isFinite(paddles?.width) ? paddles!.width : DEFAULT_PADDLE_WIDTH
    ),
    width: Number.isFinite(paddles?.width) ? paddles!.width : DEFAULT_PADDLE_WIDTH,
  };
  const normalizedScore: GameScoreState = {
    shared: Number.isFinite(score?.shared) ? score!.shared : 0,
  };
  const playReadyRaw = raw.playReady as GamePlayReadyState | undefined;
  const playReady: GamePlayReadyState = {
    parent: playReadyRaw?.parent === true,
    child: playReadyRaw?.child === true,
  };
  const onboardingContext = raw.onboardingContext as GameOnboardingContext | undefined;
  return {
    roomId,
    parentId: String(raw.parentId ?? ''),
    childUid: raw.childUid != null ? String(raw.childUid) : null,
    joinCode: String(raw.joinCode ?? ''),
    phase: (raw.phase as GameRoomState['phase']) ?? 'waiting_child',
    challengeId: raw.challengeId ? String(raw.challengeId) : undefined,
    childId: raw.childId ? String(raw.childId) : undefined,
    bondingInviteId: raw.bondingInviteId ? String(raw.bondingInviteId) : undefined,
    onboardingContext,
    onboardingAdvanced: raw.onboardingAdvanced === true,
    onboardingAdvancedAt:
      raw.onboardingAdvancedAt != null ? String(raw.onboardingAdvancedAt) : null,
    gameOutcome: (raw.gameOutcome as GameOutcome | undefined) ?? null,
    ball: normalizedBall,
    paddles: normalizedPaddles,
    score: normalizedScore,
    playReady,
    hasStartedRound: raw.hasStartedRound === true,
    countdownAt: raw.countdownAt != null ? String(raw.countdownAt) : null,
    activeSide: (raw.activeSide as GamePlayerRole | undefined) ?? 'parent',
    winner: (raw.winner as GameWinner | undefined) ?? null,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

export function subscribeToGameRoom(
  roomId: string,
  onChange: (room: GameRoomState | null) => void
): Unsubscribe {
  let dbPromise: ReturnType<typeof getDatabaseInstance> | null = null;
  let unsub: Unsubscribe | null = null;

  void getDatabaseInstance().then((db) => {
    dbPromise = Promise.resolve(db);
    const roomRef = ref(db, gameRoomPath(roomId));
    unsub = onValue(roomRef, (snap) => {
      onChange(parseRoom(roomId, snap.val() as Record<string, unknown> | null));
    });
  });

  return () => {
    if (unsub) unsub();
  };
}

export async function updateBallPosition(
  roomId: string,
  role: GamePlayerRole,
  x: number,
  y: number,
  vx: number,
  vy: number,
  toward?: GamePlayerRole,
  gamePatch?: {
    score: GameScoreState;
    phase: GameRoomState['phase'];
    winner: GameWinner;
  }
): Promise<void> {
  const db = await getDatabaseInstance();
  const clamped = clampBallCenter(x, y);
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    ball: {
      ...clamped,
      vx,
      vy,
      toward: toward ?? ballTowardFromVy(vy),
      updatedBy: role,
      updatedAt: now,
    },
    updatedAt: now,
  };
  if (gamePatch) {
    patch.score = gamePatch.score;
    patch.phase = gamePatch.phase;
    patch.activeSide = 'parent';
    patch.winner = gamePatch.winner;
    if (gamePatch.phase === 'finished') {
      patch.gameOutcome =
        gamePatch.winner === 'shared'
          ? 'won'
          : gamePatch.winner === null
            ? 'missed'
            : null;
      if (gamePatch.winner === null) {
        patch.playReady = { parent: false, child: false };
      }
    }
  }
  await update(ref(db, gameRoomPath(roomId)), patch);
}

export async function updatePaddlePosition(
  roomId: string,
  role: GamePlayerRole,
  x: number,
  paddleWidth: number = DEFAULT_PADDLE_WIDTH
): Promise<void> {
  const db = await getDatabaseInstance();
  const nextX = clampPaddleCenterX(x, paddleWidth);
  const key = role === 'parent' ? 'paddles/parentX' : 'paddles/childX';
  await update(ref(db, gameRoomPath(roomId)), {
    [key]: nextX,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateScoreAndPhase(
  roomId: string,
  score: GameScoreState,
  phase: GameRoomState['phase'],
  activeSide: GamePlayerRole,
  winner: GameWinner
): Promise<void> {
  const db = await getDatabaseInstance();
  const now = new Date().toISOString();
  let gameOutcome: GameOutcome = null;
  if (phase === 'finished') {
    gameOutcome = winner === 'shared' ? 'won' : winner === null ? 'missed' : null;
  }
  const patch: Record<string, unknown> = {
    score,
    phase,
    activeSide,
    winner,
    gameOutcome,
    updatedAt: now,
  };
  if (phase === 'finished' && winner === null) {
    patch.playReady = { parent: false, child: false };
  }
  await update(ref(db, gameRoomPath(roomId)), patch);
  logger.log('gameState', { roomId, score, phase, activeSide, winner, gameOutcome });
}

export async function ensureWaitingReadyPhase(roomId: string): Promise<void> {
  const db = await getDatabaseInstance();
  const roomRef = ref(db, gameRoomPath(roomId));
  const snap = await get(ref(db, gameRoomPath(roomId)));
  if (!snap.exists()) return;

  const raw = snap.val() as Record<string, unknown>;
  const phase = String(raw.phase ?? '');
  const existingReady = (raw.playReady as GamePlayReadyState | undefined) ?? {
    parent: false,
    child: false,
  };

  if (phase === 'waiting_ready') {
    if (!raw.playReady) {
      await update(roomRef, { playReady: existingReady });
    }
    return;
  }

  const start = createStartBall();
  const now = new Date().toISOString();
  await update(roomRef, {
    phase: 'waiting_ready',
    playReady: { parent: existingReady.parent, child: false },
    ball: {
      ...start,
      vx: 0,
      vy: 0,
      updatedBy: 'parent',
      updatedAt: now,
    },
    updatedAt: now,
  });
}

export async function updatePlayReady(
  roomId: string,
  role: GamePlayerRole,
  ready: boolean
): Promise<void> {
  const db = await getDatabaseInstance();
  const roomRef = ref(db, gameRoomPath(roomId));
  const key = role === 'parent' ? 'playReady/parent' : 'playReady/child';
  await update(roomRef, {
    [key]: ready,
    updatedAt: new Date().toISOString(),
  });

  if (!ready) return;

  const snap = await get(roomRef);
  if (!snap.exists()) return;
  const raw = snap.val() as Record<string, unknown>;
  const playReadyRaw = raw.playReady as { parent?: boolean; child?: boolean } | undefined;
  const phase = String(raw.phase ?? '');
  const childJoined = Boolean(raw.childUid);
  if (childJoined && playReadyRaw?.parent === true && phase === 'waiting_child') {
    await update(roomRef, {
      phase: 'waiting_ready',
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function beginCountdown(roomId: string): Promise<void> {
  const db = await getDatabaseInstance();
  const roomRef = ref(db, gameRoomPath(roomId));
  const snap = await get(roomRef);
  if (!snap.exists()) return;
  const raw = snap.val() as Record<string, unknown>;
  if (String(raw.phase ?? '') !== 'waiting_ready' && String(raw.phase ?? '') !== 'waiting_child') {
    return;
  }
  if (!raw.childUid) return;
  const hasStartedRound = raw.hasStartedRound === true;
  const playReadyRaw = raw.playReady as { parent?: boolean; child?: boolean } | undefined;
  if (playReadyRaw?.parent !== true) return;
  // First rally — parent tap only; retries use restartAfterMiss (no countdown).
  if (hasStartedRound) return;

  const now = new Date().toISOString();
  await update(roomRef, {
    phase: 'countdown',
    countdownAt: now,
    updatedAt: now,
  });
  logger.log('countdownStart', { roomId });
}

export async function startGamePlay(roomId: string): Promise<void> {
  const db = await getDatabaseInstance();
  const roomRef = ref(db, gameRoomPath(roomId));
  const snap = await get(roomRef);
  if (!snap.exists()) return;
  const raw = snap.val() as Record<string, unknown>;
  if (String(raw.phase ?? '') !== 'countdown') return;

  const start = createStartBall();
  const now = new Date().toISOString();
  await update(roomRef, {
    phase: 'playing',
    hasStartedRound: true,
    countdownAt: null,
    ball: {
      ...start,
      updatedBy: 'parent',
      updatedAt: now,
    },
    updatedAt: now,
  });
  logger.log('gameStart', { roomId });
}

/** After a miss — both tapped retry; reset score and serve toward child. */
export async function restartAfterMiss(roomId: string): Promise<void> {
  const db = await getDatabaseInstance();
  const start = createStartBall();
  const now = new Date().toISOString();
  await update(ref(db, gameRoomPath(roomId)), {
    phase: 'playing',
    ball: {
      ...start,
      updatedBy: 'parent',
      updatedAt: now,
    },
    score: { shared: 0 },
    winner: null,
    gameOutcome: null,
    countdownAt: null,
    updatedAt: now,
  });
  logger.log('gameRestartAfterMiss', { roomId });
}

export async function resetGameRound(roomId: string): Promise<void> {
  const db = await getDatabaseInstance();
  const start = createStartBall();
  const now = new Date().toISOString();
  await update(ref(db, gameRoomPath(roomId)), {
    ball: {
      ...start,
      updatedBy: 'parent',
      updatedAt: now,
    },
    score: { shared: 0 },
    phase: 'waiting_ready',
    playReady: { parent: false, child: false },
    winner: null,
    gameOutcome: null,
    onboardingAdvanced: false,
    onboardingAdvancedAt: null,
    updatedAt: now,
  });
  logger.log('gameReset', { roomId });
}
