/** Display-only: keep the sprite moving between 50ms physics / RTDB snapshots. */

export type FlightBall = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  updatedAt?: string;
};

/** Do not run ahead of the last snapshot by more than one physics tick. */
export const BALL_FLIGHT_MAX_LOOKAHEAD_S = 0.1;

export function ballFlightPosition(
  ball: FlightBall,
  nowMs = Date.now(),
  maxLookaheadS = BALL_FLIGHT_MAX_LOOKAHEAD_S
): { x: number; y: number } {
  const stamped = ball.updatedAt ? Date.parse(ball.updatedAt) : NaN;
  const elapsed = Number.isFinite(stamped)
    ? Math.min(maxLookaheadS, Math.max(0, (nowMs - stamped) / 1000))
    : 0;
  return {
    x: Math.min(1, Math.max(0, ball.x + ball.vx * elapsed)),
    y: Math.min(1, Math.max(0, ball.y + ball.vy * elapsed)),
  };
}
