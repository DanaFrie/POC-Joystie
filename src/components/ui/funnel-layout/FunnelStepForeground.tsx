'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { FunnelForegroundDistribution } from '@/constants/funnel-vertical-layout';
import {
  FUNNEL_FOREGROUND_PAD_BOTTOM_PX,
  FUNNEL_FOREGROUND_PAD_TOP_PX,
  FUNNEL_SECTION_GAP_MIN_PX,
} from '@/constants/funnel-vertical-layout';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';

type FunnelStepForegroundProps = {
  children: ReactNode;
  className?: string;
  /** Flex distribution for direct children. Default `between` = auto vertical space. */
  distribution?: FunnelForegroundDistribution;
  /** Override top padding (canvas px before scale). */
  padTopPx?: number;
  /** Override bottom padding (canvas px before scale). */
  padBottomPx?: number;
  /** Match foreground height to visible viewport (pair with `FunnelStepRoot fitViewport`). */
  fitViewport?: boolean;
  style?: CSSProperties;
};

const distributionClass: Record<FunnelForegroundDistribution, string> = {
  between: 'justify-between',
  start: 'justify-start',
  center: 'justify-center',
};

/**
 * Foreground column — fills step slot height; gaps flex on short viewports.
 * Background layers stay outside (sibling `FunnelStepBackground` or absolute bleed).
 */
export function FunnelStepForeground({
  children,
  className = '',
  distribution = 'between',
  padTopPx = FUNNEL_FOREGROUND_PAD_TOP_PX,
  padBottomPx = FUNNEL_FOREGROUND_PAD_BOTTOM_PX,
  fitViewport = false,
  style,
}: FunnelStepForegroundProps) {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();

  const heightStyle: CSSProperties | undefined = fitViewport
    ? { height: usableCanvasHeightPx, maxHeight: usableCanvasHeightPx }
    : undefined;

  return (
    <div
      className={`relative z-10 flex min-h-0 w-full flex-col px-v03-gutter ${distributionClass[distribution]} ${
        fitViewport ? '' : 'h-full'
      } ${className}`}
      style={{
        paddingTop: padTopPx,
        paddingBottom: fitViewport
          ? `${padBottomPx}px`
          : `max(${padBottomPx}px, env(safe-area-inset-bottom, 0px))`,
        gap: fitViewport ? FUNNEL_SECTION_GAP_MIN_PX : undefined,
        ...heightStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
