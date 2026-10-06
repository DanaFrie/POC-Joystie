/** Draw-only: lerp the sprite toward the live physics snapshot. No second sim. */

export const BALL_DRAW_MS = 50;

export function lerp(a: number, b: number, t: number): number {
  const k = Math.min(1, Math.max(0, t));
  return a + (b - a) * k;
}

export function lerpBallDraw(
  from: { x: number; y: number },
  to: { x: number; y: number },
  startedAtMs: number,
  nowMs: number,
  durationMs = BALL_DRAW_MS
): { x: number; y: number } {
  const t = durationMs <= 0 ? 1 : (nowMs - startedAtMs) / durationMs;
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
  };
}
