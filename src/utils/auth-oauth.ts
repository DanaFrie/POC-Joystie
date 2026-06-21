import type { AuthError, User, UserCredential } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { isOAuthRedirectRecoverable } from '@/lib/onboarding/oauthSession';
import { getAuthErrorFromUnknown } from '@/utils/auth-errors';
import { isLocalDevHost } from '@/utils/is-local-dev-host';
import { createContextLogger } from '@/utils/logger';

const oauthLog = createContextLogger('OAuth');

export type OAuthProviderId = 'google.com' | 'apple.com';

export type OAuthSignInResult =
  | { ok: true; user: User; isNewUser: boolean }
  | { ok: false; errorMessage: string; errorCode: string };

const OAUTH_PROVIDER_IDS: OAuthProviderId[] = ['google.com', 'apple.com'];

const REDIRECT_PROMISE_KEY = '__joystie_oauth_redirect_promise';

function isEmbeddedFrame(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Google blocks OAuth in embedded WebViews (Cursor IDE, Electron, in-app browsers). */
export function isRestrictedOAuthEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  if (isEmbeddedFrame()) return true;
  return (
    /Cursor|Electron|EdgA|FBAN|FBAV|Instagram|Line\//i.test(ua) ||
    (/\bwv\b/i.test(ua) && /Android/i.test(ua))
  );
}

export function getRestrictedOAuthMessage(): string {
  return 'Google חוסם התחברות מדפדפן מוטמע (כולל תצוגה בתוך Cursor). פתחו את האתר ב-Chrome או Safari.';
}

export function getOnboardingParentExternalUrl(): string {
  if (typeof window === 'undefined') return '/onboarding';
  return `${window.location.origin}/onboarding`;
}

export function prefersOAuthRedirect(): boolean {
  if (typeof window === 'undefined') return false;
  // Redirect OAuth is unreliable on localhost (incl. mobile viewport / DevTools).
  if (isLocalDevHost()) return false;
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isSafari =
    /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua);
  return isMobile || isSafari || window.innerWidth < 768;
}

/** True when the browser likely just returned from Google/Apple/Firebase auth handler. */
export function isLikelyOAuthRedirectReturn(): boolean {
  if (typeof document === 'undefined') return false;
  const ref = document.referrer;
  if (!ref) return false;
  return (
    /accounts\.google\.com|appleid\.apple\.com|firebaseapp\.com/i.test(ref) ||
    /\/__\/auth\/handler/i.test(ref)
  );
}

async function resolveIsNewUser(credential: UserCredential): Promise<boolean> {
  const { getAdditionalUserInfo } = await import('firebase/auth');
  const info = getAdditionalUserInfo(credential);
  return info?.isNewUser ?? false;
}

async function signInWithProviderPopup(providerId: OAuthProviderId): Promise<OAuthSignInResult> {
  try {
    const { signInWithPopup, GoogleAuthProvider, OAuthProvider } = await import('firebase/auth');
    const auth = await getAuthInstance();
    await prepareAuthForOAuthSignIn();

    const provider =
      providerId === 'google.com'
        ? new GoogleAuthProvider()
        : new OAuthProvider('apple.com');

    if (providerId === 'google.com') {
      provider.setCustomParameters({ prompt: 'select_account' });
    }
    if (providerId === 'apple.com') {
      provider.addScope('email');
      provider.addScope('name');
    }

    oauthLog.log('popup:start', { providerId });
    const credential = await signInWithPopup(auth, provider);
    const isNewUser = await resolveIsNewUser(credential);
    oauthLog.log('popup:success', {
      providerId,
      uid: credential.user.uid,
      email: credential.user.email,
      isNewUser,
    });
    return { ok: true, user: credential.user, isNewUser };
  } catch (error) {
    const authError = error as AuthError;
    oauthLog.warn('popup:error', {
      providerId,
      code: authError.code,
      message: authError.message,
    });
    return {
      ok: false,
      errorCode: authError.code || 'unknown',
      errorMessage: getAuthErrorFromUnknown(error),
    };
  }
}

async function signInWithProviderRedirect(providerId: OAuthProviderId): Promise<void> {
  const { signInWithRedirect, GoogleAuthProvider, OAuthProvider } = await import('firebase/auth');
  const auth = await getAuthInstance();
  await prepareAuthForOAuthSignIn();
  const provider =
    providerId === 'google.com'
      ? new GoogleAuthProvider()
      : new OAuthProvider('apple.com');
  if (providerId === 'google.com') {
    provider.setCustomParameters({ prompt: 'select_account' });
  }
  oauthLog.log('redirect:start', {
    providerId,
    origin: typeof window !== 'undefined' ? window.location.href : '',
  });
  await signInWithRedirect(auth, provider);
}

/**
 * Google sign-in. Uses redirect on mobile/Safari; popup elsewhere.
 */
export async function signInWithGoogle(options?: {
  useRedirect?: boolean;
}): Promise<OAuthSignInResult | { ok: true; redirecting: true }> {
  const useRedirect = options?.useRedirect ?? prefersOAuthRedirect();
  oauthLog.log('google:mode', { useRedirect, restricted: isRestrictedOAuthEnvironment() });
  if (useRedirect) {
    await signInWithProviderRedirect('google.com');
    return { ok: true, redirecting: true };
  }
  const result = await signInWithProviderPopup('google.com');
  if (!result.ok && result.errorCode === 'auth/popup-blocked') {
    await signInWithProviderRedirect('google.com');
    return { ok: true, redirecting: true };
  }
  if (!result.ok && result.errorCode === 'auth/popup-closed-by-user') {
    return result;
  }
  return result;
}

/**
 * Apple sign-in. Uses redirect on mobile/Safari; popup elsewhere.
 */
export async function signInWithApple(options?: {
  useRedirect?: boolean;
}): Promise<OAuthSignInResult | { ok: true; redirecting: true }> {
  const useRedirect = options?.useRedirect ?? prefersOAuthRedirect();
  if (useRedirect) {
    await signInWithProviderRedirect('apple.com');
    return { ok: true, redirecting: true };
  }
  const result = await signInWithProviderPopup('apple.com');
  if (!result.ok && result.errorCode === 'auth/popup-closed-by-user') {
    return result;
  }
  if (!result.ok && result.errorCode === 'auth/popup-blocked') {
    await signInWithProviderRedirect('apple.com');
    return { ok: true, redirecting: true };
  }
  return result;
}

export function userHasOAuthProvider(user: User): boolean {
  return user.providerData.some((p) =>
    OAUTH_PROVIDER_IDS.includes(p.providerId as OAuthProviderId)
  );
}

export function userMatchesOAuthProvider(
  user: User,
  providerId: OAuthProviderId
): boolean {
  return user.providerData.some((p) => p.providerId === providerId);
}

function hasOAuthProvider(user: User): boolean {
  return userHasOAuthProvider(user);
}

/** Email on user or linked provider (Google may hydrate providerData before user.email). */
export function getOAuthUserEmail(user: User): string {
  if (user.email) return user.email;
  for (const provider of user.providerData) {
    if (provider.email) return provider.email;
  }
  return '';
}

function isOAuthUser(user: User): boolean {
  if (hasOAuthProvider(user)) return true;
  // Fresh redirect: currentUser may exist before providerData hydrates.
  return user.providerData.length === 0 && Boolean(user.email);
}

async function hydrateOAuthUser(user: User): Promise<User> {
  if (user.email && user.providerData.length > 0) return user;
  try {
    await user.reload();
    oauthLog.log('hydrate:reloaded', {
      email: user.email,
      providerIds: user.providerData.map((p) => p.providerId),
    });
  } catch (error) {
    oauthLog.warn('hydrate:reload-failed', error);
  }
  return user;
}

function pickOAuthUser(
  user: User | null,
  options?: { trustAnySignedInUser?: boolean }
): User | null {
  if (!user || user.isAnonymous) return null;
  const email = getOAuthUserEmail(user);
  const linked = hasOAuthProvider(user);
  if (options?.trustAnySignedInUser) {
    return email || linked ? user : null;
  }
  return isOAuthUser(user) && (email || linked) ? user : null;
}

/** Sign out any existing session so Google/Apple redirect is not conflated with email/password. */
export async function prepareAuthForOAuthSignIn(): Promise<void> {
  const { signOut } = await import('firebase/auth');
  const auth = await getAuthInstance();
  const user = auth.currentUser;
  if (!user) return;

  oauthLog.log('prepare:signOut-before-oauth', {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
    email: user.email,
    providerIds: user.providerData.map((p) => p.providerId),
  });
  await signOut(auth);
}

async function waitForOAuthUser(
  maxWaitMs = 20000,
  options?: { trustAnySignedInUser?: boolean }
): Promise<User | null> {
  const { onAuthStateChanged } = await import('firebase/auth');
  const auth = await getAuthInstance();

  const pickUser = (user: User | null) => pickOAuthUser(user, options);

  if (auth.currentUser) {
    const hydrated = await hydrateOAuthUser(auth.currentUser);
    const immediate = pickUser(hydrated);
    if (immediate) return immediate;
  }

  return new Promise((resolve) => {
    let settled = false;
    let unsub = () => {};

    const finish = (user: User | null) => {
      if (settled) return;
      settled = true;
      unsub();
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      resolve(user);
    };

    unsub = onAuthStateChanged(auth, (user) => {
      void (async () => {
        if (!user) return;
        const hydrated = await hydrateOAuthUser(user);
        const picked = pickUser(hydrated);
        if (picked) finish(picked);
      })();
    });

    const interval = window.setInterval(() => {
      void (async () => {
        const current = auth.currentUser;
        if (!current) return;
        const hydrated = await hydrateOAuthUser(current);
        const picked = pickUser(hydrated);
        if (picked) finish(picked);
      })();
    }, 300);

    const timeout = window.setTimeout(() => {
      finish(pickUser(auth.currentUser));
    }, maxWaitMs);
  });
}

/** Fallback when getRedirectResult is empty but Auth session exists after redirect. */
export async function resolveOAuthPendingUser(
  maxWaitMs = 12000,
  options?: { trustAnySignedInUser?: boolean }
): Promise<OAuthSignInResult | null> {
  const user = await waitForOAuthUser(maxWaitMs, options);
  if (!user) return null;
  return { ok: true, user, isNewUser: true };
}

async function completeOAuthRedirectOnce(): Promise<OAuthSignInResult | null> {
  try {
    const { getRedirectResult, getAdditionalUserInfo } = await import('firebase/auth');
    const auth = await getAuthInstance();
    // Must run immediately after Auth init — waiting for auth state first loses redirect on Safari.
    const credential = await getRedirectResult(auth);
    if (credential?.user) {
      const info = getAdditionalUserInfo(credential);
      oauthLog.log('redirect:result', {
        uid: credential.user.uid,
        email: credential.user.email,
        isNewUser: info?.isNewUser ?? false,
        providerIds: credential.user.providerData.map((p) => p.providerId),
      });
      return {
        ok: true,
        user: credential.user,
        isNewUser: info?.isNewUser ?? false,
      };
    }

    // Redirect may hydrate currentUser shortly after getRedirectResult returns null.
    const recoverable = isOAuthRedirectRecoverable();
    const waitMs = recoverable ? (auth.currentUser ? 8000 : 3000) : 0;
    const user =
      waitMs > 0 ? await waitForOAuthUser(waitMs) : null;
    if (user) {
      oauthLog.log('redirect:currentUser-fallback', {
        uid: user.uid,
        email: getOAuthUserEmail(user),
        providerIds: user.providerData.map((p) => p.providerId),
      });
      return { ok: true, user, isNewUser: true };
    }

    if (isOAuthRedirectRecoverable()) {
      oauthLog.warn('redirect:result-empty', {
        hasCurrentUser: Boolean(auth.currentUser),
        isAnonymous: auth.currentUser?.isAnonymous ?? false,
        currentEmail: auth.currentUser?.email ?? null,
        providerIds: auth.currentUser?.providerData.map((p) => p.providerId) ?? [],
      });
    }
    return null;
  } catch (error) {
    oauthLog.error('redirect:result-error', error);
    return {
      ok: false,
      errorCode: (error as AuthError).code || 'unknown',
      errorMessage: getAuthErrorFromUnknown(error),
    };
  }
}

function getRedirectResultPromise(): Promise<OAuthSignInResult | null> {
  if (typeof window === 'undefined') {
    return completeOAuthRedirectOnce();
  }

  const globalWindow = window as typeof window & {
    [REDIRECT_PROMISE_KEY]?: Promise<OAuthSignInResult | null>;
  };

  if (!globalWindow[REDIRECT_PROMISE_KEY]) {
    globalWindow[REDIRECT_PROMISE_KEY] = completeOAuthRedirectOnce();
  }

  return globalWindow[REDIRECT_PROMISE_KEY];
}

/**
 * Call once on onboarding mount after redirect-based OAuth.
 * Singleton — safe under React Strict Mode double-mount and HMR.
 */
export async function completeOAuthRedirectIfNeeded(): Promise<OAuthSignInResult | null> {
  return getRedirectResultPromise();
}

/** Start capturing redirect result as early as possible on page load. */
export function primeOAuthRedirectCapture(): void {
  if (typeof window === 'undefined') return;
  void getRedirectResultPromise();
}

/** Reset redirect capture singleton so a retry can call getRedirectResult again (HMR / failed recovery). */
export function clearOAuthRedirectCapture(): void {
  if (typeof window === 'undefined') return;
  const globalWindow = window as typeof window & {
    [REDIRECT_PROMISE_KEY]?: Promise<OAuthSignInResult | null>;
  };
  delete globalWindow[REDIRECT_PROMISE_KEY];
}

/**
 * Resolve OAuth user after redirect — single path via completeOAuthRedirectIfNeeded
 * (getRedirectResult + one auth-state wait; no stacked fallbacks).
 */
export async function resolveOAuthSignInAfterRedirect(): Promise<OAuthSignInResult | null> {
  await getAuthInstance();
  const result = await completeOAuthRedirectIfNeeded();
  if (!result) {
    oauthLog.warn('redirect:no-user');
  }
  return result;
}
