'use client';

import { useEffect, useRef, useState } from 'react';
import { BallGameCourtBall } from '@/components/onboarding/game/BallGameCourtBall';
import { BallGameCourtLayer } from '@/components/onboarding/game/BallGameCourtLayer';
import { BallGameCountdownOverlay } from '@/components/onboarding/game/BallGameCountdownOverlay';
import { BallGameFailureOverlay } from '@/components/onboarding/game/BallGameFailureOverlay';
import { BallGameFunnelBackground } from '@/components/onboarding/game/BallGameFunnelBackground';
import { BallGameParentReadyScreen } from '@/components/onboarding/game/BallGameParentReadyScreen';
import { OnboardingWaitingOverlay } from '@/components/onboarding/OnboardingWaitingOverlay';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { GAME_WIN_SCORE } from '@/constants/game';
import {
  BALL_GAME_COUNTDOWN_STEP_MS,
  BALL_GAME_COUNTDOWN_TOTAL_MS,
} from '@/constants/ball-game-countdown';
import {
  useScaledBallGameBallSizePx,
  useScaledBallGameLayout,
} from '@/hooks/useScaledBallGameLayout';
import {
  ballGameWaitingHeadline,
  childPlayReadyConfirmLabel,
  parentCourtLabel,
  parentPlayReadyConfirmLabel,
} from '@/lib/onboarding/childBondingLabels';
import {
  ballGamePaddleWidthNorm,
  ballGamePlayCourt,
  paddlePixelRect,
} from '@/lib/game/ballGameCourt';
import { clampPaddleCenterX, type BallVector } from '@/lib/game/physics';
import { courtYForViewer, pointerXToCourt } from '@/lib/game/courtView';
import type { GamePlayerRole, GameRoomState } from '@/types/game';

type OnboardingBallGameScreenProps = {
  role: GamePlayerRole;
  room: GameRoomState | null;
  parentName: string;
  childName: string;
  parentGender?: 'female' | 'male' | null;
  childGender?: 'boy' | 'girl' | null;
  onPointerMove?: (clientX: number, clientY: number, rect: DOMRect) => void;
  onConfirmReady?: () => void;
  onRetry?: () => void;
  busy?: boolean;
  /** Post-win local ball motion while the court fades out. */
  celebrationBall?: BallVector | null;
  hideWinBanner?: boolean;
};

function courtPoint(
  x: number,
  y: number,
  role: GamePlayerRole,
  court: { top: number; left: number; width: number; height: number }
) {
  const viewY = courtYForViewer(y, role);
  return {
    left: court.left + x * court.width,
    top: court.top + viewY * court.height,
  };
}

/** Figma 13147:5630 / 13470:6234 (child) and 13245:21258 (parent, flipped). */
export function OnboardingBallGameScreen({
  role,
  room,
  parentName,
  childName,
  parentGender,
  childGender,
  onPointerMove,
  onConfirmReady,
  onRetry,
  busy,
  celebrationBall,
  hideWinBanner = false,
}: OnboardingBallGameScreenProps) {
  const layout = useScaledBallGameLayout(role);
  const ballSizePx = useScaledBallGameBallSizePx();
  const { designWidth, usableCanvasHeightPx } = useFunnelViewportMetrics();
  const playCourt = ballGamePlayCourt(layout);
  const courtParentGender: 'female' | 'male' =
    parentGender ??
    (parentName === 'female' ? 'female' : parentName === 'male' ? 'male' : 'male');
  const courtRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [localPaddleX, setLocalPaddleX] = useState<number | null>(null);
  const [countdownGo, setCountdownGo] = useState(false);

  const courtHitRect = (): DOMRect => {
    const root = rootRef.current;
    if (!root) {
      return new DOMRect(0, 0, playCourt.width, playCourt.height);
    }
    const bounds = root.getBoundingClientRect();
    const scaleX = bounds.width / designWidth;
    const scaleY = bounds.height / usableCanvasHeightPx;
    return new DOMRect(
      bounds.left + playCourt.left * scaleX,
      bounds.top + playCourt.top * scaleY,
      playCourt.width * scaleX,
      playCourt.height * scaleY
    );
  };

  const score = room?.score.shared ?? 0;
  const playing = room?.phase === 'playing';
  const countdown = room?.phase === 'countdown';
  const prePlay =
    room?.phase === 'waiting_child' ||
    room?.phase === 'waiting_ready' ||
    countdown;
  const playReady = room?.playReady ?? { parent: false, child: false };
  const selfReady = role === 'parent' ? playReady.parent : playReady.child;
  const missed = room?.phase === 'finished' && !room.winner;
  const won = room?.phase === 'finished' && room.winner === 'shared';
  const paddleWidthNorm = room?.paddles.width ?? ballGamePaddleWidthNorm(layout);

  const partnerReady = role === 'parent' ? playReady.child : playReady.parent;
  const roundStarted = Boolean(room?.hasStartedRound);
  const isFirstTry = Boolean(room && !room.hasStartedRound && !missed);

  const showReadyModal =
    role === 'parent' &&
    Boolean(
      room &&
        isFirstTry &&
        (room.phase === 'waiting_child' || room.phase === 'waiting_ready') &&
        !playReady.parent &&
        !countdown &&
        onConfirmReady
    );

  const showFailureCard = missed && !selfReady && Boolean(onRetry);

  /** First try: child waits for parent only. Retry: either side after self tap. */
  const showWaitingOverlay = Boolean(
    room &&
      !countdown &&
      ((isFirstTry &&
        role === 'child' &&
        !playReady.parent &&
        prePlay &&
        room.phase !== 'playing') ||
        (missed && selfReady && !partnerReady))
  );

  const waitingHeadline = ballGameWaitingHeadline(role, {
    childName,
    childGender,
    parentGender: courtParentGender,
  });

  const courtDimmed = showWaitingOverlay || countdown || missed;

  const readyConfirmLabel =
    role === 'parent'
      ? parentPlayReadyConfirmLabel(courtParentGender)
      : childPlayReadyConfirmLabel(parentCourtLabel(courtParentGender), courtParentGender);

  useEffect(() => {
    if (!playing) setLocalPaddleX(null);
  }, [playing]);

  useEffect(() => {
    if (!countdown || !room?.countdownAt) {
      setCountdownGo(false);
      return;
    }
    const startMs = new Date(room.countdownAt).getTime();
    const tick = () => {
      const elapsed = Date.now() - startMs;
      setCountdownGo(
        elapsed >= BALL_GAME_COUNTDOWN_STEP_MS * 4 &&
          elapsed < BALL_GAME_COUNTDOWN_TOTAL_MS
      );
    };
    tick();
    const id = window.setInterval(tick, 40);
    return () => window.clearInterval(id);
  }, [countdown, room?.countdownAt]);

  const emitPointer = (clientX: number, clientY: number) => {
    if (!onPointerMove) return;
    const rect = courtHitRect();
    const x = pointerXToCourt(clientX, rect);
    setLocalPaddleX(clampPaddleCenterX(x, paddleWidthNorm));
    onPointerMove(clientX, clientY, rect);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!playing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    emitPointer(e.clientX, e.clientY);
  };

  const onPointerDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!playing || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    emitPointer(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const liveBall = celebrationBall ?? (room && playing ? room.ball : null);
  const ballPos = liveBall
    ? courtPoint(liveBall.x, liveBall.y, role, playCourt)
    : null;
  const showCelebrationBall = Boolean(celebrationBall && ballPos);

  const selfRole: GamePlayerRole = role;
  const rivalRole: GamePlayerRole = role === 'parent' ? 'child' : 'parent';

  const renderPaddle = (
    paddleRole: GamePlayerRole,
    opacity: number,
    live?: { centerX: number; widthNorm: number }
  ) => {
    const rect = live
      ? paddlePixelRect(layout, paddleRole, live.centerX, live.widthNorm)
      : paddlePixelRect(layout, paddleRole, 0.5, ballGamePaddleWidthNorm(layout));
    return (
      <div
        key={paddleRole}
        className="pointer-events-none absolute z-10 rounded-[22px] bg-white"
        style={{ ...rect, opacity }}
      />
    );
  };

  return (
    <FunnelStepRoot
      fitViewport
      aria-label="משחק פונג"
      className="overflow-hidden bg-transparent font-assistant"
    >
      <BallGameFunnelBackground />

      <div ref={rootRef} className="absolute inset-0 overflow-hidden">
        <BallGameCourtLayer
          role={role}
          layout={layout}
          parentGender={courtParentGender}
          childName={childName}
          score={won ? GAME_WIN_SCORE : score}
          showScoreRing={playing || won || countdownGo}
          showPaddles={
            !roundStarted && !playing && !showReadyModal && !showFailureCard
          }
        />

        {courtDimmed ? (
          <div className="pointer-events-none absolute inset-0 z-[5] bg-[#092125]/25" aria-hidden />
        ) : null}

        {playing && room ? (
          <>
            {renderPaddle(rivalRole, 0.6, {
              centerX: rivalRole === 'parent' ? room.paddles.parentX : room.paddles.childX,
              widthNorm: paddleWidthNorm,
            })}
            {renderPaddle(selfRole, 1, {
              centerX:
                localPaddleX ??
                (selfRole === 'parent' ? room.paddles.parentX : room.paddles.childX),
              widthNorm: paddleWidthNorm,
            })}
          </>
        ) : null}

        <div
          ref={courtRef}
          className={`absolute inset-0 ${playing ? 'z-[30]' : 'pointer-events-none z-[5]'}`}
          style={{ touchAction: playing ? 'none' : undefined }}
          onPointerDown={playing ? onPointerDown : undefined}
          onPointerMove={playing ? onPointerDrag : undefined}
          onPointerUp={playing ? onPointerUp : undefined}
          onPointerCancel={playing ? onPointerUp : undefined}
          role="presentation"
          aria-label="מגרש המשחק"
        />

        {ballPos && (playing || showCelebrationBall) ? (
          <div
            className="pointer-events-none absolute z-[8] -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-75 ease-linear"
            style={{
              left: ballPos.left,
              top: ballPos.top,
              width: ballSizePx,
              height: ballSizePx,
            }}
          >
            <BallGameCourtBall sizePx={ballSizePx} />
          </div>
        ) : null}

        {won && !hideWinBanner ? (
          <p
            className="absolute left-1/2 z-10 -translate-x-1/2 text-center font-assistant text-[28px] font-black text-[#00E7A2]"
            style={{ top: layout.status.top, width: layout.status.width }}
          >
            {GAME_WIN_SCORE} נקודות — כל הכבוד!
          </p>
        ) : null}
      </div>

      {showReadyModal ? (
        <BallGameParentReadyScreen
          childName={childName}
          confirmLabel={readyConfirmLabel}
          onConfirm={onConfirmReady!}
        />
      ) : null}

      {showWaitingOverlay ? <OnboardingWaitingOverlay headline={waitingHeadline} /> : null}

      {countdown && room?.countdownAt ? (
        <BallGameCountdownOverlay countdownAt={room.countdownAt} />
      ) : null}

      {showFailureCard ? (
        <BallGameFailureOverlay onRetry={onRetry!} busy={busy} />
      ) : null}
    </FunnelStepRoot>
  );
}
