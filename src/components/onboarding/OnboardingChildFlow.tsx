'use client';

import { useEffect, useState } from 'react';
import { ChildBallGameStep } from '@/components/onboarding/child/ChildBallGameStep';
import { ChildDoriMissionIntroStep } from '@/components/onboarding/child/ChildDoriMissionIntroStep';
import { ChildDoriRevealedStep } from '@/components/onboarding/child/ChildDoriRevealedStep';
import { ChildDoriTransitionStep } from '@/components/onboarding/child/ChildDoriTransitionStep';
import { ChildEggHatchStep } from '@/components/onboarding/child/ChildEggHatchStep';
import { ChildFunnelBleedBackground } from '@/components/onboarding/child/ChildFunnelBleedBackground';
import { ChildFunnelLightBackground } from '@/components/onboarding/child/ChildFunnelLightBackground';
import {
  ChildKingdomPhaseStep,
  type ChildKingdomPhase,
} from '@/components/onboarding/child/ChildKingdomPhaseStep';
import { ChildMissionOneStep } from '@/components/onboarding/child/ChildMissionOneStep';
import { ChildWelcomeStep } from '@/components/onboarding/child/ChildWelcomeStep';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { CHILD_BALL_GAME_WAITING_DEMO_MS } from '@/constants/child-onboarding-assets';
import {
  CHILD_ONBOARDING_KINGDOM_AUTO_MS,
  CHILD_ONBOARDING_MINT_GLOW_AUTO_MS,
} from '@/constants/child-onboarding-figma';

type PostWelcomePhase = ChildKingdomPhase;

type PostEggPhase =
  | 'doriRevealed'
  | 'doriTransition'
  | 'doriMissionIntro'
  | 'missionOne'
  | 'ballGameWaiting'
  | 'ballGameReady';

export type ChildFlowStep =
  | 'welcome'
  | PostWelcomePhase
  | 'eggHatch'
  | PostEggPhase;

function childFlowStepKey(step: ChildFlowStep): string {
  if (step === 'welcome') return 'welcome';
  if (step === 'eggHatch') return 'eggHatch';
  if (step === 'mintGlow' || step === 'kingdomLanding' || step === 'companionPick') {
    return 'postWelcome';
  }
  return 'postEgg';
}

function isLightStep(step: ChildFlowStep): boolean {
  return step === 'eggHatch';
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

    if (step === 'ballGameWaiting') {
      const timer = window.setTimeout(
        () => setStep('ballGameReady'),
        CHILD_BALL_GAME_WAITING_DEMO_MS
      );
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [step]);

  return (
    <>
      {isLightStep(step) ? <ChildFunnelLightBackground /> : <ChildFunnelBleedBackground />}
      <OnboardingFunnelStepSlot stepKey={childFlowStepKey(step)} clipOverflow={false}>
        {step === 'welcome' ? (
          <ChildWelcomeStep onComplete={() => setStep('mintGlow')} />
        ) : null}

        {step === 'mintGlow' || step === 'kingdomLanding' || step === 'companionPick' ? (
          <ChildKingdomPhaseStep
            phase={step}
            onCompanionContinue={() => setStep('eggHatch')}
          />
        ) : null}

        {step === 'eggHatch' ? (
          <ChildEggHatchStep onComplete={() => setStep('doriRevealed')} />
        ) : null}

        {step === 'doriRevealed' ? (
          <ChildDoriRevealedStep onContinue={() => setStep('doriTransition')} />
        ) : null}

        {step === 'doriTransition' ? (
          <ChildDoriTransitionStep onComplete={() => setStep('doriMissionIntro')} />
        ) : null}

        {step === 'doriMissionIntro' ? (
          <ChildDoriMissionIntroStep onContinue={() => setStep('missionOne')} />
        ) : null}

        {step === 'missionOne' ? (
          <ChildMissionOneStep onContinue={() => setStep('ballGameWaiting')} />
        ) : null}

        {step === 'ballGameWaiting' || step === 'ballGameReady' ? (
          <ChildBallGameStep phase={step === 'ballGameWaiting' ? 'waiting' : 'ready'} />
        ) : null}
      </OnboardingFunnelStepSlot>
    </>
  );
}
