import { getChildrenByParent } from '@/lib/api/children';
import { updateUser } from '@/lib/api/users';
import { ensureUserProfileForLogin } from '@/lib/auth/ensureUserProfile';
import {
  classifyUserOnboarding,
  kidsAgesFromChildrenDocs,
  ONBOARDING_RESUME_KIND_KEY,
  type UserOnboardingRouteKind,
} from '@/lib/auth/userOnboardingStatus';
import { FLOW_STEP_STORAGE_KEY, LANDING_ACTIVE_KEY } from '@/lib/onboarding/parentFlowSession';
import {
  clearOnboardingChildrenSession,
  hydrateOnboardingChildrenFromChildrenDocs,
  hydrateOnboardingChildrenFromUser,
} from '@/lib/onboarding/hydrateChildrenFromUser';
import { markOnboardingAccountCreated } from '@/lib/onboarding/persistOnboardingAccount';
import type { FirestoreUser } from '@/types/firestore';
import { createSession } from '@/utils/session';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('PostLoginNavigation');

export type NavigateAfterLoginOptions = {
  /**
   * `signup_existing` — user hit sign-up with an existing email (login note).
   * Clears local funnel drafts before hydrating so signup-in-progress kids
   * do not overwrite Firestore / legacy children.
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
 * v0.2 users who already have children docs: mark onboarding complete and
 * normalize kidsAges so dashboard gate passes.
 */
async function migrateV02UserWithChildren(
  user: FirestoreUser,
  children: Awaited<ReturnType<typeof getChildrenByParent>>
): Promise<FirestoreUser> {
  const kidsAges = kidsAgesFromChildrenDocs(children);
  const primaryChildId = user.primaryChildId?.trim() || children[0]?.id;

  await updateUser(user.id, {
    onboarding: true,
    kidsAges: kidsAges.length ? kidsAges : user.kidsAges,
    ...(primaryChildId ? { primaryChildId } : {}),
    termsAccepted: user.termsAccepted ?? true,
  });

  return {
    ...user,
    onboarding: true,
    kidsAges: kidsAges.length ? kidsAges : user.kidsAges,
    ...(primaryChildId ? { primaryChildId } : {}),
  };
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

  if (isSignupExisting) {
    // Sign-up form drafts must not win over existing profile / children.
    clearOnboardingChildrenSession();
  }

  let children: Awaited<ReturnType<typeof getChildrenByParent>> | null = null;
  try {
    children = await getChildrenByParent(user.id);
  } catch (error) {
    logger.warn('Could not load children for routing', error);
    children = null;
  }

  let kind = classifyUserOnboarding(user, { children });
  let resolvedUser = user;

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
    if (children?.length) {
      try {
        resolvedUser = await migrateV02UserWithChildren(user, children);
      } catch (error) {
        logger.warn('v0.2 migration failed — routing to dashboard with hydrate only', error);
      }
      clearOnboardingChildrenSession();
      hydrateOnboardingChildrenFromChildrenDocs(children);
      setResumeKind('v02_legacy');
      return { path: '/dashboard', kind: 'complete', user: resolvedUser };
    }

    // Legacy string ages / primaryChildId without children docs:
    // different from v0.3 resume — clear signup drafts, hydrate ages only, still signupIntro.
    clearOnboardingChildrenSession();
    hydrateOnboardingChildrenFromUser(resolvedUser);
    prepareOnboardingIntroReturn('v02_legacy');
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
