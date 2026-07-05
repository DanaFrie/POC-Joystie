'use client';

import { OnboardingEllipses } from '@/components/onboarding/OnboardingEllipses';
import { OnboardingKingdom } from '@/components/onboarding/OnboardingKingdom';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { FunnelStepBackground } from '@/components/ui/funnel-layout';

type OnboardingKingdomEllipsesBackdropProps = {
  mintGlow?: boolean;
};

/**
 * Kingdom hero + ellipses 387/388 — top-anchored @ 812px Figma canvas;
 * green bleed extends on tall viewports (S20); clipped on short (SE).
 */
export function OnboardingKingdomEllipsesBackdrop({
  mintGlow = true,
}: OnboardingKingdomEllipsesBackdropProps) {
  return (
    <FunnelStepBackground preserveCanvasHeight showGrid>
      <OnboardingKingdom />
      <OnboardingEllipses />
      {mintGlow ? <OnboardingMintGlow /> : null}
    </FunnelStepBackground>
  );
}
