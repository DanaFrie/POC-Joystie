'use client';

import nextDynamic from 'next/dynamic';
import { Suspense, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { ChildInviteAccessFailure } from '@/components/onboarding/child/ChildInvalidInviteStep';
import { ChildMissionOneStep } from '@/components/onboarding/child/ChildMissionOneStep';
import type { ChildPostGamePhase } from '@/components/onboarding/child/ChildGamePostWinFlow';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { ChildMintFunnelBackground } from '@/components/onboarding/game/ChildMintFunnelBackground';
import { useChildBondingBootstrap } from '@/hooks/useChildBondingBootstrap';
import { useChildBondingContext } from '@/hooks/useChildBondingContext';
import { useChildInviteAccess } from '@/hooks/useChildInviteAccess';
import { useOnboardingGame } from '@/hooks/useOnboardingGame';
import { parseBondingInviteQueryParams } from '@/utils/url-encoding';

const ChildGamePostWinFlow = nextDynamic(
  () =>
    import('@/components/onboarding/child/ChildGamePostWinFlow').then((m) => ({
      default: m.ChildGamePostWinFlow,
    })),
  { loading: () => <FunnelRouteLoading />, ssr: false }
);

function ChildGameInner() {
  const searchParams = useSearchParams();
  const inviteAccess = useChildInviteAccess();
  const hasInvite = Boolean(searchParams?.get('invite')?.trim());
  const bonding = useChildBondingContext();
  const urlMeta = parseBondingInviteQueryParams(searchParams ?? new URLSearchParams());

  useChildBondingBootstrap(inviteAccess.status === 'ready' ? inviteAccess : null);

  const parentId =
    bonding?.parentId ??
    (inviteAccess.status === 'ready' ? inviteAccess.parentId : null);
  const inviteId =
    bonding?.inviteId ??
    (inviteAccess.status === 'ready' ? inviteAccess.inviteId : undefined) ??
    searchParams?.get('invite') ??
    undefined;
  const childName = bonding?.childName || urlMeta.childName || undefined;
  const parentName = bonding?.parentName || urlMeta.parentName || undefined;

  const [postGamePhase, setPostGamePhase] = useState<ChildPostGamePhase>('game');

  const onChildGameWon = useCallback(() => {
    void import('@/utils/analytics').then(({ logEventOnce, AnalyticsEvents }) => {
      void logEventOnce('game_win:child', AnalyticsEvents.GAME_WIN, { role: 'child' });
    });
    setPostGamePhase('winFadeOut');
  }, []);

  const inviteFailed =
    hasInvite &&
    inviteAccess.status !== 'ready' &&
    inviteAccess.status !== 'loading';

  const game = useOnboardingGame({
    role: 'child',
    parentId: inviteFailed ? null : parentId,
    inviteId: inviteFailed ? undefined : inviteId,
    childName,
    parentName,
    showMissionIntro: true,
    onChildGameWon,
  });

  if (hasInvite && inviteAccess.status !== 'ready') {
    if (inviteAccess.status === 'loading') {
      return <FunnelRouteLoading />;
    }
    return <ChildInviteAccessFailure status={inviteAccess.status} />;
  }

  if (game.missionPhase) {
    return (
      <>
        <ChildMintFunnelBackground />
        <OnboardingFunnelStepSlot stepKey="childMissionOne" clipOverflow={false}>
          <ChildMissionOneStep
            parentGender={
              game.parentGender ?? bonding?.parentGender ?? urlMeta.parentGender ?? 'male'
            }
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
      parentGender={game.parentGender ?? bonding?.parentGender ?? urlMeta.parentGender}
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
    <Suspense fallback={<FunnelRouteLoading />}>
      <ChildGameInner />
    </Suspense>
  );
}
