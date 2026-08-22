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

  if (milestone === 'child_change_approved') {
    try {
      const { logEventOnce, AnalyticsEvents } = await import('@/utils/analytics');
      await logEventOnce(
        `agreement_done:${parentId}`,
        AnalyticsEvents.AGREEMENT_DONE,
        { via: 'parent_approve' }
      );
    } catch (error) {
      logger.warn('Agreement analytics failed', error);
    }
  }
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
