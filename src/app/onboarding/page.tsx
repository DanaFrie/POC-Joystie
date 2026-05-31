'use client';

import { OnboardingCopy } from '@/components/onboarding/OnboardingCopy';
import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingLoginRow } from '@/components/onboarding/OnboardingLoginRow';
import { OnboardingEllipses } from '@/components/onboarding/OnboardingEllipses';
import { OnboardingKingdom } from '@/components/onboarding/OnboardingKingdom';
import { OnboardingLogo } from '@/components/onboarding/OnboardingLogo';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';

export const dynamic = 'force-dynamic';

/** Step 1 — mobile layers only (grid + desktop banner from layout). */
export default function OnboardingPage() {
  return (
    <>
      <OnboardingKingdom />
      <OnboardingEllipses />
      <OnboardingLogo />
      <OnboardingMintGlow />
      <OnboardingCopy />
      <OnboardingCta />
      <OnboardingLoginRow />
    </>
  );
}
