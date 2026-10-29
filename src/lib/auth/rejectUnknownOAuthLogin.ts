import type { User } from 'firebase/auth';
import {
  hasJoystieSignupEvidence,
  isRegisteredJoystieAccount,
} from '@/lib/auth/signupAccountStatus';
import { deleteUserDocument, getUser, getUserByEmail } from '@/lib/api/users';
import { clearSession } from '@/utils/session';
import { getOAuthUserEmail } from '@/utils/auth-oauth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('RejectUnknownOAuthLogin');

const UNKNOWN_ACCOUNT_MESSAGE = 'לא נמצא חשבון רשום. אנא הירשמו תחילה.';
const OAUTH_ONLY_PROVIDERS = new Set(['google.com', 'apple.com']);

export function getUnknownOAuthAccountMessage(): string {
  return UNKNOWN_ACCOUNT_MESSAGE;
}

function isOAuthOnlyAuthUser(user: User): boolean {
  const providers = user.providerData.map((p) => p.providerId);
  return (
    providers.length > 0 &&
    providers.every((id) => OAUTH_ONLY_PROVIDERS.has(id))
  );
}

/** First Google/Apple tap: Auth creationTime and lastSignInTime are the same instant. */
function isBrandNewAuthSession(user: User): boolean {
  const created = Date.parse(user.metadata.creationTime ?? '');
  const lastSignIn = Date.parse(user.metadata.lastSignInTime ?? '');
  if (!Number.isFinite(created) || !Number.isFinite(lastSignIn)) return false;
  return Math.abs(lastSignIn - created) < 30_000;
}

async function deleteUnregisteredUserDoc(uid: string): Promise<void> {
  try {
    const profile = await getUser(uid, false);
    if (profile && hasJoystieSignupEvidence(profile)) return;
    await deleteUserDocument(uid);
  } catch (error) {
    logger.warn('Could not delete OAuth stub profile', error);
  }
}

/**
 * Drop an OAuth session from the login page when no Joystie signup exists.
 * New Google/Apple Auth rows are deleted — signInWithPopup always creates them.
 * Do not delete if a password provider is linked (onboarding email account).
 */
export async function rejectUnknownOAuthLogin(
  _user: User,
  options?: { deleteAuthUser?: boolean }
): Promise<void> {
  if (options?.deleteAuthUser) {
    await deleteUnregisteredUserDoc(_user.uid);
    try {
      const { deleteUser } = await import('firebase/auth');
      await deleteUser(_user);
    } catch (deleteError) {
      logger.warn('deleteUser after unknown OAuth login failed', deleteError);
      try {
        const { signOutUser } = await import('@/utils/auth');
        await signOutUser();
      } catch (signOutError) {
        logger.warn('Sign-out after unknown OAuth login failed', signOutError);
      }
    }
  } else {
    try {
      const { signOutUser } = await import('@/utils/auth');
      await signOutUser();
    } catch (signOutError) {
      logger.warn('Sign-out after unknown OAuth login failed', signOutError);
    }
  }

  clearSession();
}

/**
 * Google/Apple login is allowed only when a Joystie account already exists
 * from onboarding. A first OAuth tap that only created Firebase Auth is rejected
 * and that Auth user is removed.
 */
export async function admitExistingJoystieOAuthLogin(
  user: User,
  isNewAuthUser = false
): Promise<boolean> {
  try {
    const treatAsNew = isNewAuthUser || isBrandNewAuthSession(user);
    if (treatAsNew) {
      const email = getOAuthUserEmail(user).trim().toLowerCase();
      const byEmail = email ? await getUserByEmail(email) : null;
      const emailTwin =
        Boolean(byEmail) &&
        byEmail!.id !== user.uid &&
        hasJoystieSignupEvidence(byEmail!);
      if (emailTwin) return true;
      await rejectUnknownOAuthLogin(user, { deleteAuthUser: true });
      return false;
    }

    const registered = await isRegisteredJoystieAccount(
      user.uid,
      getOAuthUserEmail(user)
    );
    if (registered) return true;
    await rejectUnknownOAuthLogin(user, {
      deleteAuthUser: isOAuthOnlyAuthUser(user),
    });
    return false;
  } catch (error) {
    logger.warn('admit OAuth login failed', error);
    await rejectUnknownOAuthLogin(user, {
      deleteAuthUser:
        isNewAuthUser || isBrandNewAuthSession(user) || isOAuthOnlyAuthUser(user),
    });
    return false;
  }
}
