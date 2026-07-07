'use client';

import { BALL_GAME_COURT_BALL_SIZE } from '@/lib/game/ballGameCourt';

/** In-court play ball — Figma layered ellipses (not fireball.webp). */
export { BALL_GAME_COURT_BALL_SIZE };

type BallGameCourtBallProps = {
  /** Rendered diameter — defaults to Figma 44px @ 812. */
  sizePx?: number;
};

/** Figma layered ellipses — 54 glow, 44 / 30 / 12 rings (scale together). */
export function BallGameCourtBall({ sizePx = BALL_GAME_COURT_BALL_SIZE }: BallGameCourtBallProps) {
  const scale = sizePx / BALL_GAME_COURT_BALL_SIZE;
  const glow = 54 * scale;
  const outer = 44 * scale;
  const mid = 30 * scale;
  const core = 12 * scale;
  const blur = 5.8 * scale;

  return (
    <div
      className="pointer-events-none relative overflow-visible"
      style={{ width: sizePx, height: sizePx }}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: glow,
          height: glow,
          background: 'rgba(239, 61, 14, 0.60)',
          filter: `blur(${blur}px)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FAD733]"
        style={{ width: outer, height: outer }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F8A313]"
        style={{ width: mid, height: mid }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FC850E]"
        style={{ width: core, height: core }}
      />
    </div>
  );
}
