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
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { ParentOnboardingCompletionStep } from '@/components/onboarding/parent/ParentOnboardingCompletionStep';
import { ParentReviewChildChangeStep } from '@/components/onboarding/parent/ParentReviewChildChangeStep';
import {
  PARENT_POST_GAME_WAIT_ADDITIONAL_CHANGE_MS,
  PARENT_POST_GAME_WAIT_CHILD_CHANGE_MS,
  PARENT_POST_GAME_WAIT_COOP_MS,
  PARENT_POST_GAME_WAIT_DORI_SELFIE_MS,
  PARENT_POST_GAME_WAIT_WALLS_MS,
  PARENT_POST_GAME_WIN_FADE_MS,
  PARENT_POST_WIN_WALLS_IDEA_ICON,
  PARENT_POST_WIN_WALLS_IDEA_LEFT_PX,
  PARENT_POST_WIN_WALLS_IDEA_SIZE_PX,
  PARENT_POST_WIN_WALLS_IDEA_TOP_PX,
} from '@/constants/parent-post-game-layout';
import { ONBOARDING_PARENT_GAME_WON_KEY } from '@/constants/onboarding-game';
import { useCelebrationBall } from '@/hooks/useCelebrationBall';
import { usePostGameSync } from '@/hooks/usePostGameSync';
import { endOnboardingGameRoom } from '@/lib/api/game';
import type { BallVector } from '@/lib/game/physics';
import {
  PARENT_WAITING_DORI_SELFIE_HEADLINE,
  parentPostWinCoopHeadline,
  parentPostWinWallsHeadline,
  parentWaitingAdditionalChangeApprovalHeadline,
  parentWaitingChildChangeHeadline,
} from '@/lib/onboarding/parentPostGameCopy';
import { finishParentOnboardingAndGoToDashboard } from '@/lib/onboarding/finishParentOnboarding';
import { FLOW_STEP_STORAGE_KEY } from '@/lib/onboarding/parentFlowSession';
import { prefetchParentCompletionAgreement } from '@/lib/onboarding/prefetchParentCompletionAgreement';
import { useOnboardingLightFunnel } from '@/lib/onboarding/useOnboardingLightFunnel';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import type { GameRoomState } from '@/types/game';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ParentGamePostWinFlow');

export type ParentPostGamePhase =
  | 'game'
  | 'winFadeOut'
  | 'postWinCoop'
  | 'postWinWalls'
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
  /** When set, `/game` exits to onboarding after win fade instead of post-win waits. */
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

const LOCAL_POST_WIN_INTRO_PHASES: ParentPostGamePhase[] = [
  'postWinCoop',
  'postWinWalls',
];

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
  parentId,
  onWinFadeComplete,
}: ParentGamePostWinFlowProps) {
  const router = useRouter();
  const cleanupStarted = useRef(false);
  const completionPrefetchStarted = useRef(false);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [localAdditionalChange, setLocalAdditionalChange] = useState(false);
  const [awaitingChildOnProposal, setAwaitingChildOnProposal] = useState(false);
  /** Preloaded Storage URL — completion page mounts only after this is set (or fallback null). */
  const [agreementImageUrl, setAgreementImageUrl] = useState<string | null | undefined>(
    undefined
  );
  const isPostWinIntro = LOCAL_POST_WIN_INTRO_PHASES.includes(phase);
  const syncEnabled =
    Boolean(parentId) &&
    phase !== 'game' &&
    phase !== 'winFadeOut' &&
    !isPostWinIntro;
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
  const wallsIdeaTopPx = useFunnelProportionalTopPx(PARENT_POST_WIN_WALLS_IDEA_TOP_PX);

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
        onPhaseChange('postWinCoop');
      }
    }, PARENT_POST_GAME_WIN_FADE_MS);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(advance);
    };
  }, [phase, onPhaseChange, onWinFadeComplete]);

  useEffect(() => {
    if (phase !== 'postWinCoop') return;
    const t = window.setTimeout(
      () => onPhaseChange('postWinWalls'),
      PARENT_POST_GAME_WAIT_COOP_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== 'postWinWalls') return;
    const t = window.setTimeout(
      () => onPhaseChange('waitingChildChange'),
      PARENT_POST_GAME_WAIT_WALLS_MS
    );
    return () => window.clearTimeout(t);
  }, [phase, onPhaseChange]);

  /** Prefetch Storage agreement on waiting screen, then open Screen 66 (no in-page load). */
  const openCompletionAfterPrefetch = useCallback(() => {
    if (completionPrefetchStarted.current) return;
    completionPrefetchStarted.current = true;
    if (phase !== 'waitingDoriSelfie') {
      onPhaseChange('waitingDoriSelfie');
    }
    void (async () => {
      try {
        const result = await prefetchParentCompletionAgreement(parentId);
        setAgreementImageUrl(result.agreementImageUrl);
      } catch (error) {
        logger.warn('Completion agreement prefetch failed:', error);
        setAgreementImageUrl(null);
      } finally {
        onPhaseChange('onboardingComplete');
      }
    })();
  }, [phase, onPhaseChange, parentId]);

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

    // Stay on Dori selfie wait until Storage card URL is prefetched — no load on Screen 66.
    if (targetPhase === 'onboardingComplete') {
      if (phase === 'onboardingComplete') return;
      void import('@/utils/analytics').then(({ logEventOnce, AnalyticsEvents }) => {
        if (!parentId) return;
        void logEventOnce(`selfie_done:${parentId}`, AnalyticsEvents.SELFIE_DONE, {
          content_name: 'onboarding_accomplished',
          source: 'parent_observe',
        });
      });
      openCompletionAfterPrefetch();
      return;
    }

    // Tombstone clears the invite link — never sync-downgrade off selfie wait / Screen 66.
    if (
      completionPrefetchStarted.current ||
      phase === 'onboardingComplete' ||
      phase === 'waitingDoriSelfie'
    ) {
      return;
    }

    if (targetPhase === 'waitingDoriSelfie') {
      void import('@/utils/analytics').then(({ logEventOnce, AnalyticsEvents }) => {
        if (!parentId) return;
        void logEventOnce(`agreement_done:${parentId}`, AnalyticsEvents.AGREEMENT_DONE, {
          via: 'parent_observe',
        });
      });
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
    openCompletionAfterPrefetch,
    parentId,
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
    const t = window.setTimeout(() => {
      openCompletionAfterPrefetch();
    }, PARENT_POST_GAME_WAIT_DORI_SELFIE_MS);
    return () => window.clearTimeout(t);
  }, [phase, syncEnabled, openCompletionAfterPrefetch]);

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

  if (phase === 'onboardingComplete' && agreementImageUrl !== undefined) {
    return (
      <OnboardingFunnelStepSlot stepKey="parentOnboardingComplete" clipOverflow={false}>
        <ParentOnboardingCompletionStep
          agreementImageUrl={agreementImageUrl}
          childGender={childGender}
          onContinue={handleCompletionContinue}
        />
      </OnboardingFunnelStepSlot>
    );
  }

  if (
    phase === 'postWinCoop' ||
    phase === 'postWinWalls' ||
    phase === 'waitingChildChange' ||
    phase === 'waitingAdditionalChangeApproval' ||
    phase === 'waitingDoriSelfie' ||
    (phase === 'onboardingComplete' && agreementImageUrl === undefined)
  ) {
    const headline =
      phase === 'postWinCoop'
        ? parentPostWinCoopHeadline(childName, parentGender, childGender)
        : phase === 'postWinWalls'
          ? parentPostWinWallsHeadline(childName, parentGender, childGender)
          : phase === 'waitingChildChange'
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
          {phase === 'postWinWalls' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={PARENT_POST_WIN_WALLS_IDEA_ICON}
              alt=""
              className="pointer-events-none absolute z-[25]"
              style={{
                top: wallsIdeaTopPx,
                left: PARENT_POST_WIN_WALLS_IDEA_LEFT_PX,
                width: PARENT_POST_WIN_WALLS_IDEA_SIZE_PX,
                height: PARENT_POST_WIN_WALLS_IDEA_SIZE_PX,
              }}
              decoding="async"
            />
          ) : null}
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
          parentGender={parentGender}
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
        ) : setupError ? (
          <FunnelStepRoot fitViewport className="overflow-hidden bg-transparent">
            <BallGameFunnelBackground />
            <div className="relative z-10 flex h-full items-center justify-center px-6 text-center font-assistant text-white">
              <p>{setupError}</p>
            </div>
          </FunnelStepRoot>
        ) : !room ? (
          <FunnelRouteLoading headline="מתחברים למשחק" />
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
