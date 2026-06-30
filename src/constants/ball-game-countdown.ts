/** Synchronized pre-play countdown — first rally only (ms from countdownAt). */
export const BALL_GAME_COUNTDOWN_TOTAL_MS = 5000;

export const BALL_GAME_COUNTDOWN_STEP_MS = 1000;

export type BallGameCountdownStep = 'ready' | '3' | '2' | '1' | 'go';

export function ballGameCountdownStep(elapsedMs: number): BallGameCountdownStep {
  if (elapsedMs < BALL_GAME_COUNTDOWN_STEP_MS) return 'ready';
  if (elapsedMs < BALL_GAME_COUNTDOWN_STEP_MS * 2) return '3';
  if (elapsedMs < BALL_GAME_COUNTDOWN_STEP_MS * 3) return '2';
  if (elapsedMs < BALL_GAME_COUNTDOWN_STEP_MS * 4) return '1';
  return 'go';
}
