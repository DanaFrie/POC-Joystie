/**
 * Firebase Analytics — intgr + prod (client-only).
 * Custom events for the v0.3 funnel + dashboard milestones.
 */

import type { Analytics } from 'firebase/analytics';

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
        console.warn('[Analytics] Analytics not supported in this environment');
        return null;
      }

      const app = await getFirebaseApp();
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    } catch (error) {
      console.error('[Analytics] Initialization error:', error);
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
      console.warn('[Analytics] Analytics not available, skipping event:', eventName);
      return false;
    }

    const { logEvent: firebaseLogEvent } = await import('firebase/analytics');
    firebaseLogEvent(analytics, eventName, eventParams);
    return true;
  } catch (error) {
    console.error('[Analytics] Error logging event:', {
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
    console.error('[Analytics] Error setting user ID:', error);
  }
}

/** Canonical funnel + dashboard event names (intgr + prod). */
export const AnalyticsEvents = {
  LANDING_MARKETING: 'landing_marketing',
  LANDING_ONBOARDING: 'landing_onboarding',
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

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
