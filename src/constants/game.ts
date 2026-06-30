/** Shared ball-game constants (onboarding + dev test). */

/** Cooperative win target — advance onboarding after this many paddle hits. */
export const GAME_WIN_SCORE = 10;

/** Placeholder next-step ids until onboarding routes wire real steps. */
export const GAME_ONBOARDING_NEXT_STEP = {
  parent: 'onboardingComplete',
  child: 'missionOneWin',
} as const;

export type GameOnboardingContext = {
  childId?: string;
  challengeId?: string;
  bondingInviteId?: string;
  /** Funnel step id when parent entered the game (for logs / analytics). */
  parentStepId?: string;
  /** Funnel step id when child entered the game. */
  childStepId?: string;
};
