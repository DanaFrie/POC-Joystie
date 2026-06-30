'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BallGameWinFadeOverlay } from '@/components/onboarding/game/BallGameWinFadeOverlay';
import { OnboardingBallGameScreen } from '@/components/onboarding/game/OnboardingBallGameScreen';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { OnboardingBlurFooter } from '@/components/onboarding/OnboardingBlurFooter';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { ChildFunnelBleedBackground } from '@/components/onboarding/child/ChildFunnelBleedBackground';
import { ParentAdditionalChangeStep } from '@/components/onboarding/parent/ParentAdditionalChangeStep';
import { ParentOnboardingCompletionStep } from '@/components/onboarding/parent/ParentOnboardingCompletionStep';
import { ParentReviewChildChangeStep } from '@/components/onboarding/parent/ParentReviewChildChangeStep';
import {
  PARENT_POST_GAME_WAIT_ADDITIONAL_CHANGE_MS,
  PARENT_POST_GAME_WAIT_CHILD_CHANGE_MS,
  PARENT_POST_GAME_WAIT_DORI_SELFIE_MS,
  PARENT_POST_GAME_WIN_FADE_MS,
} from '@/constants/parent-post-game-layout';
import { ONBOARDING_PARENT_GAME_WON_KEY } from '@/constants/onboarding-game';
import { useCelebrationBall } from '@/hooks/useCelebrationBall';
import { endOnboardingGameRoom } from '@/lib/api/game';
import type { BallVector } from '@/lib/game/physics';
import {
  PARENT_WAITING_DORI_SELFIE_HEADLINE,
  parentWaitingAdditionalChangeApprovalHeadline,
  parentWaitingChildChangeHeadline,
} from '@/lib/onboarding/parentPostGameCopy';
import { FLOW_STEP_STORAGE_KEY } from '@/lib/onboarding/parentFlowSession';
import { useOnboardingLightFunnel } from '@/lib/onboarding/useOnboardingLightFunnel';
import type { GameRoomState } from '@/types/game';

export type ParentPostGamePhase =
  | 'game'
  | 'winFadeOut'
  | 'waitingChildChange'
  | 'reviewChange'
  | 'additionalChange'
  | 'waitingAdditionalChangeApproval'
  | 'waitingDoriSelfie'
  | 'onboardingComplete';

type ParentGamePostWinFlowProps = {
  phase: ParentPostGamePhase;
  onPhaseChange: (phase: ParentPostGamePhase) => void;
  room: GameRoomState | null;
  roomId: string | null;
  childName: string;
  childGender: 'boy' | 'girl';
  parentName: string;
  parentGender: 'female' | 'male';
  onArenaPointer: (clientX: number, clientY: number, rect: DOMRect) => void;
  onConfirmReady: () => void;
  onRetry: () => void;
  setupBusy?: boolean;
  childJoinBlocked?: boolean;
  parentAsChildError?: string;
  setupError?: string | null;
  /** When set, completion CTA continues parent funnel on `/onboarding` instead of routing. */
  onFlowComplete?: () => void;
};

function ballSnapshotFromRoom(room: GameRoomState | null): BallVector | null {
  if (!room?.ball) return null;
  const { x, y, vx, vy, toward } = room.ball;
  return { x, y, vx, vy, toward };
}

/** Parent `/game` — cooperative win through review, frame wait, and completion. */
export function ParentGamePostWinFlow({
  phase,
  onPhaseChange,
  room,
  roomId,
  childName,
  childGender,
  parentName,
  parentGender,
  onArenaPointer,
  onConfirmReady,
  onRetry,
  setupBusy,
  childJoinBlocked,
  parentAsChildError,
  setupError,
  onFlowComplete,
}: ParentGamePostWinFlowProps) {
  const router = useRouter();
  const cleanupStarted = useRef(false);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const celebrationSeed = ballSnapshotFromRoom(room);
  const celebrationBall = useCelebrationBall(
    celebrationSeed,
    phase === 'winFadeOut' || phase === 'waitingChildChange'
  );

  useOnboardingLightFunnel(phase === 'onboardingComplete');

  const runCleanup = useCallback(async () => {
    if (!roomId || cleanupStarted.current) return;
    cleanupStarted.current = true;
    try {
      await endOnboardingGameRoom({ roomId });
    } catch {
      // Room may already be removed — post-win UI still advances
    }
  }, [roomId]);

  useEffect(() => {
    if (phase !== 'winFadeOut') return;
    const raf = window.requestAnimationFrame(() => setFadeOpacity(1));
    const advance = window.setTimeout(
      () => onPhaseChange('waitingChildChange'),
      PARENT_POST_GAME_WIN_FADE_MS
    );
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(advance);
    };
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== 'waitingChildChange') return;
    void runCleanup();
    const t = window.setTimeout(
      () => onPhaseChange('reviewChange'),
      PARENT_POST_GAME_WAIT_CHILD_CHANGE_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, onPhaseChange, runCleanup]);

  useEffect(() => {
    if (phase !== 'waitingAdditionalChangeApproval') return;
    const t = window.setTimeout(
      () => onPhaseChange('waitingDoriSelfie'),
      PARENT_POST_GAME_WAIT_ADDITIONAL_CHANGE_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== 'waitingDoriSelfie') return;
    const t = window.setTimeout(
      () => onPhaseChange('onboardingComplete'),
      PARENT_POST_GAME_WAIT_DORI_SELFIE_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, onPhaseChange]);

  const goToPostChangeWaiting = useCallback(() => {
    onPhaseChange('waitingAdditionalChangeApproval');
  }, [onPhaseChange]);

  const handleCompletionContinue = useCallback(() => {
    sessionStorage.removeItem(ONBOARDING_PARENT_GAME_WON_KEY);
    if (onFlowComplete) {
      sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'subscription');
      onFlowComplete();
      return;
    }
    sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'subscription');
    router.push('/onboarding');
  }, [router, onFlowComplete]);

  if (phase === 'onboardingComplete') {
    return (
      <>
        <OnboardingFunnelStepSlot stepKey="parentOnboardingComplete">
          <ParentOnboardingCompletionStep />
        </OnboardingFunnelStepSlot>
        <OnboardingBlurFooter blur={false} onClick={handleCompletionContinue}>
          המשך
        </OnboardingBlurFooter>
      </>
    );
  }

  if (
    phase === 'waitingChildChange' ||
    phase === 'waitingAdditionalChangeApproval' ||
    phase === 'waitingDoriSelfie'
  ) {
    const headline =
      phase === 'waitingChildChange'
        ? parentWaitingChildChangeHeadline(childName, childGender)
        : phase === 'waitingAdditionalChangeApproval'
          ? parentWaitingAdditionalChangeApprovalHeadline(childName, childGender)
          : PARENT_WAITING_DORI_SELFIE_HEADLINE;

    return (
      <>
        {phase === 'waitingChildChange' && celebrationBall && room ? (
          <div className="pointer-events-none absolute inset-0 z-[5] opacity-30">
            <OnboardingBallGameScreen
              role="parent"
              room={room}
              parentName={parentName}
              childName={childName}
              parentGender={parentGender}
              childGender={childGender}
              celebrationBall={celebrationBall}
              hideWinBanner
            />
          </div>
        ) : null}
        <OnboardingWaitingScreenShell zIndex={20}>
          <OnboardingWaitingCenterContent
            headline={headline}
            ariaLabel={headline}
          />
        </OnboardingWaitingScreenShell>
      </>
    );
  }

  if (phase === 'reviewChange') {
    return (
      <OnboardingFunnelStepSlot stepKey="parentReviewChange" clipOverflow={false}>
        <ParentReviewChildChangeStep
          childName={childName}
          childGender={childGender}
          onApprove={goToPostChangeWaiting}
          onSuggestMore={() => onPhaseChange('additionalChange')}
        />
      </OnboardingFunnelStepSlot>
    );
  }

  if (phase === 'additionalChange') {
    return (
      <OnboardingFunnelStepSlot stepKey="parentAdditionalChange" clipOverflow={false}>
        <ParentAdditionalChangeStep
          childName={childName}
          onConfirm={goToPostChangeWaiting}
          onBack={() => onPhaseChange('reviewChange')}
        />
      </OnboardingFunnelStepSlot>
    );
  }

  return (
    <>
      <ChildFunnelBleedBackground />
      <OnboardingFunnelStepSlot stepKey="parentBallGame" clipOverflow={false}>
        {childJoinBlocked ? (
          <div className="flex h-full items-center justify-center px-6 text-center font-assistant text-white">
            <p>{parentAsChildError}</p>
          </div>
        ) : (
          <OnboardingBallGameScreen
            role="parent"
            room={room}
            parentName={parentName}
            childName={childName}
            parentGender={parentGender}
            childGender={childGender}
            onPointerMove={onArenaPointer}
            onConfirmReady={onConfirmReady}
            onRetry={onRetry}
            busy={setupBusy}
            celebrationBall={phase === 'winFadeOut' ? celebrationBall : null}
            hideWinBanner={phase === 'winFadeOut'}
          />
        )}
        {setupError ? (
          <p className="absolute bottom-24 left-0 right-0 z-[50] px-6 text-center font-assistant text-sm text-red-300">
            {setupError}
          </p>
        ) : null}
      </OnboardingFunnelStepSlot>
      {phase === 'winFadeOut' ? <BallGameWinFadeOverlay opacity={fadeOpacity} /> : null}
    </>
  );
}
