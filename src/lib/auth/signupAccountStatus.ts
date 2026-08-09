import type { User } from 'firebase/auth';
import { checkAuthEmailExists } from '@/lib/api/auth';
import { getUser, getUserByEmail } from '@/lib/api/users';
import { isUserOnboardingComplete } from '@/lib/auth/postLoginNavigation';
import {
  classifyUserOnboarding,
  type UserOnboardingRouteKind,
} from '@/lib/auth/userOnboardingStatus';
import type { FirestoreUser } from '@/types/firestore';
import { getOAuthUserEmail } from '@/utils/auth-oauth';

export type SignupEmailAccountStatus = 'new' | 'incomplete' | 'complete' | 'legacy';

/**
 * Stub from `authOnUserCreated` is not enough — login OAuth must only succeed
 * after a real Joystie signup (terms / kids / finished onboarding).
 */
export function hasJoystieSignupEvidence(
  user: Pick<
    FirestoreUser,
    'termsAccepted' | 'onboarding' | 'kidsAges' | 'primaryChildId'
  >
): boolean {
  if (user.termsAccepted === true) return true;
  if (user.onboarding === true) return true;
  if (Boolean(user.primaryChildId?.trim())) return true;
  if (Array.isArray(user.kidsAges) && user.kidsAges.length > 0) return true;
  return false;
}

/** Whether this Auth uid completed Joystie signup (not Auth stub only). */
export async function isRegisteredJoystieAccount(
  uid: string,
  _email?: string | null
): Promise<boolean> {
  // Prefer fresh read — cache can keep a deleted/recreated Auth uid looking registered.
  const byUid = await getUser(uid, false);
  if (byUid && hasJoystieSignupEvidence(byUid)) return true;
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
