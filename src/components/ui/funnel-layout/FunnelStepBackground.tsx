'use client';

import type { CSSProperties, ReactNode } from 'react';
import { OnboardingGridLayer } from '@/components/onboarding/OnboardingGridLayer';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  useFunnelFullBleed,
  useFunnelHeroBleedInsets,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';

type FunnelStepBackgroundProps = {
  children: ReactNode;
  className?: string;
  /**
   * Keep Figma layers top-anchored @ 812px; extend green into letterbox on tall
   * viewports; clip bottom on short phones (`fitViewport` + compact root).
   */
  preserveCanvasHeight?: boolean;
  /** Grid between green fill and decorative layers (kingdom, ellipses). */
  showGrid?: boolean;
  /** Full-bleed layer above grid (e.g. welcome hero video). */
  fullBleedLayer?: ReactNode;
};

/** Absolute full-bleed layer stack — kingdom, video, ellipses (not in flex flow). */
export function FunnelStepBackground({
  children,
  className = '',
  preserveCanvasHeight = false,
  showGrid = false,
  fullBleedLayer,
}: FunnelStepBackgroundProps) {
  const bleedStyle = useFunnelFullBleed();
  const { bleedY } = useFunnelHeroBleedInsets();
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const isCompactViewport = usableCanvasHeightPx < V03_SCREEN_HEIGHT;

  if (preserveCanvasHeight) {
    const figmaCanvasStyle: CSSProperties = {
      top: bleedY,
      left: 0,
      width: '100%',
      height: V03_SCREEN_HEIGHT,
    };

    const fullBleedLayerStyle: CSSProperties = isCompactViewport
      ? {
          top: bleedY,
          left: 0,
          width: '100%',
          height: usableCanvasHeightPx,
        }
      : { inset: 0 };

    return (
      <div
        className={`pointer-events-none absolute z-0 overflow-visible ${className}`}
        style={bleedStyle}
        aria-hidden
      >
        <div className="absolute inset-0 bg-v03-green-900" />
        {showGrid ? <OnboardingGridLayer /> : null}
        {fullBleedLayer ? (
          <div className="absolute z-[2] overflow-hidden" style={fullBleedLayerStyle}>
            {fullBleedLayer}
          </div>
        ) : null}
        <div
          className={`absolute overflow-visible ${fullBleedLayer ? 'z-[3]' : 'z-[2]'}`}
          style={figmaCanvasStyle}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-visible ${className}`}
      aria-hidden
    >
      {children}
    </div>
  );
}
