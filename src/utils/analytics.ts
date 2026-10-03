/**
 * Firebase Analytics — intgr + prod (client-only).
 * Custom events for the v0.3 funnel + dashboard milestones.
 */

import type { Analytics } from 'firebase/analytics';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Analytics');

let analyticsInstance: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

async function getAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      const { getFirebaseApp } = await import('@/lib/firebase');

      const supported = await isSupported();
      if (!supported) {
        logger.warn('Analytics not supported in this environment');
        return null;
      }

      const app = await getFirebaseApp();
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    } catch (error) {
      logger.error('Initialization error:', error);
      return null;
    }
  })();

  return initPromise;
}

/** Log an event to Firebase Analytics (GA4 via Firebase). Returns false if skipped/failed. */
export async function logEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): Promise<boolean> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) {
      logger.warn('Analytics not available, skipping event:', eventName);
      return false;
    }

    const { logEvent: firebaseLogEvent } = await import('firebase/analytics');
    firebaseLogEvent(analytics, eventName, eventParams);
    return true;
  } catch (error) {
    logger.error('Error logging event:', {
      eventName,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Fire at most once per browser tab session (avoids Strict Mode / remount doubles).
 * Only marks the once-key after a successful send so a failed first attempt can retry.
 */
export async function logEventOnce(
  onceKey: string,
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const storageKey = `joystie_analytics_once:${onceKey}`;
  try {
    if (sessionStorage.getItem(storageKey)) return false;
  } catch {
    // private mode / blocked storage — still attempt to log
  }

  const ok = await logEvent(eventName, eventParams);
  if (ok) {
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // ignore
    }
  }
  return ok;
}

/** Set Firebase Analytics user ID (after auth). */
export async function setUserId(userId: string | null): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) return;

    const { setUserId: firebaseSetUserId } = await import('firebase/analytics');
    firebaseSetUserId(analytics, userId);
  } catch (error) {
    logger.error('Error setting user ID:', error);
  }
}

/** Shared GA4 param — filter Explore / BigQuery for pre-signup stretch. */
export const PRE_SIGNUP_FUNNEL = 'pre_signup' as const;

/** Canonical funnel + dashboard event names (intgr + prod). */
export const AnalyticsEvents = {
  LANDING_MARKETING: 'landing_marketing',
  LANDING_ONBOARDING: 'landing_onboarding',
  /** Pre-signup CTA taps (shared param `funnel=pre_signup`). */
  PRE_SIGNUP_ROLE: 'pre_signup_role',
  PRE_SIGNUP_WHAT_AWAITS: 'pre_signup_what_awaits',
  PRE_SIGNUP_CHILD_SETUP: 'pre_signup_child_setup',
  PRE_SIGNUP_CALCULATING: 'pre_signup_calculating',
  PRE_SIGNUP_REVEAL_INTRO: 'pre_signup_reveal_intro',
  PRE_SIGNUP_BAD_NEWS: 'pre_signup_bad_news',
  PRE_SIGNUP_GOOD_NEWS: 'pre_signup_good_news',
  /** signupIntro — only final CTA "יצאנו לדרך!". */
  PRE_SIGNUP_SIGNUP_INTRO: 'pre_signup_signup_intro',
  SIGNUP: 'signup',
  CHILD_INVITE_LINK: 'child_invite_link',
  GAME_START: 'game_start',
  GAME_WIN: 'game_win',
  AGREEMENT_DONE: 'agreement_done',
  /** Child selfie mission done — marks joint onboarding accomplished. */
  SELFIE_DONE: 'selfie_done',
  DASHBOARD_REACHED: 'dashboard_reached',
  TRIAL_PAYMENT_SUCCESS: 'trial_payment_success',
  CHALLENGE_CREATED: 'challenge_created',
} as const;

/**
 * Parent-device funnel only (path to trial payment).
 * Child device must not fire AnalyticsEvents — observe RTDB on parent instead.
 */

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/** Parent CTA in the pre-signup stretch — always tagged with `funnel=pre_signup`. */
export function trackPreSignupCta(
  eventName: AnalyticsEventName,
  extra?: Record<string, string | number | boolean>
): void {
  void logEventOnce(
    `pre_signup:${eventName}`,
    eventName,
    { funnel: PRE_SIGNUP_FUNNEL, ...extra }
  );
}
