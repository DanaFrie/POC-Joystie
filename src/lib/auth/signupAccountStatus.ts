import type { User } from 'firebase/auth';
import { checkAuthEmailExists } from '@/lib/api/auth';
import { getUser, getUserByEmail } from '@/lib/api/users';
import { isUserOnboardingComplete } from '@/lib/auth/postLoginNavigation';
import { getOAuthUserEmail } from '@/utils/auth-oauth';

export type SignupEmailAccountStatus = 'new' | 'incomplete' | 'complete';

/** Whether a Joystie profile exists for login / resume-signup routing. */
export async function isRegisteredJoystieAccount(
  uid: string,
  email?: string | null
): Promise<boolean> {
  const byUid = await getUser(uid, true);
  if (byUid) return true;

  const normalized = email?.trim().toLowerCase();
  if (normalized) {
    const byEmail = await getUserByEmail(normalized);
    if (byEmail) return true;
  }

  return false;
}

export async function resolveSignupEmailAccountStatus(
  email: string
): Promise<SignupEmailAccountStatus> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 'new';

  const profile = await getUserByEmail(normalized);
  if (profile) {
    return isUserOnboardingComplete(profile) ? 'complete' : 'incomplete';
  }

  const exists = await checkAuthEmailExists(normalized);
  return exists ? 'incomplete' : 'new';
}

export function getOAuthAccountEmail(user: Pick<User, 'email' | 'providerData'>): string {
  return getOAuthUserEmail(user as User).trim().toLowerCase();
}
