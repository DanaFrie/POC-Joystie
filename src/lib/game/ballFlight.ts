/** Display-only: keep the sprite moving between 50ms physics / RTDB snapshots. */

import {
  BALL_RADIUS_X,
  BALL_RADIUS_Y,
  CHILD_PADDLE_Y,
  overlapsPaddleX,
  paddleReturnVelocity,
  PARENT_PADDLE_Y,
} from '@/lib/game/physics';

export type FlightBall = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  updatedAt?: string;
};

/** Paddle centers in shared-court coords. The sprite turns around on these. */
export type FlightPaddles = {
  parentX: number;
  childX: number;
  width: number;
};

/**
 * How far past the last snapshot the sprite may fly.
 * Covers an App Hosting RTDB delivery (~120ms) plus a stalled write,
 * so the ball does not freeze and then jump.
 */
export const BALL_FLIGHT_MAX_LOOKAHEAD_S = 0.5;

const PARENT_CONTACT_Y = PARENT_PADDLE_Y - BALL_RADIUS_Y;
const CHILD_CONTACT_Y = CHILD_PADDLE_Y + BALL_RADIUS_Y;

type FlightState = { x: number; y: number; vx: number; vy: number };

function turnAtPaddle(state: FlightState, paddles: FlightPaddles | undefined, which: 'parent' | 'child') {
  if (!paddles) return false;
  const paddleX = which === 'parent' ? paddles.parentX : paddles.childX;
  const paddleHalf = paddles.width / 2;
  if (!overlapsPaddleX(state.x, paddleX, paddleHalf)) return false;
  const returned = paddleReturnVelocity(
    state.x,
    state.vx,
    state.vy,
    paddleX,
    paddleHalf,
    which
  );
  state.vx = returned.vx;
  state.vy = returned.vy;
  state.y = which === 'parent' ? PARENT_CONTACT_Y : CHILD_CONTACT_Y;
  return true;
}

/**
 * If a snapshot is already sitting on a paddle and still moving into it,
 * leave immediately. Parking there is what reads as rolling along the paddle.
 */
function releaseEmbedded(state: FlightState, paddles: FlightPaddles | undefined) {
  if (state.vy > 0 && state.y >= PARENT_CONTACT_Y - 1e-6) {
    if (!turnAtPaddle(state, paddles, 'parent')) {
      state.y = Math.max(state.y, PARENT_CONTACT_Y + 1e-4);
    }
  } else if (state.vy < 0 && state.y <= CHILD_CONTACT_Y + 1e-6) {
    if (!turnAtPaddle(state, paddles, 'child')) {
      state.y = Math.min(state.y, CHILD_CONTACT_Y - 1e-4);
    }
  }
}

/** Side walls bounce. A paddle under the ball turns it back toward the other side. */
export function integrateBallFlight(
  ball: Pick<FlightBall, 'x' | 'y' | 'vx' | 'vy'>,
  elapsedS: number,
  radiusX = BALL_RADIUS_X,
  paddles?: FlightPaddles
): { x: number; y: number } {
  const state: FlightState = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy };
  let remaining = Math.max(0, elapsedS);

  for (let guard = 0; remaining > 1e-8 && guard < 12; guard += 1) {
    releaseEmbedded(state, paddles);

    if (state.x <= radiusX && state.vx < 0) {
      state.x = radiusX;
      state.vx = -state.vx;
    } else if (state.x >= 1 - radiusX && state.vx > 0) {
      state.x = 1 - radiusX;
      state.vx = -state.vx;
    }

    let dt = remaining;
    let event: 'wall-left' | 'wall-right' | 'parent' | 'child' | null = null;

    if (state.vx > 1e-8) {
      const hit = (1 - radiusX - state.x) / state.vx;
      if (hit > 1e-8 && hit < dt) {
        dt = hit;
        event = 'wall-right';
      }
    } else if (state.vx < -1e-8) {
      const hit = (radiusX - state.x) / state.vx;
      if (hit > 1e-8 && hit < dt) {
        dt = hit;
        event = 'wall-left';
      }
    }

    if (state.vy > 1e-8 && state.y < PARENT_CONTACT_Y) {
      const hit = (PARENT_CONTACT_Y - state.y) / state.vy;
      if (hit > 1e-8 && hit < dt) {
        dt = hit;
        event = 'parent';
      }
    } else if (state.vy < -1e-8 && state.y > CHILD_CONTACT_Y) {
      const hit = (CHILD_CONTACT_Y - state.y) / state.vy;
      if (hit > 1e-8 && hit < dt) {
        dt = hit;
        event = 'child';
      }
    }

    state.x += state.vx * dt;
    state.y += state.vy * dt;
    remaining -= dt;

    if (event === 'wall-left' || event === 'wall-right') {
      state.x = event === 'wall-left' ? radiusX : 1 - radiusX;
      state.vx = -state.vx;
    } else if (event === 'parent' || event === 'child') {
      state.y = event === 'parent' ? PARENT_CONTACT_Y : CHILD_CONTACT_Y;
      const turned = turnAtPaddle(state, paddles, event);
      if (!turned) {
        state.y =
          event === 'parent' ? PARENT_CONTACT_Y + 1e-4 : CHILD_CONTACT_Y - 1e-4;
      }
    } else if (dt <= 1e-8) {
      break;
    }
  }

  return { x: state.x, y: state.y };
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
  maxLookaheadS = BALL_FLIGHT_MAX_LOOKAHEAD_S,
  paddles?: FlightPaddles
): { x: number; y: number } {
  const stamped = ball.updatedAt ? Date.parse(ball.updatedAt) : NaN;
  const elapsed =
    Number.isFinite(stamped) && nowMs >= stamped
      ? Math.min(maxLookaheadS, (nowMs - stamped) / 1000)
      : Math.min(maxLookaheadS, Math.max(0, (nowMs - receivedAtMs) / 1000));
  return integrateBallFlight(ball, elapsed, BALL_RADIUS_X, paddles);
}

export function ballFlightPosition(
  ball: FlightBall,
  nowMs = Date.now(),
  maxLookaheadS = BALL_FLIGHT_MAX_LOOKAHEAD_S,
  paddles?: FlightPaddles
): { x: number; y: number } {
  return projectBallFlight(ball, nowMs, nowMs, maxLookaheadS, paddles);
}
