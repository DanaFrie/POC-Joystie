'use client';

import { useEffect, useState } from 'react';
import { ChildFunnelBleedBackground } from '@/components/onboarding/child/ChildFunnelBleedBackground';
import {
  ChildKingdomPhaseStep,
  type ChildKingdomPhase,
} from '@/components/onboarding/child/ChildKingdomPhaseStep';
import { ChildWelcomeStep } from '@/components/onboarding/child/ChildWelcomeStep';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import {
  CHILD_ONBOARDING_KINGDOM_AUTO_MS,
  CHILD_ONBOARDING_MINT_GLOW_AUTO_MS,
} from '@/constants/child-onboarding-figma';

type ChildFlowStep = 'welcome' | ChildKingdomPhase;

function childFlowStepKey(step: ChildFlowStep): string {
  return step === 'welcome' ? 'welcome' : 'postWelcome';
}

/** `/onboarding/child` — kid funnel (token wiring later). */
export function OnboardingChildFlow() {
  const [step, setStep] = useState<ChildFlowStep>('welcome');

  useEffect(() => {
    if (step === 'mintGlow') {
      const timer = window.setTimeout(
        () => setStep('kingdomLanding'),
        CHILD_ONBOARDING_MINT_GLOW_AUTO_MS
      );
      return () => window.clearTimeout(timer);
    }

    if (step === 'kingdomLanding') {
      const timer = window.setTimeout(
        () => setStep('companionPick'),
        CHILD_ONBOARDING_KINGDOM_AUTO_MS
      );
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [step]);

  return (
    <>
      <ChildFunnelBleedBackground />
      <OnboardingFunnelStepSlot stepKey={childFlowStepKey(step)} clipOverflow={false}>
        {step === 'welcome' ? (
          <ChildWelcomeStep onComplete={() => setStep('mintGlow')} />
        ) : (
          <ChildKingdomPhaseStep phase={step} />
        )}
      </OnboardingFunnelStepSlot>
    </>
  );
}
