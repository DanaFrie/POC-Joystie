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
  GamePlayerRole,
  GamePaddlesState,
  GameRoomState,
  GameScoreState,
  GameWinner,
} from '@/types/game';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('GameRooms');

function parseRoom(roomId: string, raw: Record<string, unknown> | null): GameRoomState | null {
  if (!raw) return null;
  const ball = raw.ball as GameBallState | undefined;
  const paddles = raw.paddles as GamePaddlesState | undefined;
  const score = raw.score as GameScoreState | undefined;
  if (!ball) return null;
  const normalizedBall: GameBallState = {
    x: Number.isFinite(ball.x) ? ball.x : 0.5,
    y: Number.isFinite(ball.y) ? ball.y : 0.5,
    vx: Number.isFinite(ball.vx) ? ball.vx : 0.32,
    vy: Number.isFinite(ball.vy) ? ball.vy : 0.42,
    updatedBy: ball.updatedBy || 'parent',
    updatedAt: ball.updatedAt || new Date().toISOString(),
  };
  const normalizedPaddles: GamePaddlesState = {
    parentX: Number.isFinite(paddles?.parentX) ? paddles!.parentX : 0.5,
    childX: Number.isFinite(paddles?.childX) ? paddles!.childX : 0.5,
    width: Number.isFinite(paddles?.width) ? paddles!.width : 0.28,
  };
  const normalizedScore: GameScoreState = {
    shared: Number.isFinite(score?.shared) ? score!.shared : 0,
  };
  return {
    roomId,
    parentId: String(raw.parentId ?? ''),
    childUid: raw.childUid != null ? String(raw.childUid) : null,
    joinCode: String(raw.joinCode ?? ''),
    phase: (raw.phase as GameRoomState['phase']) ?? 'waiting_child',
    challengeId: raw.challengeId ? String(raw.challengeId) : undefined,
    childId: raw.childId ? String(raw.childId) : undefined,
    bondingInviteId: raw.bondingInviteId ? String(raw.bondingInviteId) : undefined,
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
  const clamped = {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  };
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
  x: number
): Promise<void> {
  const db = await getDatabaseInstance();
  const nextX = Math.min(0.9, Math.max(0.1, x));
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
  await update(ref(db, gameRoomPath(roomId)), {
    score,
    phase,
    activeSide,
    winner,
    updatedAt: new Date().toISOString(),
  });
  logger.log('gameState', { roomId, score, phase, activeSide, winner });
}
