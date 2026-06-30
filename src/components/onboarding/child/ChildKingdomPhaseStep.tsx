'use client';

import type { CSSProperties } from 'react';
import { ChildCompanionOverlay } from '@/components/onboarding/child/ChildCompanionOverlay';
import { ChildOnboardingLogo } from '@/components/onboarding/child/ChildOnboardingLogo';
import { OnboardingEllipses } from '@/components/onboarding/OnboardingEllipses';
import { OnboardingKingdom } from '@/components/onboarding/OnboardingKingdom';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { CHILD_ONBOARDING_ENTER_VARS } from '@/constants/child-onboarding-figma';

export type ChildKingdomPhase = 'mintGlow' | 'kingdomLanding' | 'companionPick';

type ChildKingdomPhaseStepProps = {
  phase: ChildKingdomPhase;
  onCompanionContinue?: () => void;
};

/**
 * Screens 2–4 — layers accumulate without remounting prior layers.
 * 2: mint glow only · 3: kingdom + ellipses (group fade) · 4: logo + companion (stagger).
 */
export function ChildKingdomPhaseStep({
  phase,
  onCompanionContinue,
}: ChildKingdomPhaseStepProps) {
  const showKingdom = phase === 'kingdomLanding' || phase === 'companionPick';
  const showCompanion = phase === 'companionPick';

  return (
    <div
      className="relative h-full w-full overflow-visible bg-transparent"
      style={CHILD_ONBOARDING_ENTER_VARS as CSSProperties}
    >
      <OnboardingMintGlow />

      {showKingdom ? (
        <div className="v03-funnel-enter-0">
          <OnboardingKingdom />
          <OnboardingEllipses />
        </div>
      ) : null}

      {showCompanion ? (
        <>
          <div className="v03-funnel-enter-0">
            <ChildOnboardingLogo />
          </div>
          <ChildCompanionOverlay onContinue={onCompanionContinue} />
        </>
      ) : null}
    </div>
  );
}
