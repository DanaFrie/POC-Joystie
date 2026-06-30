'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { OnboardingChildFlow } from '@/components/onboarding/OnboardingChildFlow';
import { ChildInvalidInviteStep } from '@/components/onboarding/child/ChildInvalidInviteStep';
import { useChildBondingBootstrap } from '@/hooks/useChildBondingBootstrap';
import { decodeParentToken } from '@/utils/url-encoding';

export const dynamic = 'force-dynamic';

function OnboardingChildPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const tokenIssue = useMemo(() => {
    if (!token) return null;
    const decoded = decodeParentToken(token);
    if (!decoded) return 'invalid' as const;
    if (decoded.isExpired) return 'expired' as const;
    return null;
  }, [token]);

  useChildBondingBootstrap();

  if (tokenIssue === 'invalid') {
    return (
      <ChildInvalidInviteStep
        title="הקישור לא תקין"
        detail="בקשו מההורה לשלוח שוב את הלינק. לבדיקה מקומית השתמשו ב־http://localhost:3000 (לא https)."
      />
    );
  }

  if (tokenIssue === 'expired') {
    return (
      <ChildInvalidInviteStep
        title="הקישור פג תוקף"
        detail="בקשו מההורה לשלוח הזמנה חדשה מהמסך שלו."
      />
    );
  }

  return <OnboardingChildFlow />;
}

/** `/onboarding/child` — kid onboarding funnel (bonding token). */
export default function OnboardingChildPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingChildPageInner />
    </Suspense>
  );
}
