import type { OnboardingChildProgress } from '@/lib/onboarding/childProgress';
import type { OnboardingParentProgress } from '@/lib/onboarding/parentProgress';
import type { ParentPostGamePhase } from '@/components/onboarding/parent/ParentGamePostWinFlow';

export type PostGameChildSyncStep =
  | 'waitingParentApproval'
  | 'parentSuggestedChange'
  | 'contractCelebration'
  | 'missionThreeSelfieIntro';

export type PostGameMergedProgress = {
  child: OnboardingChildProgress | null;
  parent: OnboardingParentProgress | null;
};

function hasPendingAdditionalChange(parent: OnboardingParentProgress | null): boolean {
  const text = parent?.additionalChangeText;
  return typeof text === 'string' && text.trim().length > 0;
}

/** Decline applies only to the current proposal — not a prior round. */
function isDeclineForCurrentProposal(
  child: OnboardingChildProgress | null,
  parent: OnboardingParentProgress | null
): boolean {
  if (!child?.parentChangeDeclined || !hasPendingAdditionalChange(parent)) return false;
  const proposedAt = parent?.additionalChangeProposedAt;
  const respondedAt = child.parentChangeRespondedAt;
  if (!proposedAt || !respondedAt) return true;
  return respondedAt >= proposedAt;
}

function isContractUnlocked(
  child: OnboardingChildProgress | null,
  parent: OnboardingParentProgress | null
): boolean {
  return Boolean(parent?.childChangeApproved || child?.parentChangeAccepted);
}

function isSelfiePathUnlocked(
  child: OnboardingChildProgress | null,
  parent: OnboardingParentProgress | null
): boolean {
  return isContractUnlocked(child, parent);
}

/** Parent post-game screen derived from merged RTDB progress. */
export function deriveParentPostGamePhase(
  merged: PostGameMergedProgress
): ParentPostGamePhase | null {
  const { child, parent } = merged;

  if (child?.selfieMissionDone) {
    return 'onboardingComplete';
  }

  if (isSelfiePathUnlocked(child, parent)) {
    return 'waitingDoriSelfie';
  }

  if (hasPendingAdditionalChange(parent)) {
    if (isDeclineForCurrentProposal(child, parent)) {
      return 'additionalChange';
    }
    return 'waitingAdditionalChangeApproval';
  }

  if (child?.changeSelected) {
    // After decline/clear, or when parent backs out of extra-change picker —
    // stay on review so they can approve the first change without an extra.
    return 'reviewChange';
  }

  return 'waitingChildChange';
}

/** Child post-game screen derived from merged RTDB progress (after change selected). */
export function deriveChildPostGameStep(
  merged: PostGameMergedProgress
): PostGameChildSyncStep | null {
  const { child, parent } = merged;

  if (!child?.changeSelected) return null;

  if (child.selfieMissionDone) {
    return null;
  }

  if (
    hasPendingAdditionalChange(parent) &&
    !isDeclineForCurrentProposal(child, parent) &&
    !child.parentChangeAccepted
  ) {
    return 'parentSuggestedChange';
  }

  if (isContractUnlocked(child, parent)) {
    if (child.parentChangeAccepted) {
      return 'missionThreeSelfieIntro';
    }
    return 'contractCelebration';
  }

  return 'waitingParentApproval';
}

export function mergePostGameProgress(
  child: OnboardingChildProgress | null,
  parent: OnboardingParentProgress | null
): PostGameMergedProgress {
  return { child, parent };
}

export function postGameChildChangeText(
  merged: PostGameMergedProgress
): string | undefined {
  return merged.child?.changeSelectedText?.trim() || undefined;
}

export function postGameParentSuggestedChangeText(
  merged: PostGameMergedProgress
): string | undefined {
  const text = merged.parent?.additionalChangeText;
  if (typeof text === 'string' && text.trim()) return text.trim();
  return undefined;
}

/**
 * Combine child's first change + parent's second when both exist (selfie / share card).
 * Matches finalizeParentOnboardingCompletion `collectOnboardingChanges` membership.
 */
export function formatAgreedChangeText(
  first: string | null | undefined,
  second: string | null | undefined
): string | undefined {
  const changes: string[] = [];
  const a = first?.trim();
  if (a) changes.push(a);
  const b = second?.trim();
  if (b && b !== a) changes.push(b);
  if (changes.length === 0) return undefined;
  if (changes.length === 1) return changes[0];
  return `${changes[0]}\nוגם ${changes[1]}`;
}

/** Agreed change copy for results / printed agreement image. */
export function postGameAgreedChangeText(
  merged: PostGameMergedProgress
): string | undefined {
  return formatAgreedChangeText(
    postGameChildChangeText(merged),
    postGameParentSuggestedChangeText(merged)
  );
}
