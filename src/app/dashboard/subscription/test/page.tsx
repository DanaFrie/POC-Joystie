'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParentSubscriptionStep } from '@/components/onboarding/parent/ParentSubscriptionStep';
import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import { SUBSCRIPTION_TEST_PATH } from '@/constants/billing-paths';
import type { OnboardingSubscriptionPlan } from '@/constants/onboarding-subscription-layout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { createCardcomTrialCheckout } from '@/lib/api/billing';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('SubscriptionTest');

/**
 * Payment funnel test — subscription gate + Cardcom redirect.
 * Route: /dashboard/subscription/test (requires login)
 */
export default function SubscriptionTestPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [selectedPlan, setSelectedPlan] = useState<OnboardingSubscriptionPlan | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleStartTrial = useCallback(async () => {
    if (!selectedPlan || checkoutBusy) return;
    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      const { checkoutUrl } = await createCardcomTrialCheckout({ plan: selectedPlan });
      window.location.href = checkoutUrl;
    } catch (err) {
      logger.error('createCardcomTrialCheckout failed', err);
      setCheckoutError(
        err instanceof Error ? err.message : 'לא הצלחנו לפתוח את דף התשלום. נסו שוב.'
      );
      setCheckoutBusy(false);
    }
  }, [selectedPlan, checkoutBusy]);

  if (!ready) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-v03-green-900">
        <FunnelViewport surface="dark" scaleMode="scroll" className="font-simpler text-v03-text-on-dark">
          <OnboardingWaitingScreenShell zIndex={20} ariaBusy staticLayout>
            <OnboardingWaitingCenterContent headline="מתחברים" ariaLabel="מתחברים" />
          </OnboardingWaitingScreenShell>
        </FunnelViewport>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-v03-green-900">
      <FunnelViewport surface="dark" scaleMode="scroll" className="font-simpler text-v03-text-on-dark">
        <div className="relative h-full w-full">
          {checkoutBusy ? (
            <>
              <OnboardingMintGridBackdrop showGrid />
              <OnboardingWaitingScreenShell skipMintGlow zIndex={20} ariaBusy staticLayout>
                <OnboardingWaitingCenterContent
                  headline="עוברים לתשלום מאובטח"
                  ariaLabel="עוברים לתשלום מאובטח"
                />
              </OnboardingWaitingScreenShell>
            </>
          ) : (
            <>
              <div className="pointer-events-none absolute left-0 right-0 top-0 z-[80] px-v03-gutter pt-[max(12px,env(safe-area-inset-top))]">
                <p className="text-center font-simpler text-[11px] font-semibold uppercase tracking-wide text-[#00E7A2]/80">
                  TEST · מנוי + Cardcom
                </p>
                <p className="text-center font-simpler text-[12px] text-white/50">{SUBSCRIPTION_TEST_PATH}</p>
                {checkoutError ? (
                  <p className="mt-2 text-center font-simpler text-[14px] text-red-300" role="alert">
                    {checkoutError}
                  </p>
                ) : null}
              </div>

              <ParentSubscriptionStep
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
                onClose={() => router.replace('/dashboard')}
                onContinue={() => void handleStartTrial()}
              />
            </>
          )}
        </div>
      </FunnelViewport>
    </div>
  );
}
