'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { OnboardingLanding } from '@/components/onboarding/OnboardingLanding';
import { OnboardingParentFlow } from '@/components/onboarding/OnboardingParentFlow';
import {
  consumeLoggedInDestination,
  prefetchDashboardData,
  resolveOnboardingEntryForAuthenticatedUser,
} from '@/lib/auth/postLoginNavigation';
import {
  clearParentFlowSession,
  hasParentFlowStarted,
  resetOnboardingParentFlowStart,
} from '@/lib/onboarding/parentFlowSession';
import { getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';
import {
  hideSessionWaiter,
  showSessionWaiter,
} from '@/lib/auth/sessionRouteWaiter';

export const dynamic = 'force-dynamic';

const logger = createContextLogger('OnboardingPage');

/** `/onboarding` — landing; logged-in session routes to dashboard or signupIntro. */
export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'loading' | 'landing' | 'parent'>('loading');

  useLayoutEffect(() => {
    showSessionWaiter();
    let cancelled = false;

    void (async () => {
      try {
        const uid = await getCurrentUserIdAsync();
        if (cancelled) return;

        if (!uid) {
          hideSessionWaiter();
          setPhase(hasParentFlowStarted() ? 'parent' : 'landing');
          return;
        }

        const pending = consumeLoggedInDestination();
        if (pending === '/onboarding') {
          hideSessionWaiter();
          setPhase('parent');
          return;
        }
        if (pending === '/dashboard') {
          await prefetchDashboardData(uid);
          if (cancelled) return;
          router.replace('/dashboard');
          return;
        }

        const entry = await resolveOnboardingEntryForAuthenticatedUser(uid);
        if (cancelled) return;

        if (entry.path === '/dashboard') {
          await prefetchDashboardData(uid);
          if (cancelled) return;
          router.replace('/dashboard');
          return;
        }

        hideSessionWaiter();
        setPhase('parent');
      } catch (error) {
        logger.warn('Onboarding auth gate failed — showing landing', error);
        if (!cancelled) {
          hideSessionWaiter();
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
    return <FunnelRouteLoading />;
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
