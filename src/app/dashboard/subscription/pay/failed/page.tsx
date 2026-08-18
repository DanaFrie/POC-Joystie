'use client';

import { useRouter } from 'next/navigation';
import { PaymentCheckoutFailureScreen } from '@/components/billing/PaymentCheckoutFailureScreen';
import { DASHBOARD_SUBSCRIPTION_PATH } from '@/constants/billing-paths';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Cardcom failure redirect — disappointed Dori + retry on freemium dashboard.
 * Route: /dashboard/subscription/pay/failed
 */
export default function SubscriptionPayFailedPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();

  if (!ready) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
    >
      <PaymentCheckoutFailureScreen
        onRetry={() => router.replace(DASHBOARD_SUBSCRIPTION_PATH)}
      />
    </div>
  );
}
