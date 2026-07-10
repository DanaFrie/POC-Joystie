'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BallGameWinFadeOverlay } from '@/components/onboarding/game/BallGameWinFadeOverlay';
import { OnboardingBallGameScreen } from '@/components/onboarding/game/OnboardingBallGameScreen';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { OnboardingGridLayer } from '@/components/onboarding/OnboardingGridLayer';
import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { BallGameFunnelBackground } from '@/components/onboarding/game/BallGameFunnelBackground';
import { ParentAdditionalChangeStep } from '@/components/onboarding/parent/ParentAdditionalChangeStep';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
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
import { usePostGameSync } from '@/hooks/usePostGameSync';
import { endOnboardingGameRoom } from '@/lib/api/game';
import type { BallVector } from '@/lib/game/physics';
import {
  PARENT_WAITING_DORI_SELFIE_HEADLINE,
  parentWaitingAdditionalChangeApprovalHeadline,
  parentWaitingChildChangeHeadline,
} from '@/lib/onboarding/parentPostGameCopy';
import { finishParentOnboardingAndGoToDashboard } from '@/lib/onboarding/finishParentOnboarding';
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
  /** When set, `/game` exits to onboarding after win fade instead of waitingChildChange. */
  onWinFadeComplete?: () => void;
  onArenaPointer: (clientX: number, clientY: number, rect: DOMRect) => void;
  onConfirmReady: () => void;
  onRetry: () => void;
  setupBusy?: boolean;
  childJoinBlocked?: boolean;
  parentAsChildError?: string;
  setupError?: string | null;
  /** When set, completion CTA continues parent funnel on `/onboarding` instead of routing. */
  onFlowComplete?: () => void;
  /** When set, post-game waiting/review phases sync via RTDB (same pattern as pre-game). */
  parentId?: string | null;
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
  onFlowComplete,
  parentId,
  onWinFadeComplete,
}: ParentGamePostWinFlowProps) {
  const router = useRouter();
  const cleanupStarted = useRef(false);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [localAdditionalChange, setLocalAdditionalChange] = useState(false);
  const [awaitingChildOnProposal, setAwaitingChildOnProposal] = useState(false);
  const syncEnabled = Boolean(parentId) && phase !== 'game' && phase !== 'winFadeOut';
  const postGame = usePostGameSync({
    parentId,
    role: 'parent',
    enabled: syncEnabled,
  });
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
    const advance = window.setTimeout(() => {
      if (onWinFadeComplete) {
        onWinFadeComplete();
      } else {
        onPhaseChange('waitingChildChange');
      }
    }, PARENT_POST_GAME_WIN_FADE_MS);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(advance);
    };
  }, [phase, onPhaseChange, onWinFadeComplete]);

  useEffect(() => {
    if (!syncEnabled || !postGame.parentPhase) return;

    // Parent tapped "הציע שינוי נוסף" — local picker until שליחה.
    if (localAdditionalChange && phase === 'additionalChange') {
      return;
    }

    const targetPhase = postGame.parentPhase;

    if (
      awaitingChildOnProposal &&
      phase === 'waitingAdditionalChangeApproval' &&
      targetPhase === 'additionalChange'
    ) {
      return;
    }

    if (targetPhase === 'waitingAdditionalChangeApproval' || targetPhase === 'waitingDoriSelfie') {
      setAwaitingChildOnProposal(false);
    }

    if (targetPhase === 'additionalChange') {
      setAwaitingChildOnProposal(false);
      if (phase !== 'additionalChange') {
        setLocalAdditionalChange(true);
        onPhaseChange('additionalChange');
        return;
      }
      if (localAdditionalChange) return;
    }

    if (localAdditionalChange && targetPhase === 'waitingAdditionalChangeApproval') {
      setLocalAdditionalChange(false);
    }

    if (targetPhase !== phase) {
      onPhaseChange(targetPhase);
    }
  }, [
    syncEnabled,
    localAdditionalChange,
    awaitingChildOnProposal,
    postGame.parentPhase,
    phase,
    onPhaseChange,
  ]);

  useEffect(() => {
    if (syncEnabled) return;
    if (phase !== 'waitingChildChange') return;
    void runCleanup();
    const t = window.setTimeout(
      () => onPhaseChange('reviewChange'),
      PARENT_POST_GAME_WAIT_CHILD_CHANGE_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, onPhaseChange, runCleanup, syncEnabled]);

  useEffect(() => {
    if (syncEnabled) return;
    if (phase !== 'waitingAdditionalChangeApproval') return;
    const t = window.setTimeout(
      () => onPhaseChange('waitingDoriSelfie'),
      PARENT_POST_GAME_WAIT_ADDITIONAL_CHANGE_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, onPhaseChange, syncEnabled]);

  useEffect(() => {
    if (syncEnabled) return;
    if (phase !== 'waitingDoriSelfie') return;
    const t = window.setTimeout(
      () => onPhaseChange('onboardingComplete'),
      PARENT_POST_GAME_WAIT_DORI_SELFIE_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, onPhaseChange, syncEnabled]);

  const goToPostChangeWaiting = useCallback(
    (changeText: string) => {
      setLocalAdditionalChange(false);
      setAwaitingChildOnProposal(true);
      onPhaseChange('waitingAdditionalChangeApproval');
      if (syncEnabled) {
        void postGame.proposeAdditionalChange(changeText);
      }
    },
    [syncEnabled, postGame, onPhaseChange]
  );

  const handleApproveChildChange = useCallback(() => {
    onPhaseChange('waitingDoriSelfie');
    if (syncEnabled) {
      void postGame.approveChildChange();
    }
  }, [syncEnabled, postGame, onPhaseChange]);

  const handleSuggestMore = useCallback(() => {
    setLocalAdditionalChange(true);
    onPhaseChange('additionalChange');
  }, [onPhaseChange]);

  const handleCompletionContinue = useCallback(() => {
    sessionStorage.removeItem(ONBOARDING_PARENT_GAME_WON_KEY);
    sessionStorage.removeItem(FLOW_STEP_STORAGE_KEY);
    if (onFlowComplete) {
      onFlowComplete();
      return;
    }
    void finishParentOnboardingAndGoToDashboard(router, { subscription: true });
  }, [router, onFlowComplete]);

  if (phase === 'onboardingComplete') {
    return (
      <OnboardingFunnelStepSlot stepKey="parentOnboardingComplete" clipOverflow={false}>
        <ParentOnboardingCompletionStep onContinue={handleCompletionContinue} />
      </OnboardingFunnelStepSlot>
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
        <OnboardingMintGridBackdrop showGrid={false} />
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
        <OnboardingGridLayer className="!z-[15]" />
        <OnboardingWaitingScreenShell skipMintGlow staticLayout zIndex={20}>
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
          changeText={postGame.childChangeText}
          onApprove={handleApproveChildChange}
          onSuggestMore={handleSuggestMore}
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
          onBack={() => {
            setLocalAdditionalChange(false);
            if (postGame.merged.parent?.additionalNegotiationStarted) return;
            onPhaseChange('reviewChange');
          }}
        />
      </OnboardingFunnelStepSlot>
    );
  }

  return (
    <>
      <OnboardingFunnelStepSlot stepKey="parentBallGame" clipOverflow={false}>
        {childJoinBlocked ? (
          <FunnelStepRoot fitViewport className="overflow-hidden bg-transparent">
            <BallGameFunnelBackground />
            <div className="relative z-10 flex h-full items-center justify-center px-6 text-center font-assistant text-white">
              <p>{parentAsChildError}</p>
            </div>
          </FunnelStepRoot>
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
      </OnboardingFunnelStepSlot>
      {phase === 'winFadeOut' ? <BallGameWinFadeOverlay opacity={fadeOpacity} /> : null}
    </>
  );
}
