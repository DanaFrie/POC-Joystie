import { publishOnboardingParentProgress } from '@/lib/onboarding/parentProgress';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ParentPostGameMilestones');

export type ParentPostGameMilestone =
  | 'child_change_approved'
  | 'additional_change_proposed';

/** Signal child post-game screens — RTDB (parent uid must match parentId). */
export async function signalParentPostGameMilestone(
  parentId: string,
  milestone: ParentPostGameMilestone,
  payload?: { additionalChangeText?: string }
): Promise<void> {
  const now = new Date().toISOString();

  const rtdbPatch: Partial<import('@/lib/onboarding/parentProgress').OnboardingParentProgress> =
    milestone === 'child_change_approved'
      ? {
          childChangeApproved: true,
          childChangeApprovedAt: now,
          additionalChangeText: null,
          additionalChangeProposedAt: null,
          additionalNegotiationStarted: false,
        }
      : {
          childChangeApproved: false,
          additionalChangeText: payload?.additionalChangeText ?? null,
          additionalChangeProposedAt: now,
          additionalNegotiationStarted: true,
        };

  try {
    await publishOnboardingParentProgress(parentId, rtdbPatch);
  } catch (error) {
    logger.warn('RTDB parent post-game milestone failed', { milestone, error });
  }
  // agreement_done: parent UI fires on approve + parent_state RTDB observe (parent-device only).
}

/** Parent clears additional change after child declines — returns to review pair. */
export async function clearParentAdditionalChangeProposal(parentId: string): Promise<void> {
  try {
    await publishOnboardingParentProgress(parentId, {
      additionalChangeText: null,
      additionalChangeProposedAt: null,
      additionalNegotiationStarted: false,
    });
  } catch (error) {
    logger.warn('clearParentAdditionalChangeProposal failed', error);
  }
}
