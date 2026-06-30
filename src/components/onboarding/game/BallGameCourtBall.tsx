'use client';

import { BALL_GAME_COURT_BALL_SIZE } from '@/lib/game/ballGameCourt';

/** In-court play ball — Figma layered ellipses (not fireball.webp). */
export { BALL_GAME_COURT_BALL_SIZE };

export function BallGameCourtBall() {
  return (
    <div
      className="pointer-events-none relative overflow-visible"
      style={{ width: BALL_GAME_COURT_BALL_SIZE, height: BALL_GAME_COURT_BALL_SIZE }}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 54,
          height: 54,
          background: 'rgba(239, 61, 14, 0.60)',
          filter: 'blur(5.800000190734863px)',
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FAD733]"
        style={{ width: 44, height: 44 }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F8A313]"
        style={{ width: 30, height: 30 }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FC850E]"
        style={{ width: 12, height: 12 }}
      />
    </div>
  );
}
