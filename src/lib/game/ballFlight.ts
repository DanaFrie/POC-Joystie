/** Display-only: keep the sprite moving between 50ms physics / RTDB snapshots. */

import {
  BALL_RADIUS_X,
  BALL_RADIUS_Y,
  CHILD_PADDLE_Y,
  PARENT_PADDLE_Y,
} from '@/lib/game/physics';

export type FlightBall = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  updatedAt?: string;
};

/**
 * How far past the last snapshot the sprite may fly.
 * Covers an App Hosting RTDB delivery (~120ms) plus a stalled write,
 * so the ball does not freeze and then jump.
 */
export const BALL_FLIGHT_MAX_LOOKAHEAD_S = 0.5;

/** Side walls bounce. Top and bottom stay open — paddles own those. */
export function integrateBallFlight(
  ball: Pick<FlightBall, 'x' | 'y' | 'vx' | 'vy'>,
  elapsedS: number,
  radiusX = BALL_RADIUS_X
): { x: number; y: number } {
  let x = ball.x;
  let y = ball.y;
  let vx = ball.vx;
  let remaining = Math.max(0, elapsedS);

  for (let guard = 0; remaining > 1e-8 && guard < 8; guard += 1) {
    if (x <= radiusX && vx < 0) {
      x = radiusX;
      vx = -vx;
    } else if (x >= 1 - radiusX && vx > 0) {
      x = 1 - radiusX;
      vx = -vx;
    }

    let dt = remaining;
    if (vx > 1e-8) {
      const hit = (1 - radiusX - x) / vx;
      if (hit > 1e-8 && hit < dt) dt = hit;
    } else if (vx < -1e-8) {
      const hit = (radiusX - x) / vx;
      if (hit > 1e-8 && hit < dt) dt = hit;
    }

    x += vx * dt;
    y += ball.vy * dt;
    remaining -= dt;

    const hitWall =
      (x <= radiusX + 1e-7 && vx < 0) || (x >= 1 - radiusX - 1e-7 && vx > 0);
    if (hitWall) {
      if (x <= radiusX + 1e-7) x = radiusX;
      else x = 1 - radiusX;
      vx = -vx;
    } else if (dt <= 1e-8) {
      break;
    }
  }

  // Hold on the paddle line until the bounce snapshot arrives.
  // Flying through and snapping back reads as drag at the end of the rally.
  const yMin = CHILD_PADDLE_Y + BALL_RADIUS_Y;
  const yMax = PARENT_PADDLE_Y - BALL_RADIUS_Y;
  y = Math.min(yMax, Math.max(yMin, y));

  return { x, y };
}

/**
 * Where to paint the ball.
 * A snapshot stamped in the past is flown forward to `nowMs` (this is the RTDB gap).
 * A missing or future stamp flies from `receivedAtMs` so a clock skew cannot park the ball.
 */
export function projectBallFlight(
  ball: FlightBall,
  nowMs: number,
  receivedAtMs: number,
  maxLookaheadS = BALL_FLIGHT_MAX_LOOKAHEAD_S
): { x: number; y: number } {
  const stamped = ball.updatedAt ? Date.parse(ball.updatedAt) : NaN;
  const elapsed =
    Number.isFinite(stamped) && nowMs >= stamped
      ? Math.min(maxLookaheadS, (nowMs - stamped) / 1000)
      : Math.min(maxLookaheadS, Math.max(0, (nowMs - receivedAtMs) / 1000));
  return integrateBallFlight(ball, elapsed);
}

export function ballFlightPosition(
  ball: FlightBall,
  nowMs = Date.now(),
  maxLookaheadS = BALL_FLIGHT_MAX_LOOKAHEAD_S
): { x: number; y: number } {
  return projectBallFlight(ball, nowMs, nowMs, maxLookaheadS);
}
