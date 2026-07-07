'use client';

import { useFunnelHeroBleedInsets, useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { BALL_GAME_MINT_ELLIPSE } from '@/constants/child-onboarding-layout';

/**
 * Ellipse 385 — bottom-left mint glow @ Figma top 757.
 * Top-anchored inside canvas (no bleed below) so blur does not form a bottom band.
 */
export function FunnelMintEllipse() {
  const scaleY = useFunnelProportionalTopPx;
  const { bleedX } = useFunnelHeroBleedInsets();
  const ellipse = BALL_GAME_MINT_ELLIPSE;
  const sizePx = scaleY(ellipse.size);
  const blurPx = scaleY(ellipse.blur);
  const topPx = scaleY(ellipse.top);

  return (
    <div
      className="pointer-events-none absolute z-[2]"
      aria-hidden
      style={{
        left: ellipse.left - bleedX,
        top: topPx,
        width: sizePx,
        height: sizePx,
        borderRadius: sizePx,
        background: 'var(--v03-ellipse-385)',
        filter: `blur(${blurPx}px)`,
      }}
    />
  );
}
