'use client';

import { useEffect, useRef, useState } from 'react';
import { displayBallAfterSnapshot } from '@/lib/game/ballDisplay';
import type { GameBallState } from '@/types/game';

/**
 * Smooth the follower screen (child). Start the coast when *this* device
 * received the snapshot — never from the writer's clock (that rubber-bands).
 */
export function useExtrapolatedBall(
  ball: GameBallState | null,
  active: boolean
): { x: number; y: number } | null {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(
    ball ? { x: ball.x, y: ball.y } : null
  );
  const ballRef = useRef(ball);
  const fromRef = useRef<{ x: number; y: number } | null>(
    ball ? { x: ball.x, y: ball.y } : null
  );
  const displayRef = useRef<{ x: number; y: number } | null>(
    ball ? { x: ball.x, y: ball.y } : null
  );
  const receivedAtRef = useRef(0);
  ballRef.current = ball;

  useEffect(() => {
    if (!active || !ball) {
      const next = ball ? { x: ball.x, y: ball.y } : null;
      fromRef.current = next;
      displayRef.current = next;
      receivedAtRef.current = 0;
      setPos(next);
      return;
    }

    fromRef.current = displayRef.current ?? { x: ball.x, y: ball.y };
    receivedAtRef.current = Date.now();

    let raf = 0;
    const loop = () => {
      const current = ballRef.current;
      const from = fromRef.current;
      if (!current || !from) return;
      const next = displayBallAfterSnapshot({
        ball: current,
        from,
        receivedAtMs: receivedAtRef.current,
        nowMs: Date.now(),
      });
      displayRef.current = next;
      setPos(next);
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [active, ball?.updatedAt, ball?.x, ball?.y, ball?.vx, ball?.vy]);

  return pos;
}
