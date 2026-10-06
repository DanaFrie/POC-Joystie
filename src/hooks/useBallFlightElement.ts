'use client';

import { useEffect, useRef } from 'react';
import { ballFlightPosition, type FlightBall } from '@/lib/game/ballFlight';

/** Drive a ball node's left/top from velocity between snapshots — no CSS ease. */
export function useBallFlightElement(
  ball: FlightBall | null,
  active: boolean,
  project: (el: HTMLDivElement, x: number, y: number) => void
) {
  const elRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef(project);
  projectRef.current = project;

  useEffect(() => {
    if (!ball) return;
    const snapshot = {
      x: ball.x,
      y: ball.y,
      vx: ball.vx,
      vy: ball.vy,
      updatedAt: ball.updatedAt,
    };

    const apply = (x: number, y: number) => {
      const el = elRef.current;
      if (!el) return;
      projectRef.current(el, x, y);
    };

    if (!active) {
      apply(snapshot.x, snapshot.y);
      return;
    }

    let raf = 0;
    const tick = () => {
      const pos = ballFlightPosition(snapshot);
      apply(pos.x, pos.y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ball?.x, ball?.y, ball?.vx, ball?.vy, ball?.updatedAt]);

  return elRef;
}
