'use client';

import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';

const VERIFY_COPY = 'מאמתים את התשלום';

type PaymentCheckoutSuccessFlowProps = {
  /** Wait for Firestore `trialing` before parent navigates to real dashboard. */
  subscriptionReady: boolean;
  subscriptionLoading: boolean;
};

/**
 * Post-checkout verify wait — funnel waiting only (no dashboard chrome).
 * Parent page redirects to `/dashboard?openChallenge=1` once webhook lands.
 */
export function PaymentCheckoutSuccessFlow({
  subscriptionReady,
  subscriptionLoading,
}: PaymentCheckoutSuccessFlowProps) {
  const waiting = subscriptionLoading || !subscriptionReady;

  if (!waiting) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      role="status"
      aria-live="polite"
      aria-busy
    >
      <FunnelViewport surface="dark" scaleMode="scroll" className="font-simpler text-v03-text-on-dark">
        <OnboardingMintGridBackdrop showGrid />
        <OnboardingWaitingScreenShell skipMintGlow zIndex={20} ariaBusy>
          <OnboardingWaitingCenterContent headline={VERIFY_COPY} ariaLabel={VERIFY_COPY} />
        </OnboardingWaitingScreenShell>
      </FunnelViewport>
    </div>
  );
}
