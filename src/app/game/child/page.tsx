'use client';

import { Suspense, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ChildGamePostWinFlow,
  type ChildPostGamePhase,
} from '@/components/onboarding/child/ChildGamePostWinFlow';
import { ChildMissionOneStep } from '@/components/onboarding/child/ChildMissionOneStep';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { ChildFunnelBleedBackground } from '@/components/onboarding/child/ChildFunnelBleedBackground';
import { useChildBondingContext } from '@/hooks/useChildBondingContext';
import { useOnboardingGame } from '@/hooks/useOnboardingGame';
import { decodeParentToken, parseBondingInviteQueryParams } from '@/utils/url-encoding';

function ChildGameInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const bonding = useChildBondingContext();
  const urlMeta = parseBondingInviteQueryParams(searchParams);
  const decoded = token ? decodeParentToken(token) : null;

  const parentId = bonding?.parentId ?? decoded?.parentId ?? null;
  const inviteId = bonding?.inviteId;
  const childName = bonding?.childName;
  const parentName = bonding?.parentName;

  const [postGamePhase, setPostGamePhase] = useState<ChildPostGamePhase>('game');

  const onChildGameWon = useCallback(() => {
    setPostGamePhase('winFadeOut');
  }, []);

  const game = useOnboardingGame({
    role: 'child',
    parentId,
    inviteId,
    childName,
    parentName,
    showMissionIntro: true,
    onChildGameWon,
  });

  if (game.missionPhase) {
    return (
      <>
        <ChildFunnelBleedBackground />
        <OnboardingFunnelStepSlot stepKey="childMissionOne" clipOverflow={false}>
          <ChildMissionOneStep
            parentGender={game.parentGender ?? bonding?.parentGender ?? 'male'}
            onContinue={game.confirmMissionAndPlay}
          />
        </OnboardingFunnelStepSlot>
      </>
    );
  }

  return (
    <ChildGamePostWinFlow
      phase={postGamePhase}
      onPhaseChange={setPostGamePhase}
      room={game.room}
      parentName={game.parentName}
      childName={game.childName}
      parentGender={game.parentGender ?? bonding?.parentGender}
      childGender={bonding?.childGender ?? urlMeta.childGender}
      onArenaPointer={game.onArenaPointer}
      onConfirmReady={game.markPlayReady}
      onRetry={game.onRetry}
      setupBusy={game.setupBusy}
      childJoinBlocked={game.childJoinBlocked}
      parentAsChildError={game.parentAsChildError}
      setupError={game.setupError}
    />
  );
}

/** `/game/child` — child onboarding ball game + court exit fade. */
export default function ChildGamePage() {
  return (
    <Suspense fallback={null}>
      <ChildGameInner />
    </Suspense>
  );
}
