import type { User } from 'firebase/auth';
import { clearSession } from '@/utils/session';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('RejectUnknownOAuthLogin');

const UNKNOWN_ACCOUNT_MESSAGE = 'לא נמצא חשבון רשום. אנא הירשמו תחילה.';

export function getUnknownOAuthAccountMessage(): string {
  return UNKNOWN_ACCOUNT_MESSAGE;
}

/**
 * Drop an OAuth session from the login page when no Joystie signup exists.
 * Sign out only — never deleteUser. Deleting broke Apple re-login (same Apple ID
 * got a new Auth uid while the Firestore profile stayed on the old uid).
 */
export async function rejectUnknownOAuthLogin(_user: User): Promise<void> {
  try {
    const { signOutUser } = await import('@/utils/auth');
    await signOutUser();
  } catch (signOutError) {
    logger.warn('Sign-out after unknown OAuth login failed', signOutError);
  }

  clearSession();
}
