import { BALL_RADIUS, PHYSICS_DT, type BallVector } from '@/lib/game/physics';

export type LocalBallBounds = 'all' | 'sides';

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
