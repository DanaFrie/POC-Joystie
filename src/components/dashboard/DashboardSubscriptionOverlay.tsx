'use client';

import { useCallback, useState } from 'react';
import { ParentSubscriptionStep } from '@/components/onboarding/parent/ParentSubscriptionStep';
import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import type { OnboardingSubscriptionPlan } from '@/constants/onboarding-subscription-layout';
import { createCardcomTrialCheckout } from '@/lib/api/billing';
import { billingCallableErrorMessage } from '@/lib/api/billingErrors';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('DashboardSubscription');

const CHECKOUT_WAITING_COPY = 'עוברים לתשלום מאובטח';

type DashboardSubscriptionOverlayProps = {
  visible: boolean;
  onClose: () => void;
};

/** Full-screen subscription gate over the parent dashboard — starts Cardcom trial checkout. */
export function DashboardSubscriptionOverlay({
  visible,
  onClose,
}: DashboardSubscriptionOverlayProps) {
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
      setCheckoutError(billingCallableErrorMessage(err));
      setCheckoutBusy(false);
    }
  }, [selectedPlan, checkoutBusy]);

  if (!visible && !checkoutBusy) return null;

  return (
    <div
      className="absolute inset-0 z-[70] overflow-hidden overscroll-none"
      role="dialog"
      aria-modal="true"
    >
      <FunnelViewport
        surface="dark"
        scaleMode="scroll"
        ignoreSafeArea
        lockScroll
        className="h-full font-simpler text-v03-text-on-dark"
      >
        <div className="relative h-full w-full overflow-hidden">
          {checkoutBusy ? (
            <>
              <OnboardingMintGridBackdrop showGrid />
              <OnboardingWaitingScreenShell skipMintGlow zIndex={20} ariaBusy staticLayout>
                <OnboardingWaitingCenterContent
                  headline={CHECKOUT_WAITING_COPY}
                  ariaLabel={CHECKOUT_WAITING_COPY}
                />
              </OnboardingWaitingScreenShell>
            </>
          ) : (
            <>
              {checkoutError ? (
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-[80] px-v03-gutter pt-[max(12px,env(safe-area-inset-top))]">
                  <p className="mt-2 text-center font-simpler text-[14px] text-red-300" role="alert">
                    {checkoutError}
                  </p>
                </div>
              ) : null}
              <ParentSubscriptionStep
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
                onClose={onClose}
                onContinue={() => void handleStartTrial()}
              />
            </>
          )}
        </div>
      </FunnelViewport>
    </div>
  );
}
