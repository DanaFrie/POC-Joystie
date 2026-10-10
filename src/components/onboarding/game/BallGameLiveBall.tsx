'use client';

import { useLayoutEffect, useRef } from 'react';
import { BallGameCourtBall } from '@/components/onboarding/game/BallGameCourtBall';
import { projectBallFlight, type FlightBall, type FlightPaddles } from '@/lib/game/ballFlight';
import type { BallVector } from '@/lib/game/physics';

type BallGameLiveBallProps = {
  ball: BallVector & { updatedAt?: string };
  paddles?: FlightPaddles;
  sizePx: number;
  animate: boolean;
  toPixel: (x: number, y: number) => { left: number; top: number };
};

/** Paints the court ball and keeps it moving between physics / RTDB snapshots. */
export function BallGameLiveBall({
  ball,
  paddles,
  sizePx,
  animate,
  toPixel,
}: BallGameLiveBallProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const toPixelRef = useRef(toPixel);
  toPixelRef.current = toPixel;
  const paddlesRef = useRef(paddles);
  paddlesRef.current = paddles;

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const snapshot: FlightBall = {
      x: ball.x,
      y: ball.y,
      vx: ball.vx,
      vy: ball.vy,
      updatedAt: ball.updatedAt,
    };
    const receivedAt = Date.now();

    const apply = (x: number, y: number) => {
      const pos = toPixelRef.current(x, y);
      el.style.left = `${pos.left}px`;
      el.style.top = `${pos.top}px`;
    };

    if (!animate) {
      apply(snapshot.x, snapshot.y);
      return;
    }

    let raf = 0;
    const tick = () => {
      const next = projectBallFlight(
        snapshot,
        Date.now(),
        receivedAt,
        undefined,
        paddlesRef.current
      );
      apply(next.x, next.y);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [animate, ball.x, ball.y, ball.vx, ball.vy, ball.updatedAt, sizePx]);

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
