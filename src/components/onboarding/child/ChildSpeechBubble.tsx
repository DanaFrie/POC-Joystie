'use client';

import type { CSSProperties, ReactNode } from 'react';
import { ChildDoriSpeechTail } from '@/components/onboarding/child/ChildDoriSpeechTail';

const BUBBLE_STYLE = {
  paddingTop: 16.7,
  paddingBottom: 12.99,
  paddingLeft: 20.89,
  paddingRight: 20.89,
  borderRadius: 16,
  outline: '2px solid #FFF',
  background: 'rgba(255, 255, 255, 0.10)',
  backdropBlur: 11.41,
  boxShadow: '0 5.493px 5.493px rgba(0, 0, 0, 0.25)',
} as const;

/** Frosted speech bubble — dark funnel screens 6 & 8. */
export function ChildSpeechBubble({
  children,
  className = '',
  style,
  width,
  top,
  left,
  tailLeft = 34.22,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  width: number;
  top: number;
  left?: number;
  tailLeft?: number;
}) {
  return (
    <div
      className={`absolute z-10 flex items-center justify-center box-border ${className}`}
      style={{
        top,
        left: left ?? `calc(50% - ${width / 2}px)`,
        width,
        paddingTop: BUBBLE_STYLE.paddingTop,
        paddingBottom: BUBBLE_STYLE.paddingBottom,
        paddingLeft: BUBBLE_STYLE.paddingLeft,
        paddingRight: BUBBLE_STYLE.paddingRight,
        borderRadius: BUBBLE_STYLE.borderRadius,
        outline: BUBBLE_STYLE.outline,
        outlineOffset: 0,
        background: BUBBLE_STYLE.background,
        boxShadow: BUBBLE_STYLE.boxShadow,
        backdropFilter: `blur(${BUBBLE_STYLE.backdropBlur}px)`,
        WebkitBackdropFilter: `blur(${BUBBLE_STYLE.backdropBlur}px)`,
        ...style,
      }}
    >
      {children}
      <ChildDoriSpeechTail
        className="pointer-events-none absolute"
        style={{ left: tailLeft, top: '100%', marginTop: 2 }}
      />
    </div>
  );
}
