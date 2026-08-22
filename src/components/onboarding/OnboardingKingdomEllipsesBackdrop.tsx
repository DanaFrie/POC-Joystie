'use client';

import { OnboardingEllipses } from '@/components/onboarding/OnboardingEllipses';
import { OnboardingKingdom } from '@/components/onboarding/OnboardingKingdom';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { FunnelStepBackground } from '@/components/ui/funnel-layout';

type OnboardingKingdomEllipsesBackdropProps = {
  mintGlow?: boolean;
  /** Kingdom + ellipses layers (child screen 3+). */
  showKingdom?: boolean;
  /** Wrap kingdom group in `v03-funnel-enter-0` on first reveal. */
  kingdomEnter?: boolean;
  /** In-canvas grid — off on child kingdom phases 2–4. */
  showGrid?: boolean;
};

/**
 * Green + grid + optional mint / kingdom / ellipses.
 * Mint glow is full-bleed (scales with viewport); kingdom stays on 812 Figma canvas.
 */
export function OnboardingKingdomEllipsesBackdrop({
  mintGlow = true,
  showKingdom = true,
  kingdomEnter = false,
  showGrid = true,
}: OnboardingKingdomEllipsesBackdropProps) {
  const kingdomLayers = (
    <>
      <OnboardingKingdom />
      <OnboardingEllipses />
    </>
  );

  return (
    <FunnelStepBackground
      preserveCanvasHeight
      showGrid={showGrid}
      fullBleedLayer={mintGlow ? <OnboardingMintGlow /> : null}
    >
      {showKingdom ? (
        kingdomEnter ? (
          <div className="v03-funnel-enter-0">{kingdomLayers}</div>
        ) : (
          kingdomLayers
        )
      ) : null}
    </FunnelStepBackground>
  );
}
