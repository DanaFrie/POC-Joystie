import { clearOAuthSessionFlags } from '@/lib/onboarding/oauthSession';

export const FLOW_STEP_STORAGE_KEY = 'onboardingParentFlowStep';
export const OAUTH_SIGNUP_WELCOME_KEY = 'onboardingOAuthSignupWelcome';
export const FRESH_PARENT_FLOW_START_KEY = 'onboardingParentFreshStart';

/** Fresh start from onboarding step 1 — land on parent role. */
export function resetOnboardingParentFlowStart() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(FLOW_STEP_STORAGE_KEY);
  sessionStorage.removeItem(OAUTH_SIGNUP_WELCOME_KEY);
  clearOAuthSessionFlags();
  sessionStorage.setItem(FRESH_PARENT_FLOW_START_KEY, '1');
  sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'role');
}

/** Landing CTA — always open parent role step once. */
export function consumeFreshParentFlowStart(): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(FRESH_PARENT_FLOW_START_KEY) !== '1') return false;
  sessionStorage.removeItem(FRESH_PARENT_FLOW_START_KEY);
  return true;
}

export function markOAuthSignupWelcomePending() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(OAUTH_SIGNUP_WELCOME_KEY, '1');
}

export function clearOAuthSignupWelcomePending() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(OAUTH_SIGNUP_WELCOME_KEY);
}

export function shouldShowOAuthSignupWelcome(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(OAUTH_SIGNUP_WELCOME_KEY) === '1';
}

/** Parent funnel started — show role+ steps instead of landing on `/onboarding`. */
export function hasParentFlowStarted(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(sessionStorage.getItem(FLOW_STEP_STORAGE_KEY));
}
