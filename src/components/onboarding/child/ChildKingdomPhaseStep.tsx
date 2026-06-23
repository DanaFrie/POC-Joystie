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
 * Screens 2–4 — layers accumulate (mint glow → kingdom → companion).
 * Single mount; new elements enter per phase without remounting prior layers.
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
      <div className="v03-funnel-enter-0">
        <OnboardingMintGlow />
      </div>

      {showKingdom ? (
        <>
          <div className="v03-funnel-enter-0">
            <OnboardingKingdom />
          </div>
          <div className="v03-funnel-enter-1">
            <OnboardingEllipses />
          </div>
          <div className="v03-funnel-enter-2">
            <ChildOnboardingLogo />
          </div>
        </>
      ) : null}

      {showCompanion ? (
        <ChildCompanionOverlay onContinue={onCompanionContinue} />
      ) : null}
    </div>
  );
}
