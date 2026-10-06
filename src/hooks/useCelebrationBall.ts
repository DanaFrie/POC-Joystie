'use client';

import { useEffect, useState } from 'react';
import { stepLocalBall } from '@/lib/game/localBallMotion';
import type { BallVector } from '@/lib/game/physics';

const STEP_MS = 50;

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
      setBall((current) => (current ? stepLocalBall(current, 'all') : current));
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [active, initial?.x, initial?.y, initial?.vx, initial?.vy]);

  return ball;
}
