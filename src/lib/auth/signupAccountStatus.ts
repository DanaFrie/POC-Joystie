import type { User } from 'firebase/auth';
import { checkAuthEmailExists } from '@/lib/api/auth';
import { getUser, getUserByEmail } from '@/lib/api/users';
import { isUserOnboardingComplete } from '@/lib/auth/postLoginNavigation';
import {
  classifyUserOnboarding,
  type UserOnboardingRouteKind,
} from '@/lib/auth/userOnboardingStatus';
import { getOAuthUserEmail } from '@/utils/auth-oauth';

export type SignupEmailAccountStatus = 'new' | 'incomplete' | 'complete' | 'legacy';

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

function statusFromRouteKind(kind: UserOnboardingRouteKind): SignupEmailAccountStatus {
  if (kind === 'complete') return 'complete';
  if (kind === 'v02_legacy') return 'legacy';
  if (kind === 'v03_resume') return 'incomplete';
  return 'incomplete';
}

export async function resolveSignupEmailAccountStatus(
  email: string
): Promise<SignupEmailAccountStatus> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 'new';

  const profile = await getUserByEmail(normalized);
  if (profile) {
    if (isUserOnboardingComplete(profile)) return 'complete';
    return statusFromRouteKind(classifyUserOnboarding(profile));
  }

  const exists = await checkAuthEmailExists(normalized);
  return exists ? 'incomplete' : 'new';
}

export function getOAuthAccountEmail(user: Pick<User, 'email' | 'providerData'>): string {
  return getOAuthUserEmail(user as User).trim().toLowerCase();
}
