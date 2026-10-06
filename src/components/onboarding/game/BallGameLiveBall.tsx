'use client';

import { useLayoutEffect, useRef } from 'react';
import { BallGameCourtBall } from '@/components/onboarding/game/BallGameCourtBall';
import { extrapolateBallForDisplay } from '@/lib/game/localBallMotion';
import type { BallVector } from '@/lib/game/physics';

type BallGameLiveBallProps = {
  ball: BallVector;
  sizePx: number;
  animate: boolean;
  toPixel: (x: number, y: number) => { left: number; top: number };
};

/** Paints the court ball; while playing, keeps sliding with last vx/vy between snapshots. */
export function BallGameLiveBall({
  ball,
  sizePx,
  animate,
  toPixel,
}: BallGameLiveBallProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const origin = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy };
    const apply = (x: number, y: number) => {
      const pos = toPixel(x, y);
      el.style.left = `${pos.left}px`;
      el.style.top = `${pos.top}px`;
    };

    apply(origin.x, origin.y);
    if (!animate) return;

    const started = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const next = extrapolateBallForDisplay(origin, (now - started) / 1000);
      apply(next.x, next.y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, ball.x, ball.y, ball.vx, ball.vy, sizePx, toPixel]);

  return (
    <div
      ref={elRef}
      className="pointer-events-none absolute z-[8] -translate-x-1/2 -translate-y-1/2"
      style={{ width: sizePx, height: sizePx }}
    >
      <BallGameCourtBall sizePx={sizePx} />
    </div>
  );
}
