import {
  GAME_ONBOARDING_NEXT_STEP,
  GAME_WIN_SCORE,
  type GameOnboardingContext,
} from '@/constants/game';
import type { GameRoomState } from '@/types/game';

export function buildChildGameUrl(
  origin: string,
  roomId: string,
  joinCode: string,
  /** Child ball game route. */
  basePath = '/game/child'
): string {
  const params = new URLSearchParams({
    mode: 'child',
    roomId,
    joinCode,
  });
  return `${origin}${basePath}?${params.toString()}`;
}

export function isGameWon(room: Pick<GameRoomState, 'phase' | 'winner' | 'score'>): boolean {
  return (
    room.phase === 'finished' &&
    room.winner === 'shared' &&
    room.score.shared >= GAME_WIN_SCORE
  );
}

export function isGameMissed(room: Pick<GameRoomState, 'phase' | 'winner'>): boolean {
  return room.phase === 'finished' && room.winner === null;
}

export function shouldAdvanceOnboarding(
  room: Pick<GameRoomState, 'phase' | 'winner' | 'score' | 'onboardingAdvanced'>
): boolean {
  return isGameWon(room) && room.onboardingAdvanced === true;
}

export function onboardingNextStepForRole(
  role: 'parent' | 'child',
  context?: GameOnboardingContext
): string {
  if (role === 'parent' && context?.parentStepId) return context.parentStepId;
  if (role === 'child' && context?.childStepId) return context.childStepId;
  return role === 'parent'
    ? GAME_ONBOARDING_NEXT_STEP.parent
    : GAME_ONBOARDING_NEXT_STEP.child;
}
