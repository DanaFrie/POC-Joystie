'use client';

import { useLayoutEffect, useRef } from 'react';
import { BALL_DRAW_MS, lerpBallDraw } from '@/lib/game/ballDraw';

type DrawBall = {
  x: number;
  y: number;
};

/** Smooth the sprite toward physics x/y only — does not integrate vx/vy. */
export function usePhysicsBallDraw(
  ball: DrawBall | null,
  active: boolean,
  project: (el: HTMLDivElement, x: number, y: number) => void
) {
  const elRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef(project);
  projectRef.current = project;
  const displayRef = useRef({ x: ball?.x ?? 0.5, y: ball?.y ?? 0.5 });
  const fromRef = useRef({ x: ball?.x ?? 0.5, y: ball?.y ?? 0.5 });
  const toRef = useRef({ x: ball?.x ?? 0.5, y: ball?.y ?? 0.5 });
  const startedAtRef = useRef(0);

  useLayoutEffect(() => {
    if (!ball) return;

    const apply = (x: number, y: number) => {
      displayRef.current = { x, y };
      const el = elRef.current;
      if (!el) return;
      projectRef.current(el, x, y);
    };

    if (!active) {
      apply(ball.x, ball.y);
      return;
    }

    fromRef.current = { ...displayRef.current };
    toRef.current = { x: ball.x, y: ball.y };
    startedAtRef.current = performance.now();
    apply(fromRef.current.x, fromRef.current.y);

    let raf = 0;
    const tick = (now: number) => {
      const pos = lerpBallDraw(
        fromRef.current,
        toRef.current,
        startedAtRef.current,
        now,
        BALL_DRAW_MS
      );
      apply(pos.x, pos.y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ball?.x, ball?.y]);

  return elRef;
}
