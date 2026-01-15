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
      
      // Check if debug mode is enabled via URL parameter
      // Usage: Add ?debug_mode=true to the URL to enable DebugView
      const urlParams = new URLSearchParams(window.location.search);
      const debugMode = urlParams.get('debug_mode') === 'true';
      
      if (debugMode) {
        // Enable debug mode for Firebase Analytics
        // This allows events to appear in Firebase Console → Analytics → DebugView
        console.log('[Analytics] 🔍 Debug mode enabled via URL parameter');
        console.log('[Analytics] Events will appear in Firebase Console → Analytics → DebugView');
        console.log('[Analytics] To disable, remove ?debug_mode=true from URL');
        
        // Set debug mode in localStorage to persist across page refreshes
        if (typeof window !== 'undefined') {
          localStorage.setItem('firebase_analytics_debug', 'true');
        }
      } else {
        // Check if debug mode was previously enabled in localStorage
        if (typeof window !== 'undefined' && localStorage.getItem('firebase_analytics_debug') === 'true') {
          console.log('[Analytics] 🔍 Debug mode enabled from localStorage');
          console.log('[Analytics] To disable, add ?debug_mode=false to URL or clear localStorage');
        }
      }
      
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
      console.warn('[Analytics] Analytics not available, skipping event:', eventName);
      return;
    }

    // Check if debug mode is enabled
    const isDebugMode = typeof window !== 'undefined' && (
      new URLSearchParams(window.location.search).get('debug_mode') === 'true' ||
      localStorage.getItem('firebase_analytics_debug') === 'true'
    );

    const { logEvent: firebaseLogEvent } = await import('firebase/analytics');
    firebaseLogEvent(analytics, eventName, eventParams);
    
    // Log to console for debugging (always log to help verify events are sent)
    if (isDebugMode) {
      console.log('[Analytics] 🔍 [DEBUG MODE] Event logged:', {
        eventName,
        eventParams: eventParams || {},
        timestamp: new Date().toISOString(),
        projectId: analytics.app.options.projectId,
        viewInConsole: 'Firebase Console → Analytics → DebugView'
      });
    } else {
      console.log('[Analytics] ✅ Event logged successfully:', {
        eventName,
        eventParams: eventParams || {},
        timestamp: new Date().toISOString(),
        projectId: analytics.app.options.projectId
      });
    }
  } catch (error) {
    // Log error but don't break the app
    console.error('[Analytics] ❌ Error logging event:', {
      eventName,
      error: error instanceof Error ? error.message : String(error)
    });
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

