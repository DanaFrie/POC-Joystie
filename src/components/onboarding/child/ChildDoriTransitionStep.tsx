'use client';

import { useEffect } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { CHILD_DORI_TRANSITION_AUTO_MS } from '@/constants/child-onboarding-assets';

/** Screen 7 — brief mint handoff between Dori reveal and mission intro. */
export function ChildDoriTransitionStep({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, CHILD_DORI_TRANSITION_AUTO_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <FunnelStepRoot fillViewport aria-hidden className="overflow-hidden bg-v03-green-900">
      <OnboardingMintGlow />
    </FunnelStepRoot>
  );
}
