'use client';

import type { ReactNode } from 'react';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { CHILD_DORI_MEDIA_FRAME } from '@/constants/child-onboarding-layout';

const FADE_SOLID = '#092125';
const FADE_CLEAR = 'rgba(9, 33, 37, 0)';

type ChildDoriMediaFrameProps = {
  children: ReactNode;
  className?: string;
  /** Figma canvas Y before viewport scale; defaults to `CHILD_DORI_MEDIA_FRAME.top`. */
  top?: number;
  left?: number;
  size?: number;
};

/**
 * Dori hero — 324×324 with edge vignette strips locked to the video frame.
 * Vignette rects scale with the frame so they stay relative to the video.
 */
export function ChildDoriMediaFrame({
  children,
  className = '',
  top,
  left,
  size,
}: ChildDoriMediaFrameProps) {
  const scaleY = useFunnelProportionalTopPx;
  const frame = CHILD_DORI_MEDIA_FRAME;
  const figmaTop = top ?? frame.top;
  const figmaSize = size ?? frame.width;

  const topPx = scaleY(figmaTop);
  const sizePx = scaleY(figmaSize);
  const edgeScale = sizePx / frame.width;

  return (
    <div
      className={`pointer-events-none absolute z-[2] overflow-hidden v03-funnel-enter-1 ${className}`}
      style={{
        left: left ?? `calc(50% - ${sizePx / 2}px)`,
        top: topPx,
        width: sizePx,
        height: sizePx,
      }}
    >
      <div className="relative size-full overflow-hidden">{children}</div>

      <div
        className="pointer-events-none absolute left-0 top-0 z-[3]"
        style={{
          width: sizePx,
          height: frame.edgeTop * edgeScale,
          background: `linear-gradient(180deg, ${FADE_SOLID} 0%, ${FADE_CLEAR} 100%)`,
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute bottom-0 left-0 z-[3]"
        style={{
          width: sizePx,
          height: frame.edgeBottom * edgeScale,
          background: `linear-gradient(0deg, ${FADE_SOLID} 0%, ${FADE_CLEAR} 100%)`,
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute left-0 top-0 z-[3]"
        style={{
          width: frame.edgeSide * edgeScale,
          height: sizePx,
          background: `linear-gradient(90deg, ${FADE_SOLID} 0%, ${FADE_CLEAR} 100%)`,
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute right-0 top-0 z-[3]"
        style={{
          width: frame.edgeSide * edgeScale,
          height: sizePx,
          background: `linear-gradient(270deg, ${FADE_SOLID} 0%, ${FADE_CLEAR} 100%)`,
        }}
        aria-hidden
      />
    </div>
  );
}
