'use client';

import nextDynamic from 'next/dynamic';
import { useCallback, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { OnboardingLanding } from '@/components/onboarding/OnboardingLanding';
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

const OnboardingParentFlow = nextDynamic<{ onBackToLanding?: () => void }>(
  () =>
    import('@/components/onboarding/OnboardingParentFlow').then((m) => ({
      default: m.OnboardingParentFlow,
    })),
  { loading: () => <FunnelRouteLoading />, ssr: false }
);

/** `/onboarding` — landing; התחלה continues parent funnel on the same route. */
export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'loading' | 'landing' | 'parent'>('loading');

  useLayoutEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        // Wait for Auth persistence — isAuthenticated() alone used to race and
        // show landing while a completed parent session was still restoring.
        const uid = await getCurrentUserIdAsync();
        if (cancelled) return;

        if (!uid) {
          setPhase(hasParentFlowStarted() ? 'parent' : 'landing');
          return;
        }

        const entry = await resolveOnboardingEntryForAuthenticatedUser(uid);
        if (cancelled) return;

        if (entry.path === '/dashboard') {
          router.replace('/dashboard');
          return;
        }

        // Incomplete logged-in session → parent funnel (resume in-progress step if any)
        setPhase('parent');
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
