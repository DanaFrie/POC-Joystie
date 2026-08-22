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
  isInProgressOnboardingFunnelStep,
} from '@/lib/onboarding/parentFlowSession';
import {
  clearOnboardingChildrenSession,
  hydrateSessionChildrenFromAccount,
} from '@/lib/onboarding/hydrateChildrenFromUser';
import { getOnboardingChildrenDetails, hasOnboardingChildrenDetails } from '@/lib/onboarding/childrenDetails';
import {
  markOnboardingAccountCreated,
  syncFunnelKidsAgesToUser,
} from '@/lib/onboarding/persistOnboardingAccount';
import type { FirestoreUser } from '@/types/firestore';
import { showSessionWaiter } from '@/lib/auth/sessionRouteWaiter';
import { createSession } from '@/utils/session';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('PostLoginNavigation');

const LOGGED_IN_DEST_KEY = 'joystieLoggedInDest';

export function markLoggedInDestination(path: '/dashboard' | '/onboarding') {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LOGGED_IN_DEST_KEY, path);
}

export function clearLoggedInDestination() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LOGGED_IN_DEST_KEY);
}

/** One-shot dest from /login session restore — skip a second gate on /onboarding. */
export function consumeLoggedInDestination(): '/dashboard' | '/onboarding' | null {
  if (typeof window === 'undefined') return null;
  const value = sessionStorage.getItem(LOGGED_IN_DEST_KEY);
  sessionStorage.removeItem(LOGGED_IN_DEST_KEY);
  if (value === '/dashboard' || value === '/onboarding') return value;
  return null;
}

export type NavigateAfterLoginOptions = {
  /**
   * `signup_existing` — user hit sign-up with an existing account.
   * Mid onboarding: funnel kids overwrite Firestore and resume at איך זה עובד.
   * Complete (dashboard): keep Firestore/children as-is — do not overwrite done kids.
   */
  source?: 'login' | 'signup_existing' | 'onboarding_gate';
  /** Prefer replace so session-restore doesn't stack /login or /onboarding. */
  replace?: boolean;
};

/** Warm dashboard cache so /dashboard can paint without a second waiter. */
export async function prefetchDashboardData(uid: string): Promise<void> {
  try {
    const { loadDashboardDataShared } = await import('@/lib/api/dashboard');
    await loadDashboardDataShared(uid);
  } catch (error) {
    logger.warn('Dashboard prefetch failed', error);
  }
}

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

  // Signup + existing Auth:
  // - complete → never overwrite done kids / children (dashboard stays stable)
  // - mid → write funnel kids to Firestore and resume at איך זה עובד
  let appliedFunnelKids = false;
  if (isSignupExisting) {
    if (kind === 'complete') {
      clearOnboardingChildrenSession();
    } else {
      const funnelKids = getOnboardingChildrenDetails();
      if (funnelKids?.length) {
        try {
          const kidsAges = await syncFunnelKidsAgesToUser(user.id);
          if (kidsAges?.length) {
            resolvedUser = { ...user, kidsAges, termsAccepted: true };
            appliedFunnelKids = true;
            kind = classifyUserOnboarding(resolvedUser, { children });
            logger.log('signup_existing mid — synced funnel kidsAges', {
              uid: user.id,
              kidsCount: kidsAges.length,
              kind,
            });
          }
        } catch (error) {
          logger.warn('Could not sync funnel kidsAges for signup_existing', error);
        }
      } else if (kind !== 'v02_legacy') {
        clearOnboardingChildrenSession();
      }
    }
  }

  if (kind === 'complete') {
    await hydrateSessionChildrenFromAccount(resolvedUser, children);
    setResumeKind('complete');
    return { path: '/dashboard', kind, user: resolvedUser };
  }

  // Logged-in visit to /login or /onboarding.
  // v0.2 login: start kids collection from the beginning (not pick-child placeholders).
  // v0.3 incomplete: «איך מתחילים?» (signupIntro) unless an in-progress funnel step is saved.
  if (source === 'login' || source === 'onboarding_gate') {
    const savedStep =
      typeof window !== 'undefined'
        ? sessionStorage.getItem(FLOW_STEP_STORAGE_KEY)
        : null;

    if (kind === 'v02_legacy') {
      const keepKidsCollection =
        source === 'onboarding_gate' &&
        hasOnboardingChildrenDetails() &&
        isInProgressOnboardingFunnelStep(savedStep);
      if (keepKidsCollection) {
        markOnboardingAccountCreated();
        setResumeKind('v02_legacy');
        logger.log('Onboarding gate — keep v02 kids collection', {
          uid: resolvedUser.id,
          step: savedStep,
        });
        return { path: '/onboarding', kind: 'v02_legacy', user: resolvedUser };
      }
      clearOnboardingChildrenSession();
      prepareV02LegacyKidsCollectionStart();
      logger.log('v02 login → onboarding from start (phoneCount)', {
        uid: resolvedUser.id,
        source,
      });
      return { path: '/onboarding', kind: 'v02_legacy', user: resolvedUser };
    }

    if (source === 'onboarding_gate' && isInProgressOnboardingFunnelStep(savedStep)) {
      markOnboardingAccountCreated();
      if (!hasOnboardingChildrenDetails()) {
        await hydrateSessionChildrenFromAccount(resolvedUser, children);
      }
      setResumeKind(kind === 'v03_resume' ? kind : 'fresh');
      logger.log('Onboarding gate — keep in-progress funnel', {
        uid: resolvedUser.id,
        step: savedStep,
        kind,
      });
      return { path: '/onboarding', kind, user: resolvedUser };
    }

    clearOnboardingChildrenSession();
    await hydrateSessionChildrenFromAccount(resolvedUser, children);
    const resumeKind: UserOnboardingRouteKind =
      kind === 'v03_resume' ? kind : 'fresh';
    prepareOnboardingIntroReturn(resumeKind);
    logger.log('Incomplete session → signupIntro (איך מתחילים?)', {
      uid: resolvedUser.id,
      source,
      resumeKind,
    });
    return { path: '/onboarding', kind: resumeKind, user: resolvedUser };
  }

  if (kind === 'v03_resume' || (isSignupExisting && appliedFunnelKids)) {
    if (!appliedFunnelKids) {
      clearOnboardingChildrenSession();
    }
    await hydrateSessionChildrenFromAccount(resolvedUser, children);
    // Mid signup-existing with new kids → איך זה עובד (pick child later).
    prepareOnboardingIntroReturn(
      appliedFunnelKids || kind === 'v03_resume' ? 'v03_resume' : kind
    );
    return {
      path: '/onboarding',
      kind: appliedFunnelKids ? 'v03_resume' : kind,
      user: resolvedUser,
    };
  }

  if (kind === 'v02_legacy') {
    if (source === 'signup_existing') {
      if (!appliedFunnelKids) {
        try {
          const kidsAges = await syncFunnelKidsAgesToUser(user.id);
          if (kidsAges?.length) {
            resolvedUser = { ...user, kidsAges };
            prepareOnboardingIntroReturn('v03_resume');
            logger.log('v02 signup → wrote session kids to profile', {
              uid: user.id,
              kidsCount: kidsAges.length,
            });
            return { path: '/onboarding', kind: 'v03_resume', user: resolvedUser };
          }
        } catch (error) {
          logger.warn('Could not sync funnel kidsAges for v02 signup resume', error);
        }
      } else {
        prepareOnboardingIntroReturn('v03_resume');
        return { path: '/onboarding', kind: 'v03_resume', user: resolvedUser };
      }
      prepareV02LegacyKidsCollectionStart();
      return { path: '/onboarding', kind: 'v02_legacy', user: resolvedUser };
    }

    clearOnboardingChildrenSession();
    prepareV02LegacyKidsCollectionStart();
    return { path: '/onboarding', kind: 'v02_legacy', user: resolvedUser };
  }

  // fresh — signup_existing with no kids payload.
  if (appliedFunnelKids) {
    prepareOnboardingIntroReturn('v03_resume');
    return { path: '/onboarding', kind: 'v03_resume', user: resolvedUser };
  }

  if (source === 'signup_existing') {
    clearOnboardingChildrenSession();
    prepareFreshOnboardingEntry();
  } else {
    setResumeKind('fresh');
  }
  return { path: '/onboarding', kind: 'fresh', user: resolvedUser };
}

export async function navigateAfterLogin(
  user: FirestoreUser,
  router: { push: (path: string) => void; replace: (path: string) => void },
  options?: NavigateAfterLoginOptions
): Promise<UserOnboardingRouteKind> {
  const { path, kind } = await resolveAuthenticatedUserDestination(user, options);
  if (path === '/dashboard') {
    showSessionWaiter();
    await prefetchDashboardData(user.id);
  }
  markLoggedInDestination(path);
  if (options?.replace) {
    router.replace(path);
  } else {
    router.push(path);
  }
  return kind;
}

/** Shared post-auth routing for login and returning OAuth sign-up users. */
export async function finishAuthenticatedUserNavigation(
  uid: string,
  router: { push: (path: string) => void; replace: (path: string) => void },
  options?: NavigateAfterLoginOptions
): Promise<UserOnboardingRouteKind> {
  createSession(uid);
  const userData = await ensureUserProfileForLogin(uid);
  return navigateAfterLogin(userData, router, options);
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
    // Logged-in + incomplete → parent funnel (never marketing landing).
    enterParentFlow: path === '/onboarding',
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
