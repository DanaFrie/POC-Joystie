/** Session keys for `/onboarding/child` funnel step persistence. */
export const ONBOARDING_CHILD_FLOW_STEP_KEY = 'onboardingChildFlowStep';

/** Set when child completed doriMissionIntro — skip in-game mission intro on `/game/child`. */
export const ONBOARDING_CHILD_DORI_MISSION_INTRO_DONE_KEY =
  'onboardingChildDoriMissionIntroDone';

const PERSISTED_STEPS = new Set([
  'welcome',
  'mintGlow',
  'kingdomLanding',
  'companionPick',
  'eggHatch',
  'eggTransition',
  'doriRevealed',
  'doriTransition',
  'doriMissionIntro',
  'missionOneWin',
  'missionTwoIntro',
  'missionTwoDoriShell',
  'runToCastle',
  'changeKing',
  'waitingParentApproval',
  'parentSuggestedChange',
  'contractCelebration',
  'missionThreeSelfieIntro',
  'selfiePattern',
  'preparingSharedPhoto',
  'sharedPhotoReview',
  'sharedPhotoShare',
]);

export function isPersistedChildFlowStep(step: string | null): step is string {
  return step != null && PERSISTED_STEPS.has(step);
}

export function readPersistedChildFlowStep(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(ONBOARDING_CHILD_FLOW_STEP_KEY);
  return isPersistedChildFlowStep(raw) ? raw : null;
}

export function writePersistedChildFlowStep(step: string): void {
  if (typeof window === 'undefined') return;
  if (!PERSISTED_STEPS.has(step)) return;
  sessionStorage.setItem(ONBOARDING_CHILD_FLOW_STEP_KEY, step);
}

export function markChildDoriMissionIntroDone(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ONBOARDING_CHILD_DORI_MISSION_INTRO_DONE_KEY, '1');
}

export function consumeChildDoriMissionIntroDone(): boolean {
  if (typeof window === 'undefined') return false;
  const done = sessionStorage.getItem(ONBOARDING_CHILD_DORI_MISSION_INTRO_DONE_KEY) === '1';
  if (done) sessionStorage.removeItem(ONBOARDING_CHILD_DORI_MISSION_INTRO_DONE_KEY);
  return done;
}
