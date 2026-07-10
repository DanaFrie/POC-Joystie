import { clearParentFlowSession } from '@/lib/onboarding/parentFlowSession';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('FinishParentOnboarding');

/**
 * Navigate to dashboard after completion.
 * Firestore onboarding/freemium + child create run on completion-screen appear.
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

  clearParentFlowSession();
  router.replace(options?.subscription ? '/dashboard?subscription=1' : '/dashboard');
}
