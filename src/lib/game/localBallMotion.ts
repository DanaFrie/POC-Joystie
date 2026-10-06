import {
  BALL_RADIUS,
  BALL_RADIUS_X,
  PHYSICS_DT,
  type BallVector,
} from '@/lib/game/physics';

export type LocalBallBounds = 'all' | 'sides';

/** Display-only: keep moving with last vx/vy between physics/RTDB snapshots. */
export const DISPLAY_EXTRAPOLATE_MAX_S = 0.12;

export function stepLocalBall(
  ball: BallVector,
  bounds: LocalBallBounds = 'all'
): BallVector {
  let { x, y, vx, vy } = ball;
  x += vx * PHYSICS_DT;
  y += vy * PHYSICS_DT;

  if (x <= BALL_RADIUS) {
    x = BALL_RADIUS;
    vx = Math.abs(vx);
  } else if (x >= 1 - BALL_RADIUS) {
    x = 1 - BALL_RADIUS;
    vx = -Math.abs(vx);
  }

  if (bounds === 'all') {
    if (y <= BALL_RADIUS) {
      y = BALL_RADIUS;
      vy = Math.abs(vy);
    } else if (y >= 1 - BALL_RADIUS) {
      y = 1 - BALL_RADIUS;
      vy = -Math.abs(vy);
    }
  }

  return { ...ball, x, y, vx, vy };
}

export function extrapolateBallForDisplay(
  ball: Pick<BallVector, 'x' | 'y' | 'vx' | 'vy'>,
  elapsedSec: number,
  maxElapsedSec = DISPLAY_EXTRAPOLATE_MAX_S
): { x: number; y: number } {
  const dt = Math.min(Math.max(0, elapsedSec), maxElapsedSec);
  return {
    x: Math.min(1 - BALL_RADIUS_X, Math.max(BALL_RADIUS_X, ball.x + ball.vx * dt)),
    y: Math.min(1, Math.max(0, ball.y + ball.vy * dt)),
  };
}
