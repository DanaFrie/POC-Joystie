import { FLOW_STEP_STORAGE_KEY } from '@/lib/onboarding/parentFlowSession';
import { hydrateOnboardingChildrenFromUser } from '@/lib/onboarding/hydrateChildrenFromUser';
import { markOnboardingAccountCreated } from '@/lib/onboarding/persistOnboardingAccount';
import type { FirestoreUser } from '@/types/firestore';
export function isUserOnboardingComplete(user: FirestoreUser): boolean {
  return user.onboarding === true;
}

export function getPostLoginPath(user: FirestoreUser): '/dashboard' | '/onboarding' {
  return isUserOnboardingComplete(user) ? '/dashboard' : '/onboarding';
}

/** Persist funnel step before navigating to onboarding intro carousel. */
export function prepareOnboardingIntroReturn(): void {
  if (typeof window === 'undefined') return;
  markOnboardingAccountCreated();
  sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'signupIntro');
}

export function navigateAfterLogin(
  user: FirestoreUser,
  router: { push: (path: string) => void }
): void {
  if (isUserOnboardingComplete(user)) {
    router.push('/dashboard');
    return;
  }
  hydrateOnboardingChildrenFromUser(user);
  prepareOnboardingIntroReturn();
  router.push('/onboarding');
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
