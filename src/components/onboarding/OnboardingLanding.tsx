'use client';

import { TrackAnalyticsEvent } from '@/components/analytics/TrackAnalyticsEvent';
import { OnboardingCopy } from '@/components/onboarding/OnboardingCopy';
import { OnboardingKingdomEllipsesBackdrop } from '@/components/onboarding/OnboardingKingdomEllipsesBackdrop';
import { OnboardingLogo } from '@/components/onboarding/OnboardingLogo';
import { FunnelRouteEnter } from '@/components/ui/FunnelRouteEnter';
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
 * Step 1 — landing (`/onboarding`) — Figma 12703:42224.
 * 100vh foreground stack: logo → copy → footer (proportions from flex, not absolute Y).
 */
export function OnboardingLanding({ onStart }: OnboardingLandingProps) {
  const handleStart = () => {
    resetOnboardingParentFlowStart();
    onStart();
  };

  return (
    <FunnelRouteEnter stepKey="onboarding-landing">
      <FunnelStepRoot aria-label="Joystie onboarding landing" fitViewport>
        <TrackAnalyticsEvent event={AnalyticsEvents.LANDING_ONBOARDING} />
        <OnboardingKingdomEllipsesBackdrop />
        <FunnelStepForeground
          distribution="between"
          padTopPx={0}
          padBottomPx={16}
          fitViewport
        >
          <FunnelStepSection className="v03-funnel-enter-0">
            <OnboardingLogo flow />
          </FunnelStepSection>

          <FunnelStepSection className="v03-funnel-enter-1">
            <OnboardingCopy flow />
          </FunnelStepSection>

          <FunnelStepFooter
            className="v03-funnel-enter-2"
            variant="accent"
            showLoginLink
            blur={false}
            onClick={handleStart}
          >
            התחלה
          </FunnelStepFooter>
        </FunnelStepForeground>
      </FunnelStepRoot>
    </FunnelRouteEnter>
  );
}
