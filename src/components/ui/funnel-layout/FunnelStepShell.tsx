'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { FUNNEL_SECTION_GAP_MIN_PX } from '@/constants/funnel-vertical-layout';
import { V03_ACTIVE_CANVAS_HEIGHT_VAR } from '@/constants/funnel-vertical-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';

type FunnelFlexibleGapProps = {
  className?: string;
};

/** Explicit rubber band — grows/shrinks between foreground sections. */
export function FunnelFlexibleGap({ className = '' }: FunnelFlexibleGapProps) {
  return (
    <div
      className={`min-h-0 w-full flex-1 shrink ${className}`}
      style={{ minHeight: FUNNEL_SECTION_GAP_MIN_PX }}
      aria-hidden
    />
  );
}

type FunnelStepSectionProps = {
  children: ReactNode;
  className?: string;
};

/** Fixed-height foreground block (hero, copy cluster, form header). */
export function FunnelStepSection({ children, className = '' }: FunnelStepSectionProps) {
  return <div className={`w-full shrink-0 ${className}`}>{children}</div>;
}

type FunnelStepRootProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  /** Shrink canvas + root to visible viewport height (no outer scroll on short phones). */
  fitViewport?: boolean;
  /**
   * Lock canvas + root to exactly 100vh (grow on tall phones, shrink on short).
   * Use for full-bleed media (selfie castle) — no letterbox, no page scroll.
   */
  fillViewport?: boolean;
};

/** Exact canvas px for one viewport tall (`100vh` / `100dvh`). */
function viewportFillCanvasHeightPx(viewportHeight: number, scale: number): number {
  return Math.max(1, Math.round(viewportHeight / Math.max(scale, 0.0001)));
}

/** Step root — holds background + foreground siblings. */
export function FunnelStepRoot({
  children,
  className = '',
  style,
  'aria-label': ariaLabel,
  fitViewport = false,
  fillViewport = false,
}: FunnelStepRootProps) {
  const { usableCanvasHeightPx, viewportHeight, scale } = useFunnelViewportMetrics();
  const isCompactViewport = usableCanvasHeightPx < V03_SCREEN_HEIGHT;
  const fillCanvasHeightPx = viewportFillCanvasHeightPx(viewportHeight, scale);
  const activeFit = fitViewport && !fillViewport;

  useLayoutEffect(() => {
    const funnelRoot = document.querySelector('[data-v03-funnel]');
    if (!(funnelRoot instanceof HTMLElement)) {
      return undefined;
    }

    if (fillViewport) {
      funnelRoot.style.setProperty(
        V03_ACTIVE_CANVAS_HEIGHT_VAR,
        `${fillCanvasHeightPx}px`
      );
      window.dispatchEvent(new Event('resize'));
      return () => {
        funnelRoot.style.removeProperty(V03_ACTIVE_CANVAS_HEIGHT_VAR);
        window.dispatchEvent(new Event('resize'));
      };
    }

    if (!activeFit) {
      return undefined;
    }

    funnelRoot.style.setProperty(
      V03_ACTIVE_CANVAS_HEIGHT_VAR,
      `${usableCanvasHeightPx}px`
    );
    window.dispatchEvent(new Event('resize'));

    return () => {
      funnelRoot.style.removeProperty(V03_ACTIVE_CANVAS_HEIGHT_VAR);
      window.dispatchEvent(new Event('resize'));
    };
  }, [activeFit, fillViewport, fillCanvasHeightPx, usableCanvasHeightPx]);

  const heightStyle = fillViewport
    ? { height: fillCanvasHeightPx, minHeight: fillCanvasHeightPx, maxHeight: fillCanvasHeightPx }
    : activeFit
      ? isCompactViewport
        ? { height: usableCanvasHeightPx, maxHeight: usableCanvasHeightPx }
        : { height: '100%', minHeight: usableCanvasHeightPx }
      : undefined;

  return (
    <div
      dir="rtl"
      className={`relative w-full min-h-0 ${
        fillViewport || (activeFit && isCompactViewport)
          ? 'overflow-hidden'
          : 'overflow-visible'
      } ${fillViewport || (activeFit && !isCompactViewport) || !activeFit ? 'h-full' : ''} ${className}`}
      style={{ ...heightStyle, ...style }}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
