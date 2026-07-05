'use client';

import type { ReactNode } from 'react';
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
  'aria-label'?: string;
  /** Shrink canvas + root to visible viewport height (no outer scroll on short phones). */
  fitViewport?: boolean;
};

/** Step root — holds background + foreground siblings. */
export function FunnelStepRoot({
  children,
  className = '',
  'aria-label': ariaLabel,
  fitViewport = false,
}: FunnelStepRootProps) {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const isCompactViewport = usableCanvasHeightPx < V03_SCREEN_HEIGHT;

  useLayoutEffect(() => {
    if (!fitViewport) {
      return undefined;
    }

    const funnelRoot = document.querySelector('[data-v03-funnel]');
    if (!(funnelRoot instanceof HTMLElement)) {
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
  }, [fitViewport, usableCanvasHeightPx]);

  const heightStyle = fitViewport
    ? { height: usableCanvasHeightPx, maxHeight: usableCanvasHeightPx }
    : undefined;

  return (
    <div
      dir="rtl"
      className={`relative w-full min-h-0 ${
        fitViewport && isCompactViewport ? 'overflow-hidden' : 'overflow-visible'
      } ${fitViewport ? '' : 'h-full'} ${className}`}
      style={heightStyle}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
