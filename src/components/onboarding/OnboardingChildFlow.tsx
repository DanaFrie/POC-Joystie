'use client';



import { useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { ChildSharedPhotoReviewStep } from '@/components/onboarding/child/ChildSharedPhotoReviewStep';
import { ChildSharedPhotoShareStep } from '@/components/onboarding/child/ChildSharedPhotoShareStep';
import { ChildSelfiePatternStep } from '@/components/onboarding/child/ChildSelfiePatternStep';
import { ChildMissionThreeSelfieIntroStep } from '@/components/onboarding/child/ChildMissionThreeSelfieIntroStep';
import { ChildContractCelebrationStep } from '@/components/onboarding/child/ChildContractCelebrationStep';
import { ChildChangeKingStep } from '@/components/onboarding/child/ChildChangeKingStep';
import { ChildParentSuggestedChangeStep } from '@/components/onboarding/child/ChildParentSuggestedChangeStep';
import { ChildSharedPhotoPreparingStep } from '@/components/onboarding/child/ChildSharedPhotoPreparingStep';
import { ChildWaitingParentApprovalStep } from '@/components/onboarding/child/ChildWaitingParentApprovalStep';

import { ChildMissionOneWinStep } from '@/components/onboarding/child/ChildMissionOneWinStep';

import { ChildMissionTwoIntroStep } from '@/components/onboarding/child/ChildMissionTwoIntroStep';

import {
  ChildMissionTwoDoriSequenceStep,
} from '@/components/onboarding/child/ChildMissionTwoDoriSequenceStep';

import { ChildRunToCastleStep } from '@/components/onboarding/child/ChildRunToCastleStep';

import { ChildDoriMissionIntroStep } from '@/components/onboarding/child/ChildDoriMissionIntroStep';

import { ChildDoriRevealedStep } from '@/components/onboarding/child/ChildDoriRevealedStep';

import { ChildDoriTransitionStep } from '@/components/onboarding/child/ChildDoriTransitionStep';

import { ChildEggHatchStep } from '@/components/onboarding/child/ChildEggHatchStep';

import { ChildEggTransitionStep } from '@/components/onboarding/child/ChildEggTransitionStep';

import { ChildFunnelBleedBackground } from '@/components/onboarding/child/ChildFunnelBleedBackground';

import { ChildFunnelLightBackground } from '@/components/onboarding/child/ChildFunnelLightBackground';

import {

  ChildKingdomPhaseStep,

  type ChildKingdomPhase,

} from '@/components/onboarding/child/ChildKingdomPhaseStep';

import { ChildWelcomeStep } from '@/components/onboarding/child/ChildWelcomeStep';

import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';

import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';

import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';

import {

  CHILD_ONBOARDING_KINGDOM_AUTO_MS,

  CHILD_ONBOARDING_MINT_GLOW_AUTO_MS,

} from '@/constants/child-onboarding-figma';

import { ONBOARDING_CHILD_GAME_WON_KEY } from '@/constants/onboarding-game';

import {
  markChildDoriMissionIntroDone,
  readPersistedChildFlowStep,
  writePersistedChildFlowStep,
} from '@/lib/onboarding/childFlowSession';

import {
  childReviewBackTone,
  getChildReviewPreviousStep,
} from '@/lib/onboarding/childFlowReviewNav';

import { useChildBondingContext } from '@/hooks/useChildBondingContext';

import { signalChildOnboardingMilestone } from '@/lib/onboarding/childMilestones';

import { buildGameChildUrlWithToken, parseBondingInviteQueryParams } from '@/utils/url-encoding';



type PostWelcomePhase = ChildKingdomPhase;



type PostEggPhase =

  | 'eggTransition'

  | 'doriRevealed'

  | 'doriTransition'

  | 'doriMissionIntro'

  | 'missionOneWin'

  | 'missionTwoIntro'

  | 'missionTwoDoriShell'

  | 'runToCastle'

  | 'changeKing'

  | 'waitingParentApproval'

  | 'parentSuggestedChange'

  | 'contractCelebration'

  | 'missionThreeSelfieIntro'

  | 'selfiePattern'

  | 'sharedPhotoReview'

  | 'sharedPhotoShare'

  | 'preparingSharedPhoto';



export type ChildFlowStep =

  | 'welcome'

  | PostWelcomePhase

  | 'eggHatch'

  | PostEggPhase;



function childFlowStepKey(step: ChildFlowStep): string {

  if (step === 'welcome') return 'welcome';

  if (step === 'eggHatch') return 'eggHatch';

  if (step === 'eggTransition') return 'eggTransition';
  if (step === 'doriMissionIntro') return 'doriMissionIntro';
  if (step === 'missionOneWin') return 'missionOneWin';
  if (step === 'missionTwoIntro') return 'missionTwoIntro';
  if (step === 'missionTwoDoriShell') return 'missionTwoDoriShell';
  if (step === 'runToCastle') return 'runToCastle';
  if (step === 'changeKing') return 'changeKing';
  if (step === 'waitingParentApproval') return 'waitingParentApproval';
  if (step === 'parentSuggestedChange') return 'parentSuggestedChange';
  if (step === 'contractCelebration') return 'contractCelebration';
  if (step === 'missionThreeSelfieIntro') return 'missionThreeSelfieIntro';
  if (step === 'selfiePattern') return 'selfiePattern';
  if (step === 'sharedPhotoReview') return 'sharedPhotoReview';
  if (step === 'sharedPhotoShare') return 'sharedPhotoShare';
  if (step === 'preparingSharedPhoto') return 'preparingSharedPhoto';

  if (step === 'mintGlow' || step === 'kingdomLanding' || step === 'companionPick') {

    return 'postWelcome';

  }

  return 'postEgg';

}



function isLightStep(step: ChildFlowStep): boolean {
  return (
    step === 'eggHatch' ||
    step === 'eggTransition' ||
    step === 'missionOneWin' ||
    step === 'contractCelebration'
  );
}

function lightBackgroundWhiteStop(step: ChildFlowStep): number {
  return step === 'contractCelebration' ? 45 : 40;
}

function showChildFunnelGrid(step: ChildFlowStep): boolean {
  return step === 'preparingSharedPhoto';
}

function usesOwnFunnelBackground(step: ChildFlowStep): boolean {
  return (
    step === 'preparingSharedPhoto' ||
    step === 'selfiePattern' ||
    step === 'sharedPhotoReview' ||
    step === 'sharedPhotoShare'
  );
}



function readInitialChildStep(): ChildFlowStep {
  if (typeof window === 'undefined') return 'welcome';

  if (sessionStorage.getItem(ONBOARDING_CHILD_GAME_WON_KEY)) {
    sessionStorage.removeItem(ONBOARDING_CHILD_GAME_WON_KEY);
    return 'missionOneWin';
  }

  const persisted = readPersistedChildFlowStep();
  if (persisted) return persisted as ChildFlowStep;

  return 'welcome';
}



/** `/onboarding/child` — kid funnel (bonding token + ball game). */

export function OnboardingChildFlow() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const urlMeta = parseBondingInviteQueryParams(searchParams);

  const bonding = useChildBondingContext();

  const [step, setStep] = useState<ChildFlowStep>(readInitialChildStep);



  const parentName = bonding?.parentName ?? urlMeta.parentName ?? 'אבא';

  const childName = bonding?.childName?.trim() || urlMeta.childName || 'הילד/ה';

  const childGender = bonding?.childGender ?? urlMeta.childGender ?? 'boy';

  const parentGender = bonding?.parentGender ?? urlMeta.parentGender ?? 'male';



  useEffect(() => {

    if (step !== 'doriRevealed' || !bonding?.parentId) return;

    void signalChildOnboardingMilestone(bonding.parentId, 'dori_revealed').catch(() => {

      // parent may still advance via poll

    });

  }, [step, bonding?.parentId]);



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



  useEffect(() => {
    writePersistedChildFlowStep(step);
  }, [step]);

  const goToBallGame = useCallback(() => {
    markChildDoriMissionIntroDone();
    writePersistedChildFlowStep('doriMissionIntro');
    const parentId = bonding?.parentId;
    if (parentId) {
      void signalChildOnboardingMilestone(parentId, 'mission_ready').catch(() => {
        // parent may still advance via RTDB poll
      });
    }
    const token = new URLSearchParams(window.location.search).get('token');
    router.push(token ? buildGameChildUrlWithToken(token) : '/game/child');
  }, [router, bonding?.parentId]);

  useEffect(() => {
    if (step !== 'doriMissionIntro') return;
    const token = new URLSearchParams(window.location.search).get('token');
    router.prefetch(token ? buildGameChildUrlWithToken(token) : '/game/child');
  }, [router, step]);



  const onEggHatchComplete = () => {

    const parentId = bonding?.parentId;

    if (parentId) {

      void signalChildOnboardingMilestone(parentId, 'egg_complete').catch(() => {

        // parent may still advance via poll

      });

    }

    setStep('eggTransition');

  };



  const reviewPreviousStep = getChildReviewPreviousStep(step);

  const handleReviewBack = useCallback(() => {
    const previous = getChildReviewPreviousStep(step);
    if (previous) setStep(previous as ChildFlowStep);
  }, [step]);



  return (

    <>

      {reviewPreviousStep ? (
        <OnboardingBackButton tone={childReviewBackTone(step)} onClick={handleReviewBack} />
      ) : null}

      {isLightStep(step) ? (
        <ChildFunnelLightBackground whiteStopPercent={lightBackgroundWhiteStop(step)} />
      ) : usesOwnFunnelBackground(step) ? null : (
        <ChildFunnelBleedBackground />
      )}

      {showChildFunnelGrid(step) ? <OnboardingGrid /> : null}

      {showChildFunnelGrid(step) ? <OnboardingMintGlow /> : null}

      <OnboardingFunnelStepSlot stepKey={childFlowStepKey(step)} clipOverflow={false}>

        {step === 'welcome' ? (

          <ChildWelcomeStep

            childName={childName}

            childGender={childGender}

            onComplete={() => setStep('mintGlow')}

          />

        ) : null}



        {step === 'mintGlow' || step === 'kingdomLanding' || step === 'companionPick' ? (

          <ChildKingdomPhaseStep

            phase={step}

            onCompanionContinue={() => setStep('eggHatch')}

          />

        ) : null}



        {step === 'eggHatch' ? (

          <ChildEggHatchStep

            childGender={childGender}

            onComplete={onEggHatchComplete}

          />

        ) : null}



        {step === 'eggTransition' ? (

          <ChildEggTransitionStep onComplete={() => setStep('doriRevealed')} />

        ) : null}



        {step === 'doriRevealed' ? (

          <ChildDoriRevealedStep

            childName={childName}

            onContinue={() => setStep('doriTransition')}

          />

        ) : null}



        {step === 'doriTransition' ? (

          <ChildDoriTransitionStep onComplete={() => setStep('doriMissionIntro')} />

        ) : null}



        {step === 'doriMissionIntro' ? (

          <ChildDoriMissionIntroStep onContinue={goToBallGame} />

        ) : null}



        {step === 'missionOneWin' ? (
          <ChildMissionOneWinStep
            childName={childName}
            onContinue={() => setStep('missionTwoIntro')}
          />
        ) : null}

        {step === 'missionTwoIntro' ? (
          <ChildMissionTwoIntroStep
            parentName={parentName}
            parentGender={parentGender}
            onContinue={() => setStep('missionTwoDoriShell')}
          />
        ) : null}

        {step === 'missionTwoDoriShell' ? (
          <ChildMissionTwoDoriSequenceStep
            childName={childName}
            onComplete={() => setStep('runToCastle')}
          />
        ) : null}

        {step === 'runToCastle' ? (
          <ChildRunToCastleStep
            childName={childName}
            childGender={childGender}
            onContinue={() => setStep('changeKing')}
          />
        ) : null}

        {step === 'changeKing' ? (
          <ChildChangeKingStep
            childName={childName}
            childGender={childGender}
            onConfettiEnd={() => setStep('waitingParentApproval')}
          />
        ) : null}

        {step === 'waitingParentApproval' ? (
          <ChildWaitingParentApprovalStep
            parentGender={parentGender}
            onComplete={() => setStep('parentSuggestedChange')}
          />
        ) : null}

        {step === 'parentSuggestedChange' ? (
          <ChildParentSuggestedChangeStep
            childGender={childGender}
            parentGender={parentGender}
            onAccept={() => setStep('contractCelebration')}
            onDecline={() => setStep('preparingSharedPhoto')}
          />
        ) : null}

        {step === 'contractCelebration' ? (
          <ChildContractCelebrationStep
            onContinue={() => setStep('missionThreeSelfieIntro')}
          />
        ) : null}

        {step === 'missionThreeSelfieIntro' ? (
          <ChildMissionThreeSelfieIntroStep
            parentName={parentName}
            parentGender={parentGender}
            onContinue={() => setStep('selfiePattern')}
          />
        ) : null}

        {step === 'selfiePattern' ? (
          <ChildSelfiePatternStep
            childName={childName}
            parentName={parentName}
            parentGender={parentGender}
            onCapture={() => setStep('preparingSharedPhoto')}
          />
        ) : null}

        {step === 'preparingSharedPhoto' ? (
          <ChildSharedPhotoPreparingStep onComplete={() => setStep('sharedPhotoReview')} />
        ) : null}

        {step === 'sharedPhotoReview' ? (
          <ChildSharedPhotoReviewStep
            onLiked={() => setStep('sharedPhotoShare')}
            onRetake={() => setStep('selfiePattern')}
            onSkip={() => setStep('sharedPhotoShare')}
          />
        ) : null}

        {step === 'sharedPhotoShare' ? (
          <ChildSharedPhotoShareStep onShare={() => {}} onWallet={() => {}} />
        ) : null}

      </OnboardingFunnelStepSlot>

    </>

  );

}

