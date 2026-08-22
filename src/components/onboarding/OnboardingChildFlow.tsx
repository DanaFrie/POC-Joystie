'use client';



import { useCallback, useEffect, useState, useTransition } from 'react';

import nextDynamic from 'next/dynamic';

import { useRouter, useSearchParams } from 'next/navigation';

import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { ChildMissionThreeSelfieIntroStep } from '@/components/onboarding/child/ChildMissionThreeSelfieIntroStep';
import { ChildContractCelebrationStep } from '@/components/onboarding/child/ChildContractCelebrationStep';
import { ChildChangeKingStep } from '@/components/onboarding/child/ChildChangeKingStep';
import { ChildParentSuggestedChangeStep } from '@/components/onboarding/child/ChildParentSuggestedChangeStep';
import { ChildWaitingParentApprovalStep } from '@/components/onboarding/child/ChildWaitingParentApprovalStep';

import { ChildMissionOneWinStep } from '@/components/onboarding/child/ChildMissionOneWinStep';

import { ChildMissionTwoIntroStep } from '@/components/onboarding/child/ChildMissionTwoIntroStep';

import { ChildRunToCastleStep } from '@/components/onboarding/child/ChildRunToCastleStep';

import { ChildDoriRevealedStep } from '@/components/onboarding/child/ChildDoriRevealedStep';

import { ChildEggHatchStep } from '@/components/onboarding/child/ChildEggHatchStep';

import { ChildEggTransitionStep } from '@/components/onboarding/child/ChildEggTransitionStep';

import { ChildFunnelBleedBackground } from '@/components/onboarding/child/ChildFunnelBleedBackground';

import { ChildFunnelLightBackground } from '@/components/onboarding/child/ChildFunnelLightBackground';

import {

  ChildKingdomPhaseStep,

  type ChildKingdomPhase,

} from '@/components/onboarding/child/ChildKingdomPhaseStep';

import { ChildWelcomeStep } from '@/components/onboarding/child/ChildWelcomeStep';

import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';

import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';

const ChildSelfieMissionFlow = nextDynamic(
  () =>
    import('@/components/onboarding/child/ChildSelfieMissionFlow').then((m) => ({
      default: m.ChildSelfieMissionFlow,
    })),
  { loading: () => <FunnelRouteLoading />, ssr: false }
);

import {

  CHILD_ONBOARDING_KINGDOM_AUTO_MS,

  CHILD_ONBOARDING_MINT_GLOW_AUTO_MS,

} from '@/constants/child-onboarding-figma';

import { ONBOARDING_CHILD_GAME_WON_KEY } from '@/constants/onboarding-game';

import {
  readPersistedChildAgreedChange,
  readPersistedChildFlowStep,
  writePersistedChildAgreedChange,
  writePersistedChildFlowStep,
} from '@/lib/onboarding/childFlowSession';

import { useChildBondingContext } from '@/hooks/useChildBondingContext';

import { usePairingResume } from '@/hooks/usePairingResume';

import { usePostGameSync } from '@/hooks/usePostGameSync';

import { signalChildOnboardingMilestone } from '@/lib/onboarding/childMilestones';

import { buildGameChildUrlWithInvite, parseBondingInviteQueryParams } from '@/utils/url-encoding';



type PostWelcomePhase = ChildKingdomPhase;



type PostEggPhase =

  | 'eggTransition'

  | 'doriRevealed'

  | 'missionOneWin'

  | 'missionTwoIntro'

  | 'runToCastle'

  | 'changeKing'

  | 'waitingParentApproval'

  | 'parentSuggestedChange'

  | 'contractCelebration'

  | 'missionThreeSelfieIntro'

  | 'selfiePattern';



export type ChildFlowStep =

  | 'welcome'

  | PostWelcomePhase

  | 'eggHatch'

  | PostEggPhase;



function childFlowStepKey(step: ChildFlowStep): string {

  if (step === 'welcome') return 'welcome';

  if (step === 'eggHatch') return 'eggHatch';

  if (step === 'eggTransition') return 'eggTransition';
  if (step === 'doriRevealed') return 'doriRevealed';
  if (step === 'missionOneWin') return 'missionOneWin';
  if (step === 'missionTwoIntro') return 'missionTwoIntro';
  if (step === 'runToCastle') return 'runToCastle';
  if (step === 'changeKing') return 'changeKing';
  if (step === 'waitingParentApproval') return 'waitingParentApproval';
  if (step === 'parentSuggestedChange') return 'parentSuggestedChange';
  if (step === 'contractCelebration') return 'contractCelebration';
  if (step === 'missionThreeSelfieIntro') return 'missionThreeSelfieIntro';
  if (step === 'selfiePattern') return 'selfiePattern';

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
  return false;
}

function usesOwnFunnelBackground(step: ChildFlowStep): boolean {
  return (
    step === 'welcome' ||
    step === 'mintGlow' ||
    step === 'kingdomLanding' ||
    step === 'companionPick' ||
    step === 'runToCastle' ||
    step === 'selfiePattern'
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



/** `/onboarding/child` — kid funnel (bonding invite + ball game). */

export function OnboardingChildFlow() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const urlMeta = parseBondingInviteQueryParams(searchParams ?? new URLSearchParams());

  const bonding = useChildBondingContext();

  const [step, setStep] = useState<ChildFlowStep>(readInitialChildStep);
  const [, startGameTransition] = useTransition();



  // Invite URL wins over stored bonding (avoids RTDB/session flash flipping gender/art).
  const parentName = urlMeta.parentName ?? bonding?.parentName ?? 'אבא';

  const childName = urlMeta.childName?.trim() || bonding?.childName?.trim() || 'הילד/ה';

  const childGender = urlMeta.childGender ?? bonding?.childGender ?? 'boy';

  const parentGender = urlMeta.parentGender ?? bonding?.parentGender ?? 'male';

  const parentId = bonding?.parentId ?? null;

  const applyChildResumeStep = useCallback((next: string) => {
    setStep(next as ChildFlowStep);
  }, []);

  usePairingResume({
    role: 'child',
    parentId,
    inviteId: bonding?.inviteId ?? searchParams?.get('invite'),
    currentPath: '/onboarding/child',
    enabled: Boolean(parentId),
    onFunnelStep: applyChildResumeStep,
  });

  const postGameSyncEnabled =
    Boolean(parentId) &&
    (step === 'runToCastle' ||
      step === 'changeKing' ||
      step === 'waitingParentApproval' ||
      step === 'parentSuggestedChange' ||
      step === 'contractCelebration' ||
      step === 'missionThreeSelfieIntro' ||
      step === 'selfiePattern');

  const postGame = usePostGameSync({
    parentId,
    role: 'child',
    enabled: postGameSyncEnabled,
  });

  useEffect(() => {
    if (!postGame.childStep) return;

    switch (postGame.childStep) {
      case 'waitingParentApproval':
        if (step === 'parentSuggestedChange' || step === 'contractCelebration') {
          setStep('waitingParentApproval');
        }
        break;
      case 'parentSuggestedChange':
        if (step === 'waitingParentApproval') {
          setStep('parentSuggestedChange');
        }
        break;
      case 'contractCelebration':
        if (step === 'waitingParentApproval' || step === 'parentSuggestedChange') {
          setStep('contractCelebration');
        }
        break;
      case 'missionThreeSelfieIntro':
        if (
          step === 'waitingParentApproval' ||
          step === 'parentSuggestedChange' ||
          step === 'contractCelebration'
        ) {
          setStep('missionThreeSelfieIntro');
        }
        break;
      default:
        break;
    }
  }, [postGame.childStep, step]);



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
    if (postGame.agreedChangeText) {
      writePersistedChildAgreedChange(postGame.agreedChangeText);
    } else if (postGame.childChangeText) {
      writePersistedChildAgreedChange(postGame.childChangeText);
    }
  }, [postGame.agreedChangeText, postGame.childChangeText]);

  useEffect(() => {
    writePersistedChildFlowStep(step);
  }, [step]);

  const goToBallGame = useCallback(() => {
    const inviteId =
      bonding?.inviteId ?? new URLSearchParams(window.location.search).get('invite');
    const url = inviteId ? buildGameChildUrlWithInvite(inviteId) : '/game/child';

    if (bonding?.parentId) {
      void signalChildOnboardingMilestone(bonding.parentId, 'mission_ready').catch(() => {});
    }

    startGameTransition(() => {
      router.push(url);
    });
  }, [bonding?.inviteId, bonding?.parentId, router]);

  useEffect(() => {
    if (step !== 'doriRevealed') return;
    const inviteId =
      bonding?.inviteId ?? new URLSearchParams(window.location.search).get('invite');
    router.prefetch(inviteId ? buildGameChildUrlWithInvite(inviteId) : '/game/child');
  }, [bonding?.inviteId, router, step]);



  const onEggHatchComplete = () => {

    const parentId = bonding?.parentId;

    if (parentId) {

      void signalChildOnboardingMilestone(parentId, 'egg_complete').catch(() => {

        // parent may still advance via poll

      });

    }

    setStep('eggTransition');

  };



  return (

    <>

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
            onContinue={goToBallGame}
          />
        ) : null}



        {step === 'missionOneWin' ? (
          <ChildMissionOneWinStep
            childName={childName}
            onContinue={() => setStep('missionTwoIntro')}
          />
        ) : null}

        {step === 'missionTwoIntro' ? (
          <ChildMissionTwoIntroStep
            parentGender={parentGender}
            onContinue={() => setStep('runToCastle')}
          />
        ) : null}

        {step === 'runToCastle' ? (
          <ChildRunToCastleStep
            childName={childName}
            childGender={childGender}
            onChangeConfirmed={(changeText) => {
              writePersistedChildAgreedChange(changeText);
              void postGame.signalChangeSelected(changeText);
            }}
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
          <ChildWaitingParentApprovalStep parentGender={parentGender} />
        ) : null}

        {step === 'parentSuggestedChange' ? (
          <ChildParentSuggestedChangeStep
            childGender={childGender}
            parentGender={parentGender}
            changeText={postGame.parentSuggestedChangeText}
            onAccept={() => {
              if (postGame.agreedChangeText) {
                writePersistedChildAgreedChange(postGame.agreedChangeText);
              }
              void postGame.acceptParentChange();
            }}
            onDecline={() => {
              void postGame.declineParentChange();
            }}
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
          <ChildSelfieMissionFlow
            childName={childName}
            childGender={childGender}
            parentName={parentName}
            parentGender={parentGender}
            parentId={parentId}
            changeText={
              postGame.agreedChangeText ??
              postGame.childChangeText ??
              readPersistedChildAgreedChange()
            }
            onShareReached={() => {
              if (parentId) {
                void signalChildOnboardingMilestone(parentId, 'selfie_mission_done');
              }
            }}
          />
        ) : null}

      </OnboardingFunnelStepSlot>

    </>

  );

}

