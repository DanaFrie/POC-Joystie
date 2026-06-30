'use client';

import { useEffect } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { CHILD_DORI_TRANSITION_AUTO_MS } from '@/constants/child-onboarding-assets';

/** Brief mint handoff between Dori reveal and mission intro — green + bottom-left glow. */
export function ChildDoriTransitionStep({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, CHILD_DORI_TRANSITION_AUTO_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative h-full w-full overflow-visible bg-transparent" aria-hidden>
      <OnboardingMintGlow />
    </div>
  );
}
