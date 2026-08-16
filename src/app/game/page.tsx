'use client';

import nextDynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import type { ParentPostGamePhase } from '@/components/onboarding/parent/ParentGamePostWinFlow';
import { ONBOARDING_PARENT_GAME_WON_KEY } from '@/constants/onboarding-game';
import { useOnboardingGame } from '@/hooks/useOnboardingGame';
import { usePairingResume } from '@/hooks/usePairingResume';
import { endOnboardingGameRoom } from '@/lib/api/game';
import { getBondingChildGender, getSelectedFirstChildGender, getSelectedFirstChildName } from '@/lib/onboarding/bondingInvite';
import { FLOW_STEP_STORAGE_KEY } from '@/lib/onboarding/parentFlowSession';

const ParentGamePostWinFlow = nextDynamic(
  () =>
    import('@/components/onboarding/parent/ParentGamePostWinFlow').then((m) => ({
      default: m.ParentGamePostWinFlow,
    })),
  { loading: () => <FunnelRouteLoading />, ssr: false }
);

function ParentGameInner() {
  const router = useRouter();
  const childName = getSelectedFirstChildName();
  const childGender = getBondingChildGender() ?? getSelectedFirstChildGender();
  const [postGamePhase, setPostGamePhase] = useState<ParentPostGamePhase>('game');
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    void import('@/utils/auth').then(({ getCurrentUserId }) => {
      void getCurrentUserId().then((uid) => {
        if (uid) setParentId(uid);
      });
    });
  }, []);

  const onParentGameWon = useCallback(() => {
    void import('@/utils/analytics').then(({ logEventOnce, AnalyticsEvents }) => {
      void logEventOnce('game_win:parent', AnalyticsEvents.GAME_WIN, { role: 'parent' });
    });
    setPostGamePhase('winFadeOut');
  }, []);

  const {
    room,
    roomId,
    parentName,
    parentGender,
    childName: resolvedChildName,
    onArenaPointer,
    onRetry,
    markPlayReady,
    setupBusy,
    setupError,
    childJoinBlocked,
    parentAsChildError,
  } = useOnboardingGame({
    role: 'parent',
    childName,
    onParentGameWon,
  });

  usePairingResume({
    role: 'parent',
    parentId,
    currentPath: '/game',
    enabled: Boolean(parentId) && postGamePhase === 'game',
  });

  const onWinFadeComplete = useCallback(() => {
    if (roomId) {
      void endOnboardingGameRoom({ roomId }).catch(() => {});
    }
    sessionStorage.setItem(ONBOARDING_PARENT_GAME_WON_KEY, '1');
    sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'parentPostGame');
    router.push('/onboarding', { scroll: false });
  }, [roomId, router]);

  return (
    <ParentGamePostWinFlow
      phase={postGamePhase}
      onPhaseChange={setPostGamePhase}
      onWinFadeComplete={onWinFadeComplete}
      room={room}
      roomId={roomId}
      childName={resolvedChildName}
      childGender={childGender}
      parentName={parentName}
      parentGender={parentGender}
      onArenaPointer={onArenaPointer}
      onConfirmReady={markPlayReady}
      onRetry={onRetry}
      setupBusy={setupBusy}
      childJoinBlocked={childJoinBlocked}
      parentAsChildError={parentAsChildError}
      setupError={setupError}
      parentId={parentId}
    />
  );
}

/** `/game` — parent cooperative ball game; win fade then `/onboarding` post-game funnel. */
export default function ParentGamePage() {
  return (
    <Suspense fallback={<FunnelRouteLoading />}>
      <ParentGameInner />
    </Suspense>
  );
}
