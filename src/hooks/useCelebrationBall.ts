'use client';

import { useEffect, useState } from 'react';
import { BALL_RADIUS, type BallVector } from '@/lib/game/physics';

const STEP_DT = 0.03;

function stepWallBounce(ball: BallVector): BallVector {
  let { x, y, vx, vy } = ball;
  x += vx * STEP_DT;
  y += vy * STEP_DT;

  if (x <= BALL_RADIUS) {
    x = BALL_RADIUS;
    vx = Math.abs(vx);
  } else if (x >= 1 - BALL_RADIUS) {
    x = 1 - BALL_RADIUS;
    vx = -Math.abs(vx);
  }

  if (y <= BALL_RADIUS) {
    y = BALL_RADIUS;
    vy = Math.abs(vy);
  } else if (y >= 1 - BALL_RADIUS) {
    y = 1 - BALL_RADIUS;
    vy = -Math.abs(vy);
  }

  return { ...ball, x, y, vx, vy };
}

/** Local wall-bounce motion after cooperative win — ball keeps moving while UI fades. */
export function useCelebrationBall(initial: BallVector | null, active: boolean) {
  const [ball, setBall] = useState<BallVector | null>(null);

  useEffect(() => {
    if (!active) {
      setBall(null);
      return;
    }
    if (!initial) return;

    setBall(initial);
    const id = window.setInterval(() => {
      setBall((current) => (current ? stepWallBounce(current) : current));
    }, 50);

    return () => window.clearInterval(id);
  }, [active, initial?.x, initial?.y, initial?.vx, initial?.vy]);

  return ball;
}
