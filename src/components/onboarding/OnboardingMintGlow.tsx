'use client';

import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';

/**
 * Ellipse 385 — mint CTA glow (Figma Inspect).
 * Compact viewports: anchor near footer instead of fixed y=757.
 */
export function OnboardingMintGlow({ className = 'z-[8]' }: { className?: string }) {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const compact = usableCanvasHeightPx < V03_SCREEN_HEIGHT;

  if (compact) {
    return (
      <div
        className={`pointer-events-none absolute ${className}`}
        aria-hidden
        style={{
          bottom: -48,
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
        bottom: -217,
        left: -98,
        borderRadius: 272,
        background: 'var(--v03-ellipse-385)',
        filter: 'blur(150px)',
      }}
    />
  );
}
