/**
 * Ball game room client (Firebase Realtime Database).
 */
import {
  ref,
  onValue,
  update,
  type Unsubscribe,
} from 'firebase/database';
import { getDatabaseInstance } from '@/lib/firebase';
import { gameRoomPath } from '@/lib/game/paths';
import type {
  GameBallState,
  GameOutcome,
  GamePlayerRole,
  GamePaddlesState,
  GameRoomState,
  GameScoreState,
  GameWinner,
} from '@/types/game';
import type { GameOnboardingContext } from '@/constants/game';
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
  vy: number
): Promise<void> {
  const db = await getDatabaseInstance();
  const clamped = clampBallCenter(x, y);
  const now = new Date().toISOString();
  await update(ref(db, gameRoomPath(roomId)), {
    ball: {
      ...clamped,
      vx,
      vy,
      updatedBy: role,
      updatedAt: now,
    },
    updatedAt: now,
  });
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
  await update(ref(db, gameRoomPath(roomId)), {
    score,
    phase,
    activeSide,
    winner,
    gameOutcome,
    updatedAt: now,
  });
  logger.log('gameState', { roomId, score, phase, activeSide, winner, gameOutcome });
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
    phase: 'playing',
    winner: null,
    gameOutcome: null,
    onboardingAdvanced: false,
    onboardingAdvancedAt: null,
    updatedAt: now,
  });
  logger.log('gameReset', { roomId });
}
