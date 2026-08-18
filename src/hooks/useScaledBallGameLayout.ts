'use client';

import { useMemo } from 'react';
import {
  funnelProportionalTopPx,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import {
  CHILD_BALL_GAME,
  PARENT_BALL_GAME,
} from '@/constants/child-onboarding-layout';
import {
  BALL_GAME_COURT_BALL_SIZE,
  scaleBallGameLayout,
  type ScaledBallGameLayout,
} from '@/lib/game/ballGameCourt';
import type { GamePlayerRole } from '@/types/game';

export function useScaledBallGameLayout(role: GamePlayerRole): ScaledBallGameLayout {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const base = role === 'parent' ? PARENT_BALL_GAME : CHILD_BALL_GAME;

  return useMemo(
    () =>
      scaleBallGameLayout(base, (y) => funnelProportionalTopPx(y, usableCanvasHeightPx)),
    [base, usableCanvasHeightPx]
  );
}

export function useScaledBallGameBallSizePx(): number {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();

  return useMemo(
    () => funnelProportionalTopPx(BALL_GAME_COURT_BALL_SIZE, usableCanvasHeightPx),
    [usableCanvasHeightPx]
  );
}
