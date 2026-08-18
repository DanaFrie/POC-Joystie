import type { Auth, AuthError, AuthProvider, User, UserCredential } from 'firebase/auth';
import { getAdditionalUserInfo, getRedirectResult } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import {
  isOAuthRedirectRecoverable,
  markOAuthRedirectPendingForProviderId,
} from '@/lib/onboarding/oauthSession';
import { getAuthErrorFromUnknown } from '@/utils/auth-errors';
import { isFirebaseAppHostingOrigin } from '@/utils/is-firebase-app-hosting';
import { isLocalDevHost } from '@/utils/is-local-dev-host';
import { createContextLogger } from '@/utils/logger';

const oauthLog = createContextLogger('OAuth');

export type OAuthProviderId = 'google.com' | 'apple.com';
export type OAuthProviderUiId = 'google' | 'apple';

/**
 * Apple Sign-In on login + signup. Requires Firebase Console Apple provider
 * + Apple Developer Services ID / key configured for the project.
 */
export const IS_APPLE_OAUTH_ENABLED = true;

export type OAuthSignInResult =
  | { ok: true; user: User; isNewUser: boolean; displayName?: string }
  | { ok: false; errorMessage: string; errorCode: string };

const OAUTH_PROVIDER_IDS: OAuthProviderId[] = ['google.com', 'apple.com'];

const UI_TO_FIREBASE_PROVIDER: Record<OAuthProviderUiId, OAuthProviderId> = {
  google: 'google.com',
  apple: 'apple.com',
};

export function toOAuthProviderId(provider: OAuthProviderUiId): OAuthProviderId {
  return UI_TO_FIREBASE_PROVIDER[provider];
}

const REDIRECT_PROMISE_KEY = '__joystie_oauth_redirect_promise';

/** Cap reload() per uid — repeated reloads were adding 20s+ on Apple redirect return. */
const oauthReloadAttempted = new Set<string>();

type OAuthRedirectResolveOptions = {
  maxWaitMs?: number;
  trustAnySignedInUser?: boolean;
};

function isEmbeddedFrame(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Google/Apple block OAuth in embedded WebViews (Cursor IDE, Electron, in-app browsers). */
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
  return 'Google ו-Apple חוסמים התחברות מדפדפן מוטמע (כולל תצוגה בתוך Cursor). פתחו את האתר ב-Chrome או Safari.';
}

export function getOnboardingParentExternalUrl(): string {
  if (typeof window === 'undefined') return '/onboarding';
  return `${window.location.origin}/onboarding`;
}

function isMobileOrSafariBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isSafari =
    /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua);
  return isMobile || isSafari || window.innerWidth < 768;
}

export function prefersOAuthRedirect(): boolean {
  if (typeof window === 'undefined') return false;
  // Redirect OAuth is unreliable on localhost (incl. mobile viewport / DevTools).
  if (isLocalDevHost()) return false;
  // App Hosting: redirect loses getRedirectResult state on *.hosted.app — always popup.
  if (isFirebaseAppHostingOrigin()) return false;
  return isMobileOrSafariBrowser();
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
  const info = getAdditionalUserInfo(credential);
  return info?.isNewUser ?? false;
}

function readUrlSearchParams(source: string): URLSearchParams {
  const query = source.includes('?') ? source.split('?').slice(1).join('?') : source;
  return new URLSearchParams(query);
}

/** Firebase/Google may surface auth errors in the return URL after a failed redirect. */
function parseOAuthRedirectUrlError(): OAuthSignInResult | null {
  if (typeof window === 'undefined') return null;

  const search = new URLSearchParams(window.location.search);
  const hashBody = window.location.hash.replace(/^#/, '');
  const hash = hashBody ? readUrlSearchParams(hashBody) : new URLSearchParams();

  const rawCode =
    search.get('errorCode') ||
    hash.get('errorCode') ||
    search.get('error') ||
    hash.get('error') ||
    '';
  if (!rawCode) return null;

  const normalizedCode = rawCode.startsWith('auth/')
    ? rawCode
    : rawCode.includes('unauthorized')
      ? 'auth/unauthorized-domain'
      : `auth/${rawCode}`;

  oauthLog.warn('redirect:url-error', {
    code: normalizedCode,
    href: window.location.href,
    referrer: document.referrer,
  });

  return {
    ok: false,
    errorCode: normalizedCode,
    errorMessage: getAuthErrorFromUnknown({ code: normalizedCode }),
  };
}

function redirectWaitMs(auth: Auth, options?: OAuthRedirectResolveOptions): number {
  if (options?.maxWaitMs !== undefined) return options.maxWaitMs;
  if (!isOAuthRedirectRecoverable()) return 0;
  const base = auth.currentUser ? 3000 : 1500;
  return isFirebaseAppHostingOrigin() ? Math.max(base, auth.currentUser ? 4500 : 2500) : base;
}

/** Apple Hide My Email relay addresses are valid OAuth emails. */
export function isApplePrivateRelayEmail(email: string): boolean {
  return /@privaterelay\.appleid\.com$/i.test(email.trim());
}

export function isValidOAuthEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

async function createConfiguredOAuthProvider(
  providerId: OAuthProviderId
): Promise<AuthProvider> {
  const { GoogleAuthProvider, OAuthProvider } = await import('firebase/auth');
  if (providerId === 'google.com') {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  }
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return provider;
}

type AppleProfileName = {
  firstName?: string;
  lastName?: string;
  given_name?: string;
  family_name?: string;
  name?: { firstName?: string; lastName?: string };
};

function extractDisplayNameFromCredential(credential: UserCredential): string {
  if (credential.user.displayName?.trim()) {
    return credential.user.displayName.trim();
  }

  const profile = getAdditionalUserInfo(credential)?.profile as AppleProfileName | null;
  if (!profile) return '';

  const nested = profile.name;
  if (nested) {
    const full = [nested.firstName, nested.lastName].filter(Boolean).join(' ').trim();
    if (full) return full;
  }

  const given = String(profile.given_name ?? profile.firstName ?? '').trim();
  const family = String(profile.family_name ?? profile.lastName ?? '').trim();
  return [given, family].filter(Boolean).join(' ').trim();
}

function scheduleOAuthDisplayNamePersist(
  credential: UserCredential,
  displayName: string
): void {
  if (!displayName || credential.user.displayName?.trim()) return;
  void import('firebase/auth')
    .then(({ updateProfile }) => updateProfile(credential.user, { displayName }))
    .then(() => {
      oauthLog.log('profile:displayName-persisted', {
        uid: credential.user.uid,
        displayName,
      });
    })
    .catch((error) => {
      oauthLog.warn('profile:displayName-persist-failed', error);
    });
}

function resolveOAuthDisplayName(credential: UserCredential): string {
  const displayName = extractDisplayNameFromCredential(credential);
  scheduleOAuthDisplayNamePersist(credential, displayName);
  return displayName || credential.user.displayName?.trim() || '';
}

function buildOAuthSuccessResult(
  credential: UserCredential,
  isNewUser: boolean,
  displayName: string
): OAuthSignInResult & { ok: true } {
  return {
    ok: true,
    user: credential.user,
    isNewUser,
    displayName: displayName || undefined,
  };
}

async function signInWithProviderPopup(providerId: OAuthProviderId): Promise<OAuthSignInResult> {
  try {
    const { signInWithPopup } = await import('firebase/auth');
    const auth = await getAuthInstance();
    await prepareAuthForOAuthSignIn();
    const provider = await createConfiguredOAuthProvider(providerId);

    oauthLog.log('popup:start', { providerId });
    const credential = await signInWithPopup(auth, provider);
    const isNewUser = await resolveIsNewUser(credential);
    const displayName = resolveOAuthDisplayName(credential);
    oauthLog.log('popup:success', {
      providerId,
      uid: credential.user.uid,
      email: getOAuthUserEmail(credential.user),
      isNewUser,
      displayName: displayName || null,
      appleRelay: isApplePrivateRelayEmail(getOAuthUserEmail(credential.user)),
    });
    return buildOAuthSuccessResult(credential, isNewUser, displayName);
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
  const { signInWithRedirect } = await import('firebase/auth');
  const auth = await getAuthInstance();
  await prepareAuthForOAuthSignIn();
  markOAuthRedirectPendingForProviderId(providerId);
  const provider = await createConfiguredOAuthProvider(providerId);
  oauthLog.log('redirect:start', {
    providerId,
    origin: typeof window !== 'undefined' ? window.location.href : '',
  });
  await signInWithRedirect(auth, provider);
}

/**
 * Shared Google/Apple sign-in. Uses redirect on mobile/Safari; popup elsewhere.
 * App Hosting (*.hosted.app) always uses popup — redirect state is unreliable there.
 */
export async function signInWithOAuth(
  provider: OAuthProviderUiId,
  options?: { useRedirect?: boolean }
): Promise<OAuthSignInResult | { ok: true; redirecting: true }> {
  if (provider === 'apple' && !IS_APPLE_OAUTH_ENABLED) {
    return {
      ok: false,
      errorCode: 'auth/operation-not-allowed',
      errorMessage: 'התחברות עם Apple אינה זמינה כרגע. השתמשו ב-Google או בדוא״ל.',
    };
  }
  const providerId = toOAuthProviderId(provider);
  const useRedirect = options?.useRedirect ?? prefersOAuthRedirect();
  const onAppHosting = isFirebaseAppHostingOrigin();
  oauthLog.log('oauth:mode', {
    provider,
    providerId,
    useRedirect,
    restricted: isRestrictedOAuthEnvironment(),
    appHosting: onAppHosting,
  });

  if (useRedirect) {
    await signInWithProviderRedirect(providerId);
    return { ok: true, redirecting: true };
  }

  const result = await signInWithProviderPopup(providerId);
  if (!result.ok && result.errorCode === 'auth/popup-blocked') {
    // Redirect fallback is broken on App Hosting (getRedirectResult often null).
    if (onAppHosting || isLocalDevHost()) {
      oauthLog.warn('popup-blocked:no-redirect-fallback', {
        providerId,
        appHosting: onAppHosting,
      });
      return {
        ok: false,
        errorCode: 'auth/popup-blocked',
        errorMessage:
          'הדפדפן חסם את חלון ההתחברות. אפשרו חלונות קופצים עבור האתר ונסו שוב, או השתמשו בדוא״ל וסיסמה.',
      };
    }
    await signInWithProviderRedirect(providerId);
    return { ok: true, redirecting: true };
  }
  if (!result.ok && result.errorCode === 'auth/popup-closed-by-user') {
    return result;
  }
  return result;
}

/** @deprecated Prefer `signInWithOAuth('google')` — kept for call-site compatibility. */
export async function signInWithGoogle(options?: {
  useRedirect?: boolean;
}): Promise<OAuthSignInResult | { ok: true; redirecting: true }> {
  return signInWithOAuth('google', options);
}

/** @deprecated Prefer `signInWithOAuth('apple')` — kept for call-site compatibility. */
export async function signInWithApple(options?: {
  useRedirect?: boolean;
}): Promise<OAuthSignInResult | { ok: true; redirecting: true }> {
  return signInWithOAuth('apple', options);
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

/** Email on user or linked provider (incl. Apple Hide My Email relay). */
export function getOAuthUserEmail(user: User): string {
  if (user.email?.trim()) return user.email.trim();
  for (const provider of user.providerData) {
    if (provider.email?.trim()) return provider.email.trim();
  }
  return '';
}

/** Display name from Auth profile (Apple sends name only on first sign-in). */
export function getOAuthUserDisplayName(user: User): string {
  if (user.displayName?.trim()) return user.displayName.trim();
  return '';
}

function isOAuthUser(user: User): boolean {
  if (hasOAuthProvider(user)) return true;
  // Fresh redirect: currentUser may exist before providerData hydrates.
  const email = getOAuthUserEmail(user);
  return user.providerData.length === 0 && isValidOAuthEmail(email);
}

async function hydrateOAuthUser(user: User): Promise<User> {
  if (user.email && user.providerData.length > 0) return user;
  if (hasOAuthProvider(user)) return user;
  if (oauthReloadAttempted.has(user.uid)) return user;

  oauthReloadAttempted.add(user.uid);
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
  const hasEmail = isValidOAuthEmail(email);
  if (options?.trustAnySignedInUser) {
    return hasEmail || linked ? user : null;
  }
  // Apple may omit email on repeat sign-in — linked provider is enough.
  return isOAuthUser(user) && (hasEmail || linked) ? user : null;
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
  maxWaitMs = 5000,
  options?: { trustAnySignedInUser?: boolean }
): Promise<User | null> {
  const { onAuthStateChanged } = await import('firebase/auth');
  const auth = await getAuthInstance();

  const pickUser = (user: User | null) => pickOAuthUser(user, options);

  const tryCurrentUser = async (): Promise<User | null> => {
    const current = auth.currentUser;
    if (!current) return null;
    let picked = pickUser(current);
    if (picked) return picked;
    const hydrated = await hydrateOAuthUser(current);
    return pickUser(hydrated);
  };

  const immediate = await tryCurrentUser();
  if (immediate) return immediate;

  return new Promise((resolve) => {
    let settled = false;
    let unsub = () => {};

    const finish = (user: User | null) => {
      if (settled) return;
      settled = true;
      unsub();
      window.clearTimeout(timeout);
      resolve(user);
    };

    unsub = onAuthStateChanged(auth, (user) => {
      void (async () => {
        if (!user || settled) return;
        let picked = pickUser(user);
        if (!picked) {
          const hydrated = await hydrateOAuthUser(user);
          picked = pickUser(hydrated);
        }
        if (picked) finish(picked);
      })();
    });

    const timeout = window.setTimeout(() => {
      void tryCurrentUser().then((user) => finish(user));
    }, maxWaitMs);
  });
}

/** Fallback when getRedirectResult is empty but Auth session exists after redirect. */
export async function resolveOAuthPendingUser(
  maxWaitMs = 5000,
  options?: { trustAnySignedInUser?: boolean }
): Promise<OAuthSignInResult | null> {
  const user = await waitForOAuthUser(maxWaitMs, options);
  if (!user) return null;
  return {
    ok: true,
    user,
    isNewUser: true,
    displayName: getOAuthUserDisplayName(user) || undefined,
  };
}

async function completeOAuthRedirectOnce(
  authOverride?: Auth,
  options?: OAuthRedirectResolveOptions
): Promise<OAuthSignInResult | null> {
  try {
    const urlError = parseOAuthRedirectUrlError();
    if (urlError) return urlError;

    const auth = authOverride ?? (await getAuthInstance());
    // Must run immediately after Auth init — waiting for auth state first loses redirect on Safari.
    const credential = await getRedirectResult(auth);
    if (credential?.user) {
      const info = getAdditionalUserInfo(credential);
      const displayName = resolveOAuthDisplayName(credential);
      oauthLog.log('redirect:result', {
        uid: credential.user.uid,
        email: getOAuthUserEmail(credential.user),
        isNewUser: info?.isNewUser ?? false,
        displayName: displayName || null,
        providerIds: credential.user.providerData.map((p) => p.providerId),
        appleRelay: isApplePrivateRelayEmail(getOAuthUserEmail(credential.user)),
      });
      return buildOAuthSuccessResult(
        credential,
        info?.isNewUser ?? false,
        displayName
      );
    }

    // Redirect may hydrate currentUser shortly after getRedirectResult returns null.
    const waitMs = redirectWaitMs(auth, options);
    const waitOptions = {
      trustAnySignedInUser: options?.trustAnySignedInUser ?? true,
    };
    const user = waitMs > 0 ? await waitForOAuthUser(waitMs, waitOptions) : null;
    if (user) {
      oauthLog.log('redirect:currentUser-fallback', {
        uid: user.uid,
        email: getOAuthUserEmail(user),
        providerIds: user.providerData.map((p) => p.providerId),
      });
      return {
        ok: true,
        user,
        isNewUser: true,
        displayName: getOAuthUserDisplayName(user) || undefined,
      };
    }

    if (isOAuthRedirectRecoverable()) {
      oauthLog.warn('redirect:result-empty', {
        origin: window.location.origin,
        href: window.location.href,
        referrer: document.referrer,
        appHosting: isFirebaseAppHostingOrigin(),
        hasCurrentUser: Boolean(auth.currentUser),
        isAnonymous: auth.currentUser?.isAnonymous ?? false,
        currentEmail: auth.currentUser?.email ?? null,
        providerIds: auth.currentUser?.providerData.map((p) => p.providerId) ?? [],
        authDomain: auth.app.options.authDomain,
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

function getRedirectResultPromise(
  options?: OAuthRedirectResolveOptions
): Promise<OAuthSignInResult | null> {
  if (typeof window === 'undefined') {
    return completeOAuthRedirectOnce(undefined, options);
  }

  const globalWindow = window as typeof window & {
    [REDIRECT_PROMISE_KEY]?: Promise<OAuthSignInResult | null>;
  };

  if (!globalWindow[REDIRECT_PROMISE_KEY]) {
    globalWindow[REDIRECT_PROMISE_KEY] = completeOAuthRedirectOnce(undefined, options);
  }

  return globalWindow[REDIRECT_PROMISE_KEY];
}

/**
 * Call once on onboarding mount after redirect-based OAuth.
 * Singleton — safe under React Strict Mode double-mount and HMR.
 */
export async function completeOAuthRedirectIfNeeded(
  options?: OAuthRedirectResolveOptions
): Promise<OAuthSignInResult | null> {
  return getRedirectResultPromise(options);
}

/** Start capturing redirect result as early as possible on page load. */
export function primeOAuthRedirectCapture(): void {
  if (typeof window === 'undefined') return;
  void getRedirectResultPromise();
}

/**
 * Capture redirect result immediately after `getAuth()` — before Firestore/Functions init.
 * Called from `firebase.ts` during Auth bootstrap.
 */
export function primeOAuthRedirectCaptureWithAuth(auth: Auth): void {
  if (typeof window === 'undefined') return;

  const globalWindow = window as typeof window & {
    [REDIRECT_PROMISE_KEY]?: Promise<OAuthSignInResult | null>;
  };

  if (!globalWindow[REDIRECT_PROMISE_KEY]) {
    globalWindow[REDIRECT_PROMISE_KEY] = completeOAuthRedirectOnce(auth);
  }
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
export async function resolveOAuthSignInAfterRedirect(
  options?: OAuthRedirectResolveOptions
): Promise<OAuthSignInResult | null> {
  if (
    typeof window !== 'undefined' &&
    !isOAuthRedirectRecoverable() &&
    !isLikelyOAuthRedirectReturn()
  ) {
    return null;
  }

  await getAuthInstance();
  const result = await completeOAuthRedirectIfNeeded(options);
  if (!result) {
    oauthLog.warn('redirect:no-user');
  }
  return result;
}
