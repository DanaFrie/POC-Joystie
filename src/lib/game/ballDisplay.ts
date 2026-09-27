import { PHYSICS_DT } from '@/lib/game/physics';
import { PHYSICS_LOOP_INTERVAL_MS } from '@/lib/game/stallGuards';

/** Coast from when *this* device got the snapshot — not from the writer's clock. */
export const BALL_EXTRAPOLATE_MAX_MS = 70;
/** Blend into a new snapshot so the child does not teleport onto it. */
export const BALL_SNAPSHOT_BLEND_MS = 45;

export function ballReceiveElapsedMs(receivedAtMs: number, nowMs: number): number {
  if (!Number.isFinite(receivedAtMs) || receivedAtMs <= 0) return 0;
  return Math.max(0, nowMs - receivedAtMs);
}

/** Coast the last known velocity between snapshots so a hitch does not freeze on screen. */
export function extrapolateBallPosition(
  ball: { x: number; y: number; vx: number; vy: number },
  elapsedMs: number
): { x: number; y: number } {
  const elapsed = Math.min(Math.max(0, elapsedMs), BALL_EXTRAPOLATE_MAX_MS);
  const scale = (PHYSICS_DT / PHYSICS_LOOP_INTERVAL_MS) * elapsed;
  return {
    x: Math.min(1, Math.max(0, ball.x + ball.vx * scale)),
    y: Math.min(1, Math.max(0, ball.y + ball.vy * scale)),
  };
}

export function blendBallPosition(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const k = Math.min(1, Math.max(0, t));
  return {
    x: from.x + (to.x - from.x) * k,
    y: from.y + (to.y - from.y) * k,
  };
}

/**
 * Child display: coast from snapshot receive time, blend when a new snapshot lands.
 * Using the writer's `updatedAt` overshoots (network delay) then snaps back.
 */
export function displayBallAfterSnapshot(input: {
  ball: { x: number; y: number; vx: number; vy: number };
  from: { x: number; y: number };
  receivedAtMs: number;
  nowMs: number;
}): { x: number; y: number } {
  const elapsed = ballReceiveElapsedMs(input.receivedAtMs, input.nowMs);
  const coasted = extrapolateBallPosition(input.ball, elapsed);
  const blendT = BALL_SNAPSHOT_BLEND_MS <= 0 ? 1 : elapsed / BALL_SNAPSHOT_BLEND_MS;
  return blendBallPosition(input.from, coasted, blendT);
}
