'use client';

import { OnboardingCopy } from '@/components/onboarding/OnboardingCopy';
import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingLoginRow } from '@/components/onboarding/OnboardingLoginRow';
import { OnboardingEllipses } from '@/components/onboarding/OnboardingEllipses';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { OnboardingKingdom } from '@/components/onboarding/OnboardingKingdom';
import { OnboardingLogo } from '@/components/onboarding/OnboardingLogo';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';

type OnboardingLandingProps = {
  onStart: () => void;
};

/** Step 1 — landing only (`/onboarding`). */
export function OnboardingLanding({ onStart }: OnboardingLandingProps) {
  return (
    <>
      <OnboardingGrid />
      <OnboardingKingdom />
      <OnboardingEllipses />
      <OnboardingLogo />
      <OnboardingMintGlow />
      <OnboardingCopy />
      <OnboardingCta onStart={onStart} />
      <OnboardingLoginRow />
    </>
  );
}
