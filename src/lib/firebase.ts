// Firebase initialization - using dynamic imports to avoid SSR issues
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Functions } from 'firebase/functions';
import { createContextLogger } from '@/utils/logger';

// Firebase configuration
// Next.js automatically loads NEXT_PUBLIC_* variables at build time
// But we need to access them at runtime, so we use a function to get them
function getFirebaseConfig() {
  // Helper to safely get env var
  // IMPORTANT: Use static references to process.env.NEXT_PUBLIC_* 
  // Next.js only replaces static references at build time, not dynamic property access
  const getEnv = (key: string, fallback?: string): string => {
    let value: string | undefined;
    let source = 'none';
    
    if (typeof window === 'undefined') {
      // Server-side: use process.env directly with static references
      // Map key to actual static reference
      switch (key) {
        case 'NEXT_PUBLIC_FIREBASE_API_KEY':
          value = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
          break;
        case 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN':
          value = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
          break;
        case 'NEXT_PUBLIC_FIREBASE_PROJECT_ID':
          value = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          break;
        case 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID':
          value = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
          break;
        case 'NEXT_PUBLIC_FIREBASE_APP_ID':
          value = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
          break;
        default:
          value = undefined;
      }
      source = 'process.env (server)';
    } else {
      // Client-side: use static references so Next.js can embed them at build time
      // Next.js replaces static process.env.NEXT_PUBLIC_* references with actual values
      switch (key) {
        case 'NEXT_PUBLIC_FIREBASE_API_KEY':
          value = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
          break;
        case 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN':
          value = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
          break;
        case 'NEXT_PUBLIC_FIREBASE_PROJECT_ID':
          value = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          break;
        case 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID':
          value = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
          break;
        case 'NEXT_PUBLIC_FIREBASE_APP_ID':
          value = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
          break;
        default:
          value = undefined;
      }
      
      if (value) {
        source = 'process.env (client - static)';
      } else {
        // Fallback to window.__NEXT_DATA__ if static reference didn't work
        const windowData = (window as any).__NEXT_DATA__;
        if (windowData?.env?.[key]) {
          value = windowData.env[key];
          source = 'window.__NEXT_DATA__.env';
        } else if (windowData?.runtimeConfig?.[key]) {
          value = windowData.runtimeConfig[key];
          source = 'window.__NEXT_DATA__.runtimeConfig';
        } else if ((window as any).__ENV__?.[key]) {
          value = (window as any).__ENV__[key];
          source = 'window.__ENV__';
        }
      }
    }
    
    if (!value && fallback) {
      value = fallback;
      source = 'fallback';
    }
    
    if (!value) {
      return '';
    }
    
    // Return as string
    return String(value);
  };

  const config = {
    apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
  };
  
  // Debug logging (enabled in intgr, disabled in prod)
  const logger = createContextLogger('Firebase Config');
  const hasMissingConfig = !config.apiKey || !config.authDomain || !config.projectId;
  
  if (hasMissingConfig) {
    const isServer = typeof window === 'undefined';
    const logKey = isServer ? '__FIREBASE_SERVER_CONFIG_LOGGED__' : '__FIREBASE_CLIENT_CONFIG_LOGGED__';
    const globalObj = isServer ? (global as any) : (window as any);
    
    if (!globalObj[logKey]) {
      globalObj[logKey] = true;
      
      const debugInfo: any = {
        hasApiKey: !!config.apiKey,
        hasAuthDomain: !!config.authDomain,
        hasProjectId: !!config.projectId,
        hasMessagingSenderId: !!config.messagingSenderId,
        hasAppId: !!config.appId,
        environment: isServer ? 'server' : 'client',
      };
      
      if (isServer) {
        debugInfo.rawProcessEnv = {
          hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          apiKeyLength: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.length || 0,
    };
  } else {
        const windowData = (window as any).__NEXT_DATA__;
        debugInfo.sources = {
          processEnv: {
            hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          },
          windowNextDataEnv: {
            hasApiKey: !!windowData?.env?.NEXT_PUBLIC_FIREBASE_API_KEY,
            hasAuthDomain: !!windowData?.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          },
          windowNextDataRuntimeConfig: {
            hasApiKey: !!windowData?.runtimeConfig?.NEXT_PUBLIC_FIREBASE_API_KEY,
            hasAuthDomain: !!windowData?.runtimeConfig?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          },
        };
      }
      
      if (hasMissingConfig) {
        logger.error('Missing environment variables:', debugInfo);
      } else {
        logger.log('Environment variables loaded:', debugInfo);
      }
    }
  }
  
  return config;
}

const firebaseConfig = getFirebaseConfig();

// Lazy initialization - only on client side
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let functionsInstance: Functions | null = null;
let initPromise: Promise<void> | null = null;

// Initialize Firebase (lazy, client-side only)
async function initializeFirebase(): Promise<void> {
  if (typeof window === 'undefined') {
    return; // Silently return on server side
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { initializeApp, getApps } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');
      const { getFunctions } = await import('firebase/functions');

      // Get config at runtime (Next.js embeds NEXT_PUBLIC_* vars at build time)
      const config = getFirebaseConfig();

      // Validate config (NO TRIM - check as-is)
      const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
      const missing = required.filter(key => !config[key as keyof typeof config] || String(config[key as keyof typeof config]) === '');
      
      if (missing.length > 0) {
        // Convert camelCase to UPPER_SNAKE_CASE for environment variable names
        const toEnvVarName = (key: string): string => {
          return key
            .replace(/([A-Z])/g, '_$1') // Add underscore before capital letters
            .toUpperCase() // Convert to uppercase
            .replace(/^_/, ''); // Remove leading underscore if any
        };
        
        throw new Error(
          `Missing Firebase environment variables: ${missing.map(key => `NEXT_PUBLIC_FIREBASE_${toEnvVarName(key)}`).join(', ')}\n` +
          'Please check your .env.local file and ensure all required values are set.'
        );
      }

      // Initialize Firebase app
      if (getApps().length === 0) {
        app = initializeApp(config);
      } else {
        app = getApps()[0];
      }

      // Initialize services
      authInstance = getAuth(app);
      dbInstance = getFirestore(app);
      functionsInstance = getFunctions(app, 'us-central1'); // Use same region as deployed function
      
      // Initialize Analytics (client-side only, lazy-loaded when needed)
      // Analytics is initialized separately in utils/analytics.ts to avoid SSR issues
      
      // Log config for debugging (without sensitive data)
      const firebaseLogger = createContextLogger('Firebase');
      firebaseLogger.log('Initialized with config:', {
        projectId: config.projectId,
        authDomain: config.authDomain,
        hasApiKey: !!config.apiKey,
        hasAppId: !!config.appId,
      });

    } catch (error) {
      const firebaseLogger = createContextLogger('Firebase');
      firebaseLogger.error('Initialization error:', error);
      throw error;
    }
  })();

  return initPromise;
}

// Get Firebase services (with lazy initialization)
export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (!app) {
    await initializeFirebase();
  }
  if (!app) {
    throw new Error('Failed to initialize Firebase');
  }
  return app;
}

export async function getAuthInstance(): Promise<Auth> {
  if (!authInstance) {
    await initializeFirebase();
  }
  if (!authInstance) {
    throw new Error('Failed to initialize Firebase Auth');
  }
  return authInstance;
}

export async function getFirestoreInstance(): Promise<Firestore> {
  if (!dbInstance) {
    await initializeFirebase();
  }
  if (!dbInstance) {
    throw new Error('Failed to initialize Firestore');
  }
  return dbInstance;
}


export async function getFunctionsInstance(): Promise<Functions> {
  if (!functionsInstance) {
    await initializeFirebase();
  }
  if (!functionsInstance) {
    throw new Error('Failed to initialize Firebase Functions');
  }
  return functionsInstance;
}

// Synchronous getters (for backward compatibility, but will throw if not initialized)
// These should only be used after initialization
export function getAuthSync(): Auth {
  if (typeof window === 'undefined' || !authInstance) {
    throw new Error('Firebase Auth not initialized. Use getAuthInstance() instead.');
  }
  return authInstance;
}

export function getFirestoreSync(): Firestore {
  if (typeof window === 'undefined' || !dbInstance) {
    throw new Error('Firestore not initialized. Use getFirestoreInstance() instead.');
  }
  return dbInstance;
}


export function getFunctionsSync(): Functions {
  if (typeof window === 'undefined' || !functionsInstance) {
    throw new Error('Firebase Functions not initialized. Use getFunctionsInstance() instead.');
  }
  return functionsInstance;
}

// Don't auto-initialize - let it be lazy-loaded when needed
// This prevents SSR issues

// Export for backward compatibility (but prefer async versions)
// These proxies will throw errors if accessed before initialization
// Only create proxies on client side to avoid SSR issues
export const auth = typeof window !== 'undefined' 
  ? new Proxy({} as Auth, {
      get(target, prop) {
        if (!authInstance) {
          // Don't throw error during Fast Refresh - just return undefined
          if (process.env.NODE_ENV === 'development' && prop === 'then') {
            return undefined;
          }
          // In production, still throw but with better error handling
          throw new Error('Firebase Auth not initialized. Ensure you are on the client side and Firebase is loaded. Use getAuthInstance() instead.');
        }
        return (authInstance as any)[prop];
      }
    })
  : ({} as Auth);

export const db = typeof window !== 'undefined'
  ? new Proxy({} as Firestore, {
      get(target, prop) {
        if (!dbInstance) {
          throw new Error('Firestore not initialized. Ensure you are on the client side and Firebase is loaded. Use getFirestoreInstance() instead.');
        }
        return (dbInstance as any)[prop];
      }
    })
  : ({} as Firestore);


export const functions = typeof window !== 'undefined'
  ? new Proxy({} as Functions, {
      get(target, prop) {
        if (!functionsInstance) {
          throw new Error('Firebase Functions not initialized. Ensure you are on the client side and Firebase is loaded. Use getFunctionsInstance() instead.');
        }
        return (functionsInstance as any)[prop];
      }
    })
  : ({} as Functions);

export default app;

