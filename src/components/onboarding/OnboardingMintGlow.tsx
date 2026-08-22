'use client';

import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  useFunnelHeroBleedInsets,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';

/** Figma Ellipse 385 @ 812 — disc size, left inset, bleed below canvas. */
const FIGMA_ELLIPSE = {
  size: 272,
  left: -98,
  bleedBelow: 217,
} as const;

type OnboardingMintGlowProps = {
  className?: string;
  /**
   * `canvas` — bottom-left glow scaled to funnel canvas height.
   * `viewport` — vw/vh sizing (waiting / fixed 100svh shells).
   */
  fit?: 'canvas' | 'viewport';
};

/**
 * Ellipse 385 — mint CTA glow.
 * Always bottom-left anchored (never fixed Y=757) so tall/short phones keep
 * the glow behind the footer instead of sitting too low on the artboard.
 */
export function OnboardingMintGlow({
  className = 'z-[8]',
  fit = 'canvas',
}: OnboardingMintGlowProps) {
  const { canvasHeightPx, usableCanvasHeightPx } = useFunnelViewportMetrics();
  const { bottomBleed } = useFunnelHeroBleedInsets();

  if (fit === 'viewport') {
    return (
      <div
        className={`pointer-events-none absolute ${className}`}
        aria-hidden
        style={{
          left: 'max(-26vw, -98px)',
          bottom: 'max(-18svh, -72px)',
          width: 'min(68vw, 300px)',
          height: 'min(68vw, 300px)',
          borderRadius: '50%',
          background: 'var(--v03-ellipse-385)',
          filter: 'blur(150px)',
        }}
      />
    );
  }

  const refH = Math.max(canvasHeightPx, usableCanvasHeightPx, 1);
  const t = Math.min(Math.max(refH / V03_SCREEN_HEIGHT, 0.75), 1.2);
  const size = Math.round(FIGMA_ELLIPSE.size * t);
  const bottomPx = -Math.max(
    Math.round(FIGMA_ELLIPSE.bleedBelow * t),
    Math.ceil(bottomBleed)
  );

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      aria-hidden
      style={{
        bottom: bottomPx,
        left: Math.round(FIGMA_ELLIPSE.left * Math.min(t, 1)),
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--v03-ellipse-385)',
        filter: 'blur(150px)',
      }}
    />
  );
}
