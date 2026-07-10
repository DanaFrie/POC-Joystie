'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentCheckoutSuccessFlow } from '@/components/billing/PaymentCheckoutSuccessFlow';
import { SUBSCRIPTION_TEST_PATH } from '@/constants/billing-paths';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUserSubscription } from '@/hooks/useUserSubscription';

const WEBHOOK_WAIT_MS = 30_000;

/**
 * Cardcom success redirect — wait for webhook, then challenge card + confetti.
 * Route: /dashboard/subscription/pay/success
 */
export default function SubscriptionPaySuccessPage() {
  const router = useRouter();
  const { uid, ready } = useRequireAuth();
  const { status, challengeUnlocked, loading } = useUserSubscription(ready ? uid : null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!ready || loading) return;
    if (status === 'trialing' || challengeUnlocked) return;
    const timer = window.setTimeout(() => setTimedOut(true), WEBHOOK_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [ready, loading, status, challengeUnlocked]);

  const subscriptionReady = status === 'trialing' || challengeUnlocked;

  if (timedOut && !subscriptionReady) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-v03-green-900 px-6 text-center font-simpler text-white">
        <p className="text-[20px] font-bold">עדיין מחכים לאישור מ-Cardcom</p>
        <p className="max-w-sm text-[15px] text-white/70">
          אם סיימתם את התשלום, ייתכן שה-webhook עדיין בדרך. ודאו שהפונקציות deployed ושהכתובת
          הציבורית ב-`SERVICE_FUNCTION_BASE_URL` נכונה.
        </p>
        <button
          type="button"
          onClick={() => router.push(SUBSCRIPTION_TEST_PATH)}
          className="rounded-[22px] bg-[#00FFB3] px-8 py-3 text-[16px] font-bold text-[#092125]"
        >
          חזרה לבדיקת מנוי
        </button>
      </div>
    );
  }

  return (
    <PaymentCheckoutSuccessFlow
      subscriptionReady={subscriptionReady}
      subscriptionLoading={!ready || loading}
    />
  );
}
