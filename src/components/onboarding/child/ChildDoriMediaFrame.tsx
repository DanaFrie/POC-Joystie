'use client';

import type { ReactNode } from 'react';
import { CHILD_DORI_MEDIA_FRAME } from '@/constants/child-onboarding-layout';

const FADE_SOLID = '#092125';
const FADE_CLEAR = 'rgba(9, 33, 37, 0)';

type ChildDoriMediaFrameProps = {
  children: ReactNode;
  className?: string;
};

/** Dori hero — 324×324 @ left 27 top 271 with edge vignette strips (Figma 13656:6594 / 6740). */
export function ChildDoriMediaFrame({ children, className = '' }: ChildDoriMediaFrameProps) {
  const frame = CHILD_DORI_MEDIA_FRAME;

  return (
    <div
      className={`pointer-events-none absolute z-[2] overflow-hidden ${className}`}
      style={{
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height,
      }}
    >
      <div className="relative size-full overflow-hidden">{children}</div>

      {/* Upper — dark at top edge, fades down */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-[3]"
        style={{
          width: frame.width,
          height: frame.edgeTop,
          background: `linear-gradient(180deg, ${FADE_SOLID} 0%, ${FADE_CLEAR} 100%)`,
        }}
        aria-hidden
      />

      {/* Lower — dark at bottom edge, fades up */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-[3]"
        style={{
          width: frame.width,
          height: frame.edgeBottom,
          background: `linear-gradient(0deg, ${FADE_SOLID} 0%, ${FADE_CLEAR} 100%)`,
        }}
        aria-hidden
      />

      {/* Left — dark at left edge, fades right */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-[3]"
        style={{
          width: frame.edgeSide,
          height: frame.height,
          background: `linear-gradient(90deg, ${FADE_SOLID} 0%, ${FADE_CLEAR} 100%)`,
        }}
        aria-hidden
      />

      {/* Right — dark at right edge, fades left */}
      <div
        className="pointer-events-none absolute right-0 top-0 z-[3]"
        style={{
          width: frame.edgeSide,
          height: frame.height,
          background: `linear-gradient(270deg, ${FADE_SOLID} 0%, ${FADE_CLEAR} 100%)`,
        }}
        aria-hidden
      />
    </div>
  );
}
