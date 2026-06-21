'use client';

import '@/lib/onboarding/oauthRedirectPrime';
import { useCallback, useState } from 'react';
import { OnboardingLanding } from '@/components/onboarding/OnboardingLanding';
import { OnboardingParentFlow } from '@/components/onboarding/OnboardingParentFlow';
import {
  hasParentFlowStarted,
  resetOnboardingParentFlowStart,
} from '@/lib/onboarding/parentFlowSession';

export const dynamic = 'force-dynamic';

function readInitialPhase(): 'landing' | 'parent' {
  if (typeof window === 'undefined') return 'landing';
  return hasParentFlowStarted() ? 'parent' : 'landing';
}

/** `/onboarding` — landing; התחלה continues parent funnel on the same route. */
export default function OnboardingPage() {
  const [phase, setPhase] = useState<'landing' | 'parent'>(readInitialPhase);

  const handleStart = useCallback(() => {
    resetOnboardingParentFlowStart();
    setPhase('parent');
  }, []);

  if (phase === 'parent') {
    return <OnboardingParentFlow />;
  }

  return <OnboardingLanding onStart={handleStart} />;
}
