'use client';

import type { CSSProperties } from 'react';
import { ChildCompanionOverlay } from '@/components/onboarding/child/ChildCompanionOverlay';
import { ChildOnboardingLogo } from '@/components/onboarding/child/ChildOnboardingLogo';
import { OnboardingKingdomEllipsesBackdrop } from '@/components/onboarding/OnboardingKingdomEllipsesBackdrop';
import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import {
  FunnelStepFooter,
  FunnelStepForeground,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { CHILD_ONBOARDING_ENTER_VARS } from '@/constants/child-onboarding-figma';

export type ChildKingdomPhase = 'mintGlow' | 'kingdomLanding' | 'companionPick';

type ChildKingdomPhaseStepProps = {
  phase: ChildKingdomPhase;
  onCompanionContinue?: () => void;
};

/**
 * Screens 2–4 — layers accumulate without remounting prior layers.
 * 2: mint glow only · 3: kingdom + ellipses (fade) · 4: logo + companion (100vh foreground).
 */
export function ChildKingdomPhaseStep({
  phase,
  onCompanionContinue,
}: ChildKingdomPhaseStepProps) {
  const showKingdom = phase === 'kingdomLanding' || phase === 'companionPick';
  const showCompanion = phase === 'companionPick';

  return (
    <FunnelStepRoot
      fitViewport
      className="bg-transparent"
      style={CHILD_ONBOARDING_ENTER_VARS as CSSProperties}
    >
      {showKingdom ? (
        <OnboardingKingdomEllipsesBackdrop
          mintGlow
          showKingdom
          kingdomEnter
          showGrid={false}
        />
      ) : (
        <OnboardingMintGridBackdrop showGrid={false} />
      )}

      {phase === 'kingdomLanding' ? <ChildOnboardingLogo /> : null}

      {showCompanion ? (
        <FunnelStepForeground
          distribution="between"
          padTopPx={0}
          padBottomPx={0}
          fitViewport
        >
          <FunnelStepSection>
            <ChildOnboardingLogo flow />
          </FunnelStepSection>

          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
            <ChildCompanionOverlay flow />
          </div>

          <FunnelStepFooter blur={false} onClick={onCompanionContinue}>
            <span className="font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-[#031D15]">
              לחץ כאן כדי להמשיך
            </span>
          </FunnelStepFooter>
        </FunnelStepForeground>
      ) : null}
    </FunnelStepRoot>
  );
}
