import { ONBOARDING_TERMS_KEY } from '@/lib/onboarding/persistOnboardingAccount';

export const OAUTH_PENDING_KEY = 'onboardingOAuthPending';
export const OAUTH_PROVIDER_KEY = 'onboardingOAuthProvider';
export const OAUTH_PENDING_AT_KEY = 'onboardingOAuthPendingAt';

/** Redirect round-trip should finish within this window */
const OAUTH_PENDING_TTL_MS = 15 * 60 * 1000;

function readTermsFlag(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return (
    sessionStorage.getItem(key) === '1' || localStorage.getItem(key) === '1'
  );
}

function writeTermsFlag(key: string, value: '1' | null) {
  if (typeof window === 'undefined') return;
  if (value === '1') {
    sessionStorage.setItem(key, '1');
    localStorage.setItem(key, '1');
    return;
  }
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

/** Drop legacy localStorage oauth flags + expired session pending. */
export function purgeStaleOAuthSessionFlags() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(OAUTH_PENDING_KEY);
  localStorage.removeItem(OAUTH_PROVIDER_KEY);
  localStorage.removeItem(OAUTH_PENDING_AT_KEY);

  if (sessionStorage.getItem(OAUTH_PENDING_KEY) !== '1') return;

  const startedAt = Number(sessionStorage.getItem(OAUTH_PENDING_AT_KEY) || 0);
  if (!startedAt || Date.now() - startedAt > OAUTH_PENDING_TTL_MS) {
    clearOAuthSessionFlags();
  }
}

export function readOAuthPending(): boolean {
  purgeStaleOAuthSessionFlags();
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(OAUTH_PENDING_KEY) === '1';
}

export type OAuthProviderId = 'google.com' | 'apple.com';

function normalizeOAuthProviderId(value: string | null): OAuthProviderId {
  if (value === 'apple' || value === 'apple.com') return 'apple.com';
  return 'google.com';
}

/** Firebase provider id stored for redirect recovery (google.com / apple.com). */
export function readOAuthProviderId(): OAuthProviderId {
  if (typeof window === 'undefined') return 'google.com';
  return normalizeOAuthProviderId(sessionStorage.getItem(OAUTH_PROVIDER_KEY));
}

/** UI shorthand for loading spinners (google / apple). */
export function readOAuthProvider(): 'google' | 'apple' {
  return readOAuthProviderId() === 'apple.com' ? 'apple' : 'google';
}

/** Milliseconds since markOAuthRedirectPending, or null if unknown. */
export function readOAuthPendingAgeMs(): number | null {
  if (typeof window === 'undefined') return null;
  const startedAt = Number(sessionStorage.getItem(OAUTH_PENDING_AT_KEY) || 0);
  if (!startedAt) return null;
  return Date.now() - startedAt;
}

/** Pending flag set recently (user likely mid-redirect round-trip). */
export function isFreshOAuthPending(maxAgeMs = 5 * 60 * 1000): boolean {
  const age = readOAuthPendingAgeMs();
  return age !== null && age >= 0 && age <= maxAgeMs;
}

export function readOnboardingTermsAccepted(): boolean {
  return readTermsFlag(ONBOARDING_TERMS_KEY);
}

export function markOnboardingTermsAccepted() {
  writeTermsFlag(ONBOARDING_TERMS_KEY, '1');
}

export function clearOnboardingTermsAccepted() {
  writeTermsFlag(ONBOARDING_TERMS_KEY, null);
}

/** Session-only — survives Google redirect in the same tab, not stale reloads. */
export function markOAuthRedirectPending(provider: 'google' | 'apple') {
  markOAuthRedirectPendingForProviderId(
    provider === 'apple' ? 'apple.com' : 'google.com'
  );
}

export function markOAuthRedirectPendingForProviderId(providerId: OAuthProviderId) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(OAUTH_PENDING_KEY, '1');
  sessionStorage.setItem(OAUTH_PROVIDER_KEY, providerId);
  sessionStorage.setItem(OAUTH_PENDING_AT_KEY, String(Date.now()));
}

export function clearOAuthSessionFlags() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(OAUTH_PENDING_KEY);
  sessionStorage.removeItem(OAUTH_PROVIDER_KEY);
  sessionStorage.removeItem(OAUTH_PENDING_AT_KEY);
  localStorage.removeItem(OAUTH_PENDING_KEY);
  localStorage.removeItem(OAUTH_PROVIDER_KEY);
  localStorage.removeItem(OAUTH_PENDING_AT_KEY);
}

export function isOAuthRedirectRecoverable(): boolean {
  return readOAuthPending();
}
