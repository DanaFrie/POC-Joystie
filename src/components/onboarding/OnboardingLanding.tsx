'use client';

import { TrackAnalyticsEvent } from '@/components/analytics/TrackAnalyticsEvent';
import { OnboardingCopy } from '@/components/onboarding/OnboardingCopy';
import { OnboardingKingdomEllipsesBackdrop } from '@/components/onboarding/OnboardingKingdomEllipsesBackdrop';
import { OnboardingLogo } from '@/components/onboarding/OnboardingLogo';
import {
  FunnelStepFooter,
  FunnelStepForeground,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { resetOnboardingParentFlowStart } from '@/lib/onboarding/parentFlowSession';
import { AnalyticsEvents } from '@/utils/analytics';

type OnboardingLandingProps = {
  onStart: () => void;
};

/**
 * Step 1 — landing (`/onboarding`).
 * 100vh foreground stack (logo → copy → footer); bleed layers stay absolute.
 */
export function OnboardingLanding({ onStart }: OnboardingLandingProps) {
  const handleStart = () => {
    resetOnboardingParentFlowStart();
    onStart();
  };

  return (
    <FunnelStepRoot aria-label="Joystie onboarding landing" fitViewport>
      <TrackAnalyticsEvent event={AnalyticsEvents.LANDING_ONBOARDING} />
      <OnboardingKingdomEllipsesBackdrop />
      <FunnelStepForeground distribution="between" padTopPx={0} padBottomPx={16} fitViewport>
        <FunnelStepSection>
          <OnboardingLogo flow />
        </FunnelStepSection>

        <FunnelStepSection>
          <OnboardingCopy flow />
        </FunnelStepSection>

        <FunnelStepFooter
          variant="accent"
          showLoginLink
          blur={false}
          onClick={handleStart}
        >
          התחלה
        </FunnelStepFooter>
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}
