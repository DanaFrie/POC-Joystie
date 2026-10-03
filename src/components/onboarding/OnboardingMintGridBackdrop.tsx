'use client';

import { OnboardingKingdomEllipsesBackdrop } from '@/components/onboarding/OnboardingKingdomEllipsesBackdrop';

/** Green + mint glow — before kingdom hero (child screen 2, parent mint-only steps). */
export function OnboardingMintGridBackdrop({
  showGrid = true,
  mintGlow = true,
}: {
  showGrid?: boolean;
  mintGlow?: boolean;
}) {
  return (
    <OnboardingKingdomEllipsesBackdrop
      showKingdom={false}
      mintGlow={mintGlow}
      showGrid={showGrid}
    />
  );
}
