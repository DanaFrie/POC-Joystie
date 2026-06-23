'use client';

import '@/lib/onboarding/oauthRedirectPrime';
import { useCallback, useLayoutEffect, useState } from 'react';
import { OnboardingLanding } from '@/components/onboarding/OnboardingLanding';
import { OnboardingParentFlow } from '@/components/onboarding/OnboardingParentFlow';
import {
  clearParentFlowSession,
  hasParentFlowStarted,
  resetOnboardingParentFlowStart,
} from '@/lib/onboarding/parentFlowSession';

export const dynamic = 'force-dynamic';

/** `/onboarding` — landing; התחלה continues parent funnel on the same route. */
export default function OnboardingPage() {
  const [phase, setPhase] = useState<'landing' | 'parent'>('landing');

  useLayoutEffect(() => {
    if (hasParentFlowStarted()) {
      setPhase('parent');
    }
  }, []);

  const handleStart = useCallback(() => {
    resetOnboardingParentFlowStart();
    setPhase('parent');
  }, []);

  const handleBackToLanding = useCallback(() => {
    clearParentFlowSession();
    setPhase('landing');
  }, []);

  if (phase === 'parent') {
    return (
      <OnboardingParentFlow
        key="parent-flow"
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  return <OnboardingLanding key="landing" onStart={handleStart} />;
}
