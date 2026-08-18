'use client';

import { OnboardingKingdomEllipsesBackdrop } from '@/components/onboarding/OnboardingKingdomEllipsesBackdrop';
import { ChildOnboardingLogo } from '@/components/onboarding/child/ChildOnboardingLogo';

type ChildKingdomBackdropProps = {
  mintGlow?: boolean;
};

/** Kingdom backdrop — child logo @ top 120 / left 129; mint glow optional (screen 3). */
export function ChildKingdomBackdrop({ mintGlow = false }: ChildKingdomBackdropProps) {
  return (
    <>
      <OnboardingKingdomEllipsesBackdrop mintGlow={mintGlow} />
      <ChildOnboardingLogo />
    </>
  );
}
