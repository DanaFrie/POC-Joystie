'use client';

import type { CSSProperties, ReactNode } from 'react';
import { ChildDoriSpeechTail } from '@/components/onboarding/child/ChildDoriSpeechTail';

const BUBBLE_STYLE = {
  paddingLeft: 20,
  paddingRight: 20,
  borderRadius: 16,
  outline: '2px solid #FFF',
  background: 'rgba(255, 255, 255, 0.10)',
  backdropBlur: 11.41,
  boxShadow: '0 5.493px 5.493px rgba(0, 0, 0, 0.25)',
} as const;

const TAIL_WIDTH = 34;

export type ChildSpeechBubbleAppearance = {
  paddingLeft?: number;
  paddingRight?: number;
  borderRadius?: number;
  border?: string;
  background?: string;
  backdropBlur?: number;
  boxShadow?: string;
  gap?: number;
  useBorder?: boolean;
};

/** Frosted speech bubble — dark funnel screens 6 & 8+. */
export function ChildSpeechBubble({
  children,
  className = '',
  style,
  width,
  top,
  left,
  tailLeft = 32,
  tailRight,
  tailBorderOverlap = 0,
  tailPosition = 'bottom',
  paddingTop,
  paddingBottom,
  appearance,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  width: number;
  top: number;
  left?: number;
  /** Tail offset from bubble left (Figma 13656 — 32px). */
  tailLeft?: number;
  /** When set, positions tail from bubble right instead of left (327px mission intro). */
  tailRight?: number;
  /** Overlap into bubble bottom (0 = flush at bottom edge). */
  tailBorderOverlap?: number;
  tailPosition?: 'bottom' | 'side';
  paddingTop?: number;
  paddingBottom?: number;
  appearance?: ChildSpeechBubbleAppearance;
}) {
  const resolvedPaddingTop = paddingTop ?? 16;
  const resolvedPaddingBottom = paddingBottom ?? 14;
  const resolvedPaddingLeft = appearance?.paddingLeft ?? BUBBLE_STYLE.paddingLeft;
  const resolvedPaddingRight = appearance?.paddingRight ?? BUBBLE_STYLE.paddingRight;
  const resolvedGap = appearance?.gap ?? 20.89;
  const resolvedBorderRadius = appearance?.borderRadius ?? BUBBLE_STYLE.borderRadius;
  const resolvedBackground = appearance?.background ?? BUBBLE_STYLE.background;
  const resolvedBoxShadow = appearance?.boxShadow ?? BUBBLE_STYLE.boxShadow;
  const resolvedBackdropBlur = appearance?.backdropBlur ?? BUBBLE_STYLE.backdropBlur;
  const useBorder = appearance?.useBorder ?? Boolean(appearance?.border);

  const tailStyle: CSSProperties =
    tailPosition === 'bottom'
      ? {
          top: `calc(100% - ${tailBorderOverlap}px)`,
          ...(tailRight != null
            ? { right: tailRight, left: 'auto' }
            : { left: tailLeft }),
        }
      : {
          top: `calc(100% - ${tailBorderOverlap}px)`,
          ...(tailRight != null
            ? { right: tailRight, left: 'auto' }
            : { left: tailLeft }),
        };

  return (
    <div
      className={`absolute z-[5] box-border flex flex-col items-center justify-center pointer-events-none ${className}`}
      style={{
        top,
        left: left ?? `calc(50% - ${width / 2}px)`,
        width,
        paddingTop: resolvedPaddingTop,
        paddingBottom: resolvedPaddingBottom,
        paddingLeft: resolvedPaddingLeft,
        paddingRight: resolvedPaddingRight,
        gap: resolvedGap,
        borderRadius: resolvedBorderRadius,
        ...(useBorder
          ? { border: appearance?.border ?? '2px solid #FFF', outline: 'none' }
          : { outline: BUBBLE_STYLE.outline, outlineOffset: 0 }),
        background: resolvedBackground,
        boxShadow: resolvedBoxShadow,
        backdropFilter: `blur(${resolvedBackdropBlur}px)`,
        WebkitBackdropFilter: `blur(${resolvedBackdropBlur}px)`,
        ...style,
      }}
    >
      {children}
      <ChildDoriSpeechTail
        className="pointer-events-none absolute"
        style={{ ...tailStyle, width: TAIL_WIDTH }}
      />
    </div>
  );
}