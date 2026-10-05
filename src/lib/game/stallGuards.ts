/**
 * Stall guards for the onboarding ball game.
 *
 * These do not change the 50ms serve loop. They only stop:
 * - wall-clock countdown never finishing
 * - child join rewinding a live room
 * - overlapping async physics writes from the same snapshot
 * - parent-only physics dying when the parent tab is backgrounded
 * - RTDB rejecting y∉[0,1] / |v|>1
 * - a deleted room spinning on «מתחברים למשחק»
 */

import type { GamePlayerRole } from '@/types/game';
import { BALL_GAME_COUNTDOWN_TOTAL_MS } from '@/constants/ball-game-countdown';

export const LIVE_GAME_PHASES: ReadonlySet<string> = new Set([
  'waiting_ready',
  'countdown',
  'playing',
  'finished',
]);

/** Parent tab often sleeps; child takes over if ball updates go stale. */
export const PHYSICS_PARENT_STALE_MS = 900;

/** RTDB `gameRooms/$id/ball` validation (firebase/database.rules.json). */
export const RTDB_BALL_POS_MIN = 0;
export const RTDB_BALL_POS_MAX = 1;
export const RTDB_BALL_VEL_MIN = -16;
export const RTDB_BALL_VEL_MAX = 16;

/** Physics + RTDB write cadence — 20 Hz. Visual motion was calibrated here. */
export const PHYSICS_LOOP_INTERVAL_MS = 50;
export const PHYSICS_MIN_WRITE_INTERVAL_MS = 50;
export const PHYSICS_MAX_WRITES_PER_SEC = 20;

/** Firebase RTDB documented simultaneous write budget for the whole database. */
export const RTDB_WRITE_BUDGET_PER_SEC = 1000;

/** Sentinel — UI maps this to the disappointed-Dori expired-game card. */
export const GAME_ROOM_LOST_ERROR = 'game_room_lost';

export function isGameRoomLostError(message?: string | null): boolean {
  if (!message) return false;
  return (
    message === GAME_ROOM_LOST_ERROR ||
    message.includes('החדר לא נמצא') ||
    /room not found/i.test(message)
  );
}

export type GameRoomPresence = 'unknown' | 'missing' | 'live' | 'deleted';

export type CountdownClockInput = {
  phase: string;
  countdownAt?: string | number | null;
  /** When this client first observed `phase === 'countdown'`. */
  observedAtMs: number;
  nowMs: number;
  totalMs?: number;
};

export type PhysicsAuthorityInput = {
  role: GamePlayerRole;
  phase: string;
  ballUpdatedAt?: string | number | null;
  nowMs: number;
  staleMs?: number;
};

export type RtdbBallWrite = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Firebase may store ISO strings or epoch ms/seconds.
 * Invalid / missing stamps return null — never NaN.
 */
export function parseTimestampMs(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return value > 0 && value < 1e12 ? value * 1000 : value;
  }
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return null;
    return n > 0 && n < 1e12 ? n * 1000 : n;
  }
  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Elapsed countdown time that cannot go negative from clock skew.
 * Uses the later of (stamp elapsed, time since this client saw countdown).
 */
export function countdownElapsedMs(input: {
  countdownAt?: string | number | null;
  observedAtMs: number;
  nowMs: number;
}): number {
  const fromObserve = Math.max(0, input.nowMs - input.observedAtMs);
  const start = parseTimestampMs(input.countdownAt);
  if (start == null) return fromObserve;
  const fromStamp = input.nowMs - start;
  if (fromStamp <= 0) return fromObserve;
  return Math.max(fromStamp, fromObserve);
}

export function shouldStartPlayFromCountdown(input: CountdownClockInput): boolean {
  if (input.phase !== 'countdown') return false;
  const total = input.totalMs ?? BALL_GAME_COUNTDOWN_TOTAL_MS;
  return countdownElapsedMs(input) >= total;
}

/**
 * Child join used to rewrite countdown/playing → waiting_ready + vx/vy 0,
 * which frozen the overlay on «מוכנים?» and parked the serve.
 */
export function shouldResetRoomToWaitingReady(
  phase: string,
  hasStartedRound = false
): boolean {
  if (hasStartedRound) return false;
  return !LIVE_GAME_PHASES.has(phase);
}

export function clampBallForRtdbWrite(ball: RtdbBallWrite): RtdbBallWrite {
  return {
    x: clamp(ball.x, RTDB_BALL_POS_MIN, RTDB_BALL_POS_MAX),
    y: clamp(ball.y, RTDB_BALL_POS_MIN, RTDB_BALL_POS_MAX),
    vx: clamp(ball.vx, RTDB_BALL_VEL_MIN, RTDB_BALL_VEL_MAX),
    vy: clamp(ball.vy, RTDB_BALL_VEL_MIN, RTDB_BALL_VEL_MAX),
  };
}

export function isLegalRtdbBallWrite(ball: RtdbBallWrite): boolean {
  const finite = [ball.x, ball.y, ball.vx, ball.vy].every(Number.isFinite);
  if (!finite) return false;
  return (
    ball.x >= RTDB_BALL_POS_MIN &&
    ball.x <= RTDB_BALL_POS_MAX &&
    ball.y >= RTDB_BALL_POS_MIN &&
    ball.y <= RTDB_BALL_POS_MAX &&
    ball.vx >= RTDB_BALL_VEL_MIN &&
    ball.vx <= RTDB_BALL_VEL_MAX &&
    ball.vy >= RTDB_BALL_VEL_MIN &&
    ball.vy <= RTDB_BALL_VEL_MAX
  );
}

/** Parent always; child only if the parent tick stream looks dead. */
export function shouldRunPhysics(input: PhysicsAuthorityInput): boolean {
  if (input.phase !== 'playing') return false;
  if (input.role === 'parent') return true;
  const updated = parseTimestampMs(input.ballUpdatedAt);
  if (updated == null) return true;
  const staleMs = input.staleMs ?? PHYSICS_PARENT_STALE_MS;
  return input.nowMs - updated > staleMs;
}

/**
 * Drop overlapping ticks instead of starting another physics step from the
 * same RTDB snapshot (that freeze looks like a stuck serve).
 */
export function createExclusiveAsyncLock() {
  let busy = false;
  return {
    get pending() {
      return busy;
    },
    async run<T>(fn: () => Promise<T>): Promise<T | undefined> {
      if (busy) return undefined;
      busy = true;
      try {
        return await fn();
      } finally {
        busy = false;
      }
    },
  };
}

export function isUsableGameRoomRaw(
  raw: unknown
): raw is Record<string, unknown> & { ball: object } {
  if (raw == null || typeof raw !== 'object') return false;
  const ball = (raw as { ball?: unknown }).ball;
  return ball != null && typeof ball === 'object';
}

/**
 * `null` after a live snapshot is a delete (cleanup / traffic drop),
 * not first-load. First-load null stays `missing` so the connecting UI is OK.
 */
export function nextGameRoomPresence(
  prev: GameRoomPresence,
  room: unknown
): GameRoomPresence {
  if (isUsableGameRoomRaw(room)) return 'live';
  if (prev === 'live' || prev === 'deleted') return 'deleted';
  return 'missing';
}

export function shouldShowConnectingOverlay(presence: GameRoomPresence): boolean {
  return presence === 'unknown' || presence === 'missing';
}

/** Prefer a newer local physics tick over a slightly older RTDB echo. */
export function shouldKeepLocalBall(input: {
  localUpdatedAt?: string | null;
  remoteUpdatedAt?: string | null;
  localPhase: string;
  remotePhase: string;
  /** When set, own RTDB echoes must never replace local physics (write time > paint time). */
  localUpdatedBy?: string | null;
  remoteUpdatedBy?: string | null;
  localRole?: string | null;
}): boolean {
  if (input.localPhase !== 'playing' || input.remotePhase !== 'playing') {
    return false;
  }

  const role = input.localRole;
  const localBy = input.localUpdatedBy;
  const remoteBy = input.remoteUpdatedBy;

  // Live parent sim: never yield the ball to RTDB (own echoes OR child failover writes).
  // Dual writers were yanking the ball back and forth every tick.
  if (role === 'parent' && localBy === 'parent') {
    return true;
  }

  // Child must always follow a live parent stream.
  if (role === 'child' && remoteBy === 'parent') {
    return false;
  }

  // Child failover author: ignore own write echoes only.
  if (role === 'child' && localBy === 'child' && remoteBy === 'child') {
    return true;
  }

  const localAt = Date.parse(input.localUpdatedAt || '') || 0;
  const remoteAt = Date.parse(input.remoteUpdatedAt || '') || 0;
  return localAt >= remoteAt;
}

/** Parent dashboard cleanup must not yank a room the child is still playing. */
export function shouldDeleteLeftoverGameRoom(input: {
  phase?: string | null;
  onboardingAdvanced?: boolean;
}): boolean {
  const phase = input.phase ?? '';
  if (
    phase === 'waiting_child' ||
    phase === 'waiting_ready' ||
    phase === 'countdown' ||
    phase === 'playing'
  ) {
    return false;
  }
  if (phase === 'finished' && input.onboardingAdvanced !== true) {
    return false;
  }
  return true;
}

export function createWriteRateLimiter(opts?: {
  minIntervalMs?: number;
  maxPerSec?: number;
}) {
  const minIntervalMs = opts?.minIntervalMs ?? PHYSICS_MIN_WRITE_INTERVAL_MS;
  const maxPerSec = opts?.maxPerSec ?? PHYSICS_MAX_WRITES_PER_SEC;
  let lastWriteAt = Number.NEGATIVE_INFINITY;
  let windowStart = 0;
  let windowCount = 0;

  const rollWindow = (nowMs: number) => {
    if (nowMs - windowStart >= 1000) {
      windowStart = nowMs;
      windowCount = 0;
    }
  };

  return {
    allow(nowMs: number): boolean {
      if (nowMs - lastWriteAt < minIntervalMs) return false;
      rollWindow(nowMs);
      return windowCount < maxPerSec;
    },
    record(nowMs: number) {
      lastWriteAt = nowMs;
      rollWindow(nowMs);
      windowCount += 1;
    },
  };
}

export function simulateRtdbWriteLoad(input: {
  concurrentGames: number;
  writersPerGame: number;
  writesPerSecPerWriter: number;
  budgetPerSec?: number;
}): {
  totalWritesPerSec: number;
  budgetPerSec: number;
  overBudget: boolean;
  headroom: number;
} {
  const budgetPerSec = input.budgetPerSec ?? RTDB_WRITE_BUDGET_PER_SEC;
  const totalWritesPerSec =
    input.concurrentGames * input.writersPerGame * input.writesPerSecPerWriter;
  return {
    totalWritesPerSec,
    budgetPerSec,
    overBudget: totalWritesPerSec > budgetPerSec,
    headroom: budgetPerSec - totalWritesPerSec,
  };
}
