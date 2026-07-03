/** Dev-review back map — remove before release. */
const CHILD_REVIEW_PREVIOUS: Record<string, string> = {
  mintGlow: 'welcome',
  kingdomLanding: 'mintGlow',
  companionPick: 'kingdomLanding',
  eggHatch: 'companionPick',
  eggTransition: 'eggHatch',
  doriRevealed: 'eggTransition',
  doriTransition: 'doriRevealed',
  doriMissionIntro: 'doriTransition',
  missionOneWin: 'doriMissionIntro',
  missionTwoIntro: 'missionOneWin',
  missionTwoDoriShell: 'missionTwoIntro',
  runToCastle: 'missionTwoDoriShell',
  changeKing: 'runToCastle',
  waitingParentApproval: 'changeKing',
  parentSuggestedChange: 'waitingParentApproval',
  contractCelebration: 'parentSuggestedChange',
  missionThreeSelfieIntro: 'contractCelebration',
  selfiePattern: 'missionThreeSelfieIntro',
  preparingSharedPhoto: 'selfiePattern',
  sharedPhotoReview: 'preparingSharedPhoto',
  sharedPhotoShare: 'sharedPhotoReview',
};

export function getChildReviewPreviousStep(step: string): string | null {
  return CHILD_REVIEW_PREVIOUS[step] ?? null;
}

export function childReviewBackTone(step: string): 'dark' | 'light' {
  return step === 'eggHatch' ||
    step === 'eggTransition' ||
    step === 'missionOneWin' ||
    step === 'contractCelebration'
    ? 'light'
    : 'dark';
}
