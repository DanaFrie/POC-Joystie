'use client';

import { useRouter } from 'next/navigation';
import { PaymentCheckoutFailureScreen } from '@/components/billing/PaymentCheckoutFailureScreen';
import { ChallengeTestShell } from '@/components/dashboard/challenge/ChallengeTestShell';
import { SUBSCRIPTION_TEST_PATH } from '@/constants/billing-paths';
import { CHALLENGE_TEST_DEFAULTS } from '@/lib/challenge/challengeTestFixtures';
import { useRequireAuth } from '@/hooks/useRequireAuth';

/**
 * Cardcom failure redirect — disappointed Dori + retry.
 * Route: /dashboard/subscription/pay/failed
 */
export default function SubscriptionPayFailedPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const childName = 'יואב';
  const estimatedDailyHours = CHALLENGE_TEST_DEFAULTS.estimatedDailyHours;

  if (!ready) return null;

  return (
    <ChallengeTestShell
      title="תשלום נכשל"
      subtitle="/dashboard/subscription/pay/failed"
      childName={childName}
      averageMinutes={Math.round(estimatedDailyHours * 60)}
      dimmed={false}
    >
      <PaymentCheckoutFailureScreen onRetry={() => router.push(SUBSCRIPTION_TEST_PATH)} />
    </ChallengeTestShell>
  );
}
