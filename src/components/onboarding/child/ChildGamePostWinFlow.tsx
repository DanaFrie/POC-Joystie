'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BallGameWinFadeOverlay } from '@/components/onboarding/game/BallGameWinFadeOverlay';
import { OnboardingBallGameScreen } from '@/components/onboarding/game/OnboardingBallGameScreen';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { ChildFunnelBleedBackground } from '@/components/onboarding/child/ChildFunnelBleedBackground';
import { CHILD_POST_GAME_WIN_FADE_MS } from '@/constants/child-post-game-layout';
import { ONBOARDING_CHILD_GAME_WON_KEY } from '@/constants/onboarding-game';
import { useCelebrationBall } from '@/hooks/useCelebrationBall';
import type { BallVector } from '@/lib/game/physics';
import type { GameRoomState } from '@/types/game';

export type ChildPostGamePhase = 'game' | 'winFadeOut';

type ChildGamePostWinFlowProps = {
  phase: ChildPostGamePhase;
  onPhaseChange: (phase: ChildPostGamePhase) => void;
  room: GameRoomState | null;
  parentName: string;
  childName: string;
  parentGender?: 'female' | 'male';
  childGender?: 'boy' | 'girl';
  onArenaPointer: (clientX: number, clientY: number, rect: DOMRect) => void;
  onConfirmReady: () => void;
  onRetry: () => void;
  setupBusy: boolean;
  childJoinBlocked: boolean;
  parentAsChildError?: string;
  setupError?: string | null;
};

function ballSnapshotFromRoom(room: GameRoomState | null): BallVector | null {
  if (!room?.ball) return null;
  return {
    x: room.ball.x,
    y: room.ball.y,
    vx: room.ball.vx,
    vy: room.ball.vy,
  };
}

/** Child `/game/child` — court exit fade then hand off to onboarding post-game. */
export function ChildGamePostWinFlow({
  phase,
  onPhaseChange,
  room,
  parentName,
  childName,
  parentGender,
  childGender,
  onArenaPointer,
  onConfirmReady,
  onRetry,
  setupBusy,
  childJoinBlocked,
  parentAsChildError,
  setupError,
}: ChildGamePostWinFlowProps) {
  const router = useRouter();
  const navigated = useRef(false);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const celebrationSeed = ballSnapshotFromRoom(room);
  const celebrationBall = useCelebrationBall(
    celebrationSeed,
    phase === 'winFadeOut'
  );

  const navigateToPostGame = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    sessionStorage.setItem(ONBOARDING_CHILD_GAME_WON_KEY, '1');
    const path = `/onboarding/child${window.location.search}`;
    router.push(path);
  }, [router]);

  useEffect(() => {
    if (phase !== 'winFadeOut') return;
    const raf = window.requestAnimationFrame(() => setFadeOpacity(1));
    const advance = window.setTimeout(navigateToPostGame, CHILD_POST_GAME_WIN_FADE_MS);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(advance);
    };
  }, [phase, navigateToPostGame]);

  return (
    <>
      <ChildFunnelBleedBackground />
      <OnboardingFunnelStepSlot stepKey="childBallGame" clipOverflow={false}>
        {childJoinBlocked ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center font-assistant text-white">
            <p>{parentAsChildError}</p>
          </div>
        ) : (
          <OnboardingBallGameScreen
            role="child"
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
