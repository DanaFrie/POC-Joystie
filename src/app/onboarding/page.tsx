'use client';

import '@/lib/onboarding/oauthRedirectPrime';
import { useCallback, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLanding } from '@/components/onboarding/OnboardingLanding';
import { OnboardingParentFlow } from '@/components/onboarding/OnboardingParentFlow';
import { resolveOnboardingEntryForAuthenticatedUser } from '@/lib/auth/postLoginNavigation';
import {
  clearParentFlowSession,
  hasParentFlowStarted,
  resetOnboardingParentFlowStart,
} from '@/lib/onboarding/parentFlowSession';
import { getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

export const dynamic = 'force-dynamic';

const logger = createContextLogger('OnboardingPage');

/** `/onboarding` — landing; התחלה continues parent funnel on the same route. */
export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'loading' | 'landing' | 'parent'>('loading');

  useLayoutEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { isAuthenticated } = await import('@/utils/auth');
        const authenticated = await isAuthenticated();

        if (!authenticated) {
          if (cancelled) return;
          setPhase(hasParentFlowStarted() ? 'parent' : 'landing');
          return;
        }

        const uid = await getCurrentUserIdAsync();
        if (!uid || cancelled) return;

        const entry = await resolveOnboardingEntryForAuthenticatedUser(uid);
        if (cancelled) return;

        if (entry.path === '/dashboard') {
          router.replace('/dashboard');
          return;
        }

        if (entry.enterParentFlow || hasParentFlowStarted()) {
          setPhase('parent');
          return;
        }

        setPhase('landing');
      } catch (error) {
        logger.warn('Onboarding auth gate failed — showing landing', error);
        if (!cancelled) {
          setPhase(hasParentFlowStarted() ? 'parent' : 'landing');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleStart = useCallback(() => {
    resetOnboardingParentFlowStart();
    setPhase('parent');
  }, []);

  const handleBackToLanding = useCallback(() => {
    clearParentFlowSession();
    setPhase('landing');
  }, []);

  if (phase === 'loading') {
    return null;
  }

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
