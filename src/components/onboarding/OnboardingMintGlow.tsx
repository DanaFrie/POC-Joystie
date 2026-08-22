'use client';

import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  useFunnelHeroBleedInsets,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';

type OnboardingMintGlowProps = {
  className?: string;
  /**
   * `canvas` — Figma 812 coords (in-funnel steps).
   * `viewport` — bottom-left glow sized to the real screen (waiting / 100svh shells).
   */
  fit?: 'canvas' | 'viewport';
};

/**
 * Ellipse 385 — mint CTA glow (Figma Inspect).
 * Compact viewports: anchor near footer instead of fixed y=757.
 * Always extends through bottom letterbox / safe-area bleed.
 */
export function OnboardingMintGlow({
  className = 'z-[8]',
  fit = 'canvas',
}: OnboardingMintGlowProps) {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const { bottomBleed } = useFunnelHeroBleedInsets();

  if (fit === 'viewport') {
    return (
      <div
        className={`pointer-events-none absolute ${className}`}
        aria-hidden
        style={{
          left: 'max(-26vw, -98px)',
          bottom: 'max(-22vh, -80px)',
          width: 'min(72vw, 320px)',
          height: 'min(72vw, 320px)',
          borderRadius: '50%',
          background: 'var(--v03-ellipse-385)',
          filter: 'blur(150px)',
        }}
      />
    );
  }

  const compact = usableCanvasHeightPx < V03_SCREEN_HEIGHT;
  const bottomExtendPx = Math.max(compact ? 48 : 217, Math.ceil(bottomBleed));

  if (compact) {
    return (
      <div
        className={`pointer-events-none absolute ${className}`}
        aria-hidden
        style={{
          bottom: -bottomExtendPx,
          left: -98,
          width: 272,
          height: 272,
          borderRadius: 272,
          background: 'var(--v03-ellipse-385)',
          filter: 'blur(150px)',
        }}
      />
    );
  }

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      aria-hidden
      style={{
        top: 757,
        right: 201,
        bottom: -bottomExtendPx,
        left: -98,
        borderRadius: 272,
        background: 'var(--v03-ellipse-385)',
        filter: 'blur(150px)',
      }}
    />
  );
}
