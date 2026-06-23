'use client';

import { OnboardingCopy } from '@/components/onboarding/OnboardingCopy';
import { OnboardingEllipses } from '@/components/onboarding/OnboardingEllipses';
import { OnboardingFooterCta } from '@/components/onboarding/OnboardingFooterCta';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { OnboardingKingdom } from '@/components/onboarding/OnboardingKingdom';
import { OnboardingLogo } from '@/components/onboarding/OnboardingLogo';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { resetOnboardingParentFlowStart } from '@/lib/onboarding/parentFlowSession';

type OnboardingLandingProps = {
  onStart: () => void;
};

/** Step 1 — landing only (`/onboarding`). */
export function OnboardingLanding({ onStart }: OnboardingLandingProps) {
  const handleStart = () => {
    resetOnboardingParentFlowStart();
    onStart();
  };

  return (
    <>
      <OnboardingGrid />
      <OnboardingKingdom />
      <OnboardingEllipses />
      <OnboardingLogo />
      <OnboardingMintGlow />
      <OnboardingCopy />
      <OnboardingFooterCta
        layout="landing"
        variant="primary"
        showLoginLink
        onClick={handleStart}
      >
        התחלה
      </OnboardingFooterCta>
    </>
  );
}
