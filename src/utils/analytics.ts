/**
 * Firebase Analytics utility
 * Provides easy-to-use functions for tracking events in Google Analytics
 */

import type { Analytics } from 'firebase/analytics';

let analyticsInstance: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

/**
 * Initialize Firebase Analytics (client-side only)
 */
async function getAnalytics(): Promise<Analytics | null> {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing instance if already initialized
  if (analyticsInstance) {
    return analyticsInstance;
  }

  // Return existing promise if initialization is in progress
  if (initPromise) {
    return initPromise;
  }

  // Initialize Analytics
  initPromise = (async () => {
    try {
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      const { getFirebaseApp } = await import('@/lib/firebase');
      
      // Check if Analytics is supported (requires browser environment)
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

/**
 * Log an event to Firebase Analytics
 * @param eventName - Name of the event (e.g., 'signup', 'upload_submitted')
 * @param eventParams - Optional parameters for the event
 */
export async function logEvent(
  eventName: string,
  eventParams?: Record<string, any>
): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) {
      // Analytics not available - silently fail (e.g., in SSR or unsupported environment)
      return;
    }

    const { logEvent: firebaseLogEvent } = await import('firebase/analytics');
    firebaseLogEvent(analytics, eventName, eventParams);
  } catch (error) {
    // Silently fail - don't break the app if analytics fails
    console.error('[Analytics] Error logging event:', error);
  }
}

/**
 * Set user properties for analytics
 * @param properties - User properties to set
 */
export async function setUserProperties(properties: Record<string, string>): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) {
      return;
    }

    const { setUserProperties: firebaseSetUserProperties } = await import('firebase/analytics');
    firebaseSetUserProperties(analytics, properties);
  } catch (error) {
    console.error('[Analytics] Error setting user properties:', error);
  }
}

/**
 * Set user ID for analytics
 * @param userId - User ID to set
 */
export async function setUserId(userId: string | null): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) {
      return;
    }

    const { setUserId: firebaseSetUserId } = await import('firebase/analytics');
    firebaseSetUserId(analytics, userId);
  } catch (error) {
    console.error('[Analytics] Error setting user ID:', error);
  }
}

/**
 * Predefined event names for common actions
 */
export const AnalyticsEvents = {
  // Authentication
  SIGNUP: 'signup',
  
  // Challenge
  CHALLENGE_CREATED: 'challenge_created',
  CHALLENGE_DEACTIVATED: 'challenge_deactivated', // isActive changed from true to false
  
  // Upload
  UPLOAD_SUBMITTED: 'upload_submitted',
  
  // Navigation
  HOME_PAGE_VIEW: 'home_page_view', // Entry to home page
} as const;

