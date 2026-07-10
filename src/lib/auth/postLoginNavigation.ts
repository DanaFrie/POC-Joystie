import { ensureUserProfileForLogin } from '@/lib/auth/ensureUserProfile';
import { FLOW_STEP_STORAGE_KEY } from '@/lib/onboarding/parentFlowSession';
import { hydrateOnboardingChildrenFromUser } from '@/lib/onboarding/hydrateChildrenFromUser';
import { markOnboardingAccountCreated } from '@/lib/onboarding/persistOnboardingAccount';
import type { FirestoreUser } from '@/types/firestore';
import { createSession } from '@/utils/session';

export function isUserOnboardingComplete(user: FirestoreUser): boolean {
  return user.onboarding === true;
}

export function getPostLoginPath(user: FirestoreUser): '/dashboard' | '/onboarding' {
  return isUserOnboardingComplete(user) ? '/dashboard' : '/onboarding';
}

/** Persist funnel step before navigating to onboarding intro carousel (signupIntro / intoSignup1). */
export function prepareOnboardingIntroReturn(): void {
  if (typeof window === 'undefined') return;
  markOnboardingAccountCreated();
  sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'signupIntro');
}

export function navigateAfterLogin(
  user: FirestoreUser,
  router: { push: (path: string) => void }
): void {
  hydrateOnboardingChildrenFromUser(user);

  if (isUserOnboardingComplete(user)) {
    router.push('/dashboard');
    return;
  }

  prepareOnboardingIntroReturn();
  router.push('/onboarding');
}

/** Shared post-auth routing for login and returning OAuth sign-up users. */
export async function finishAuthenticatedUserNavigation(
  uid: string,
  router: { push: (path: string) => void }
): Promise<void> {
  createSession(uid);
  const userData = await ensureUserProfileForLogin(uid);
  navigateAfterLogin(userData, router);
}
export function redirectToLoginForExistingAccount(
  router: { push: (path: string) => void },
  email?: string
): void {
  const params = new URLSearchParams();
  if (email?.trim()) {
    params.set('email', email.trim().toLowerCase());
  }
  params.set('existing', '1');
  router.push(`/login?${params.toString()}`);
}

export function buildLoginQueryString(options?: {
  email?: string;
  existing?: boolean;
}): string {
  const params = new URLSearchParams();
  if (options?.email?.trim()) {
    params.set('email', options.email.trim().toLowerCase());
  }
  if (options?.existing) {
    params.set('existing', '1');
  }
  return params.toString();
}

export function getLoginPath(options?: { email?: string; existing?: boolean }): string {
  const qs = buildLoginQueryString(options);
  return qs ? `/login?${qs}` : '/login';
}

export function getForgotPasswordPath(options?: {
  email?: string;
  existing?: boolean;
}): string {
  const qs = buildLoginQueryString(options);
  return qs ? `/login/forgot-password?${qs}` : '/login/forgot-password';
}
