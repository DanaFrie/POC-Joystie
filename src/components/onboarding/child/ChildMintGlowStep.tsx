'use client';

import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';

/** Screen 2 — green canvas + grid + Ellipse 385 (bottom-left mint glow). */
export function ChildMintGlowStep() {
  return (
    <FunnelStepRoot fillViewport aria-hidden className="overflow-hidden bg-v03-green-900">
      <OnboardingMintGridBackdrop />
    </FunnelStepRoot>
  );
}
