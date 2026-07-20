import { getChildrenByParent } from '@/lib/api/children';
import { ensureUserProfileForLogin } from '@/lib/auth/ensureUserProfile';
import {
  classifyUserOnboarding,
  ONBOARDING_RESUME_KIND_KEY,
  type UserOnboardingRouteKind,
} from '@/lib/auth/userOnboardingStatus';
import {
  FLOW_STEP_STORAGE_KEY,
  LANDING_ACTIVE_KEY,
} from '@/lib/onboarding/parentFlowSession';
import {
  clearOnboardingChildrenSession,
  hydrateOnboardingChildrenFromChildrenDocs,
  hydrateOnboardingChildrenFromUser,
} from '@/lib/onboarding/hydrateChildrenFromUser';
import {
  markOnboardingAccountCreated,
  syncFunnelKidsAgesToUser,
} from '@/lib/onboarding/persistOnboardingAccount';
import type { FirestoreUser } from '@/types/firestore';
import { createSession } from '@/utils/session';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('PostLoginNavigation');

export type NavigateAfterLoginOptions = {
  /**
   * `signup_existing` — user hit sign-up with an existing email (login note).
   * Clears local funnel drafts before hydrating so signup-in-progress kids
   * do not overwrite Firestore / legacy children — except v02_legacy, which
   * keeps funnel kidsAges and continues onboarding.
   */
  source?: 'login' | 'signup_existing' | 'onboarding_gate';
};

export function isUserOnboardingComplete(user: FirestoreUser): boolean {
  return user.onboarding === true;
}

export function getPostLoginPath(user: FirestoreUser): '/dashboard' | '/onboarding' {
  return isUserOnboardingComplete(user) ? '/dashboard' : '/onboarding';
}

function setResumeKind(kind: UserOnboardingRouteKind): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ONBOARDING_RESUME_KIND_KEY, kind);
}

/** Persist funnel step before navigating to onboarding intro carousel (signupIntro). */
export function prepareOnboardingIntroReturn(kind: UserOnboardingRouteKind = 'v03_resume'): void {
  if (typeof window === 'undefined') return;
  markOnboardingAccountCreated();
  sessionStorage.removeItem(LANDING_ACTIVE_KEY);
  sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'signupIntro');
  setResumeKind(kind);
}

/** Logged-in but no kids to resume — open landing (or stay) without forcing signupIntro. */
export function prepareFreshOnboardingEntry(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(FLOW_STEP_STORAGE_KEY);
  sessionStorage.setItem(LANDING_ACTIVE_KEY, '1');
  setResumeKind('fresh');
}

/**
 * Login as v0.2-legacy without v0.3 kidsAges — start kids funnel (phoneCount)
 * so the parent can enter proper kidsAges data.
 */
export function prepareV02LegacyKidsCollectionStart(): void {
  if (typeof window === 'undefined') return;
  markOnboardingAccountCreated();
  sessionStorage.removeItem(LANDING_ACTIVE_KEY);
  sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'phoneCount');
  setResumeKind('v02_legacy');
}

/**
 * Resolve route for a logged-in Firestore user (login, OAuth resume, /onboarding gate).
 */
export async function resolveAuthenticatedUserDestination(
  user: FirestoreUser,
  options?: NavigateAfterLoginOptions
): Promise<{
  path: '/dashboard' | '/onboarding';
  kind: UserOnboardingRouteKind;
  user: FirestoreUser;
}> {
  const source = options?.source ?? 'login';
  const isSignupExisting = source === 'signup_existing';

  let children: Awaited<ReturnType<typeof getChildrenByParent>> | null = null;
  try {
    children = await getChildrenByParent(user.id);
  } catch (error) {
    logger.warn('Could not load children for routing', error);
    children = null;
  }

  let kind = classifyUserOnboarding(user, { children });
  let resolvedUser = user;

  // Clear funnel drafts for signup-existing except v02_legacy (keep + store kidsAges).
  if (isSignupExisting && kind !== 'v02_legacy') {
    clearOnboardingChildrenSession();
  }

  if (kind === 'complete') {
    const hydrated = hydrateOnboardingChildrenFromUser(resolvedUser);
    if (!hydrated) {
      // Firestore has no kidsAges — do not keep stale funnel drafts.
      clearOnboardingChildrenSession();
      if (children?.length) {
        hydrateOnboardingChildrenFromChildrenDocs(children);
      }
    }
    setResumeKind('complete');
    return { path: '/dashboard', kind, user: resolvedUser };
  }

  if (kind === 'v03_resume') {
    // Firestore kidsAges are canonical for v0.3 resume.
    clearOnboardingChildrenSession();
    hydrateOnboardingChildrenFromUser(resolvedUser);
    prepareOnboardingIntroReturn('v03_resume');
    return { path: '/onboarding', kind, user: resolvedUser };
  }

  if (kind === 'v02_legacy') {
    if (source === 'login') {
      // No v0.3 kidsAges yet — start kids collection (do not auto-migrate to dashboard).
      clearOnboardingChildrenSession();
      prepareV02LegacyKidsCollectionStart();
      return { path: '/onboarding', kind: 'v02_legacy', user: resolvedUser };
    }

    if (source === 'signup_existing') {
      // Keep funnel kidsAges, write v0.3 shape to Firestore, continue onboarding.
      try {
        const kidsAges = await syncFunnelKidsAgesToUser(user.id);
        if (kidsAges?.length) {
          resolvedUser = { ...user, kidsAges };
        }
      } catch (error) {
        logger.warn('Could not sync funnel kidsAges for v02 signup resume', error);
      }
      prepareOnboardingIntroReturn('v02_legacy');
      return { path: '/onboarding', kind: 'v02_legacy', user: resolvedUser };
    }

    // onboarding_gate — stay in funnel; do not force dashboard migration.
    setResumeKind('v02_legacy');
    return { path: '/onboarding', kind: 'v02_legacy', user: resolvedUser };
  }

  // fresh — Auth/Firestore with no kids payload.
  // Login / signup-existing: clear stale local drafts (Firestore empty = empty).
  // Onboarding gate: keep in-progress funnel kids (user may still be filling the form).
  if (source === 'login' || source === 'signup_existing') {
    clearOnboardingChildrenSession();
    prepareFreshOnboardingEntry();
  } else {
    setResumeKind('fresh');
  }
  return { path: '/onboarding', kind: 'fresh', user: resolvedUser };
}

export async function navigateAfterLogin(
  user: FirestoreUser,
  router: { push: (path: string) => void },
  options?: NavigateAfterLoginOptions
): Promise<UserOnboardingRouteKind> {
  const { path, kind } = await resolveAuthenticatedUserDestination(user, options);
  router.push(path);
  return kind;
}

/** Shared post-auth routing for login and returning OAuth sign-up users. */
export async function finishAuthenticatedUserNavigation(
  uid: string,
  router: { push: (path: string) => void },
  options?: NavigateAfterLoginOptions
): Promise<void> {
  createSession(uid);
  const userData = await ensureUserProfileForLogin(uid);
  await navigateAfterLogin(userData, router, options);
}

/**
 * Gate for `/onboarding` when Auth session already exists.
 * Returns the destination path (caller should replace if not staying).
 */
export async function resolveOnboardingEntryForAuthenticatedUser(
  uid: string
): Promise<{
  path: '/dashboard' | '/onboarding';
  kind: UserOnboardingRouteKind;
  enterParentFlow: boolean;
}> {
  const userData = await ensureUserProfileForLogin(uid);
  const { path, kind } = await resolveAuthenticatedUserDestination(userData, {
    source: 'onboarding_gate',
  });

  return {
    path,
    kind,
    // fresh → landing; v02_legacy / v03_resume → parent funnel
    enterParentFlow: path === '/onboarding' && kind !== 'fresh',
  };
}

export function redirectToLoginForExistingAccount(
  router: { push: (path: string) => void },
  email?: string,
  options?: { reason?: 'resume' | 'password_provider' }
): void {
  const params = new URLSearchParams();
  if (email?.trim()) {
    params.set('email', email.trim().toLowerCase());
  }
  if (options?.reason === 'password_provider') {
    params.set('method', 'password');
  } else {
    params.set('existing', '1');
  }
  router.push(`/login?${params.toString()}`);
}

export function buildLoginQueryString(options?: {
  email?: string;
  existing?: boolean;
  method?: 'password';
}): string {
  const params = new URLSearchParams();
  if (options?.email?.trim()) {
    params.set('email', options.email.trim().toLowerCase());
  }
  if (options?.existing) {
    params.set('existing', '1');
  }
  if (options?.method === 'password') {
    params.set('method', 'password');
  }
  return params.toString();
}

export function getLoginPath(options?: {
  email?: string;
  existing?: boolean;
  method?: 'password';
}): string {
  const qs = buildLoginQueryString(options);
  return qs ? `/login?${qs}` : '/login';
}

export function getForgotPasswordPath(options?: {
  email?: string;
  existing?: boolean;
  method?: 'password';
}): string {
  const qs = buildLoginQueryString(options);
  return qs ? `/login/forgot-password?${qs}` : '/login/forgot-password';
}
