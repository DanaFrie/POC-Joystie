'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentCheckoutFailureScreen } from '@/components/billing/PaymentCheckoutFailureScreen';
import { PaymentCheckoutSuccessFlow } from '@/components/billing/PaymentCheckoutSuccessFlow';
import {
  DASHBOARD_CHALLENGE_SETUP_PATH,
  DASHBOARD_SUBSCRIPTION_PATH,
} from '@/constants/billing-paths';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUserSubscription } from '@/hooks/useUserSubscription';

const WEBHOOK_WAIT_MS = 30_000;

/**
 * Cardcom success redirect — wait for webhook, then real dashboard + challenge setup.
 * Route: /dashboard/subscription/pay/success
 */
export default function SubscriptionPaySuccessPage() {
  const router = useRouter();
  const { uid, ready } = useRequireAuth();
  const { status, challengeUnlocked, loading } = useUserSubscription(ready ? uid : null);
  const [timedOut, setTimedOut] = useState(false);

  const subscriptionReady = status === 'trialing' || challengeUnlocked;

  useEffect(() => {
    if (!ready || loading) return;
    if (subscriptionReady) return;
    const timer = window.setTimeout(() => setTimedOut(true), WEBHOOK_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [ready, loading, subscriptionReady]);

  useEffect(() => {
    if (!ready || loading || !subscriptionReady) return;
    router.replace(DASHBOARD_CHALLENGE_SETUP_PATH);
  }, [ready, loading, subscriptionReady, router]);

  if (timedOut && !subscriptionReady) {
    return (
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      >
        <PaymentCheckoutFailureScreen
          eyebrow="עדיין מחכים לאישור"
          titleLines={['לא קיבלנו אישור', 'על התשלום בזמן']}
          subtitle="אפשר לחזור לדשבורד ולנסות שוב דרך המנוי"
          ctaLabel="חזרה לדשבורד"
          onRetry={() => router.replace(DASHBOARD_SUBSCRIPTION_PATH)}
        />
      </div>
    );
  }

  return (
    <PaymentCheckoutSuccessFlow
      subscriptionReady={subscriptionReady}
      subscriptionLoading={!ready || loading || subscriptionReady}
    />
  );
}
