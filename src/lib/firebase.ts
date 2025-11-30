// Firebase initialization - using dynamic imports to avoid SSR issues
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';

// Firebase configuration
// Next.js automatically loads NEXT_PUBLIC_* variables at build time
// But we need to access them at runtime, so we use a function to get them
function getFirebaseConfig() {
  if (typeof window === 'undefined') {
    // Server-side: use process.env directly
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  } else {
    // Client-side: Next.js injects these into window.__NEXT_DATA__ or we can access them directly
    // In Next.js, NEXT_PUBLIC_* vars are embedded at build time
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }
}

const firebaseConfig = getFirebaseConfig();

// Lazy initialization - only on client side
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let functionsInstance: Functions | null = null;
let initPromise: Promise<void> | null = null;

// Initialize Firebase (lazy, client-side only)
async function initializeFirebase(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side');
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
      const { getStorage } = await import('firebase/storage');
      const { getFunctions } = await import('firebase/functions');

      // Get config at runtime (Next.js embeds NEXT_PUBLIC_* vars at build time)
      const config = getFirebaseConfig();

      // Validate config
      const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
      const missing = required.filter(key => !config[key as keyof typeof config] || String(config[key as keyof typeof config]).trim() === '');
      
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

      // Initialize Storage (optional)
      try {
        if (config.storageBucket) {
          storageInstance = getStorage(app);
        } else {
          console.warn('Firebase Storage bucket not configured. Storage features will be unavailable.');
        }
      } catch (storageError) {
        console.warn('Firebase Storage initialization failed. You can set it up later:', storageError);
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
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

export async function getStorageInstance(): Promise<FirebaseStorage | null> {
  if (!storageInstance && firebaseConfig.storageBucket) {
    await initializeFirebase();
  }
  return storageInstance;
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

export function getStorageSync(): FirebaseStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return storageInstance;
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

export const storage = typeof window !== 'undefined'
  ? new Proxy({} as FirebaseStorage, {
      get(target, prop) {
        if (!storageInstance) {
          return undefined;
        }
        return (storageInstance as any)[prop];
      }
    })
  : (null as any as FirebaseStorage);

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

