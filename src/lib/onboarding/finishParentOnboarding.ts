import { clearParentFlowSession } from '@/lib/onboarding/parentFlowSession';
import { getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('FinishParentOnboarding');

/**
 * Navigate to dashboard after completion.
 * Firestore onboarding/freemium + child create run on completion-screen appear.
 * Live RTDB funnel records drop here — not while the parent is still on Screen 66.
 */
export async function finishParentOnboardingAndGoToDashboard(
  router: { replace: (path: string) => void },
  options?: { subscription?: boolean }
): Promise<void> {
  const { finalizeParentOnboardingOnCompletionAppear } = await import(
    '@/lib/onboarding/finalizeParentOnboardingCompletion'
  );
  try {
    // Idempotent — appear handler may still be in flight.
    await finalizeParentOnboardingOnCompletionAppear();
  } catch (error) {
    logger.warn('Could not finalize onboarding before dashboard:', error);
    // Do not clear funnel / navigate — dashboard would bounce back to onboarding.
    throw error;
  }

  try {
    const parentId = await getCurrentUserIdAsync();
    if (parentId) {
      const [{ consumeOnboardingInviteRecords }, { getOnboardingBondingInviteId }, { getUser }] =
        await Promise.all([
          import('@/lib/onboarding/consumeOnboardingInvite'),
          import('@/lib/onboarding/bondingShare'),
          import('@/lib/api/users'),
        ]);
      const user = await getUser(parentId, false);
      await consumeOnboardingInviteRecords({
        parentId,
        inviteId: getOnboardingBondingInviteId() || user?.bondingInviteId,
      });
    }
  } catch (error) {
    logger.warn('Could not consume onboarding invite records before dashboard:', error);
  }

  clearParentFlowSession();
  router.replace(options?.subscription ? '/dashboard?subscription=1' : '/dashboard');
}
