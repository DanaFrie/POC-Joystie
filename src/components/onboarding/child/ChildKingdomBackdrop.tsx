'use client';

import { ChildOnboardingLogo } from '@/components/onboarding/child/ChildOnboardingLogo';
import { OnboardingEllipses } from '@/components/onboarding/OnboardingEllipses';
import { OnboardingKingdom } from '@/components/onboarding/OnboardingKingdom';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';

type ChildKingdomBackdropProps = {
  mintGlow?: boolean;
};

/** Kingdom backdrop — child logo @ top 120 / left 129; mint glow optional (screen 3). */
export function ChildKingdomBackdrop({ mintGlow = false }: ChildKingdomBackdropProps) {
  return (
    <>
      <OnboardingKingdom />
      <OnboardingEllipses />
      <ChildOnboardingLogo />
      {mintGlow && <OnboardingMintGlow />}
    </>
  );
}
