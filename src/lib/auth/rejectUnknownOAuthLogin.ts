import type { User } from 'firebase/auth';
import { clearSession } from '@/utils/session';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('RejectUnknownOAuthLogin');

const UNKNOWN_ACCOUNT_MESSAGE = 'לא נמצא חשבון רשום. אנא הירשמו תחילה.';

export function getUnknownOAuthAccountMessage(): string {
  return UNKNOWN_ACCOUNT_MESSAGE;
}

/** Remove an OAuth session created on the login page when no Joystie profile exists. */
export async function rejectUnknownOAuthLogin(user: User): Promise<void> {
  try {
    const { deleteUser } = await import('firebase/auth');
    await deleteUser(user);
  } catch (error) {
    logger.warn('Could not delete unknown OAuth user — signing out instead', error);
    try {
      const { signOutUser } = await import('@/utils/auth');
      await signOutUser();
    } catch (signOutError) {
      logger.warn('Sign-out after unknown OAuth login failed', signOutError);
    }
  }

  clearSession();
}
