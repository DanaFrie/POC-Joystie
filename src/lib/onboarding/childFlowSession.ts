/** Session keys for `/onboarding/child` funnel step persistence. */
export const ONBOARDING_CHILD_FLOW_STEP_KEY = 'onboardingChildFlowStep';

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
  'missionTwoChangeIntro',
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
