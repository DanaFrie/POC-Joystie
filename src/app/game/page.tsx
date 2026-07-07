'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ParentGamePostWinFlow,
  type ParentPostGamePhase,
} from '@/components/onboarding/parent/ParentGamePostWinFlow';
import { ONBOARDING_PARENT_GAME_WON_KEY } from '@/constants/onboarding-game';
import { useOnboardingGame } from '@/hooks/useOnboardingGame';
import { endOnboardingGameRoom } from '@/lib/api/game';
import { getSelectedFirstChildGender, getSelectedFirstChildName } from '@/lib/onboarding/bondingInvite';
import { FLOW_STEP_STORAGE_KEY } from '@/lib/onboarding/parentFlowSession';

function ParentGameInner() {
  const router = useRouter();
  const childName = getSelectedFirstChildName();
  const childGender = getSelectedFirstChildGender();
  const [postGamePhase, setPostGamePhase] = useState<ParentPostGamePhase>('game');

  const onParentGameWon = useCallback(() => {
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

  const onWinFadeComplete = useCallback(() => {
    if (roomId) {
      void endOnboardingGameRoom({ roomId }).catch(() => {});
    }
    sessionStorage.setItem(ONBOARDING_PARENT_GAME_WON_KEY, '1');
    sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'parentPostGame');
    router.push('/onboarding');
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
    />
  );
}

/** `/game` — parent cooperative ball game; win fade then `/onboarding` post-game funnel. */
export default function ParentGamePage() {
  return (
    <Suspense fallback={null}>
      <ParentGameInner />
    </Suspense>
  );
}
