'use client';

import nextDynamic from 'next/dynamic';
import { Suspense } from 'react';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { ChildInvalidInviteStep } from '@/components/onboarding/child/ChildInvalidInviteStep';
import { useChildBondingBootstrap } from '@/hooks/useChildBondingBootstrap';
import { useChildInviteAccess } from '@/hooks/useChildInviteAccess';

export const dynamic = 'force-dynamic';

const OnboardingChildFlow = nextDynamic(
  () =>
    import('@/components/onboarding/OnboardingChildFlow').then((m) => ({
      default: m.OnboardingChildFlow,
    })),
  { loading: () => <FunnelRouteLoading />, ssr: false }
);

function OnboardingChildPageInner() {
  const access = useChildInviteAccess();

  useChildBondingBootstrap(access.status === 'ready' ? access : null);

  if (access.status === 'loading') {
    return <FunnelRouteLoading />;
  }

  if (access.status === 'invalid') {
    return (
      <ChildInvalidInviteStep
        title="הקישור לא תקין"
        detail="בקשו מההורה לשלוח את הלינק פעם נוספת"
      />
    );
  }

  if (access.status === 'expired') {
    return (
      <ChildInvalidInviteStep
        title="הקישור פג תוקף"
        detail="בקשו מההורה לשלוח את הלינק פעם נוספת"
      />
    );
  }

  if (access.status === 'missing') {
    return (
      <ChildInvalidInviteStep
        title="הקישור לא תקין"
        detail="בקשו מההורה לשלוח את הלינק פעם נוספת"
      />
    );
  }

  return <OnboardingChildFlow />;
}

/** `/onboarding/child` — kid onboarding funnel (bonding invite). */
export default function OnboardingChildPage() {
  return (
    <Suspense fallback={<FunnelRouteLoading />}>
      <OnboardingChildPageInner />
    </Suspense>
  );
}
