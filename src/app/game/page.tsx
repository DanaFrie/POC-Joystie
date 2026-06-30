'use client';

import { Suspense } from 'react';
import { ParentGamePostWinFlow } from '@/components/onboarding/parent/ParentGamePostWinFlow';
import { useOnboardingGame } from '@/hooks/useOnboardingGame';
import { getSelectedFirstChildGender, getSelectedFirstChildName } from '@/lib/onboarding/bondingInvite';

function ParentGameInner() {
  const childName = getSelectedFirstChildName();
  const childGender = getSelectedFirstChildGender();

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
  });

  return (
    <ParentGamePostWinFlow
      phase="game"
      onPhaseChange={() => {}}
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

/** `/game` — parent cooperative ball game; win navigates to `/onboarding` post-game funnel. */
export default function ParentGamePage() {
  return (
    <Suspense fallback={null}>
      <ParentGameInner />
    </Suspense>
  );
}
