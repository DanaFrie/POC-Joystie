// Admin utilities
import { getCurrentUser } from './auth';
import { createContextLogger } from './logger';

const logger = createContextLogger('Admin');

// Admin email - single admin user
const ADMIN_EMAIL = 'admin@joystie.com';

/**
 * Check if current user is admin
 * Waits for auth state to be ready if needed
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { getAuthInstance } = await import('@/lib/firebase');
    const { onAuthStateChanged } = await import('firebase/auth');
    const auth = await getAuthInstance();
    
    // If we have a current user, check immediately
    if (auth.currentUser && auth.currentUser.email) {
      return auth.currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    }
    
    // Otherwise, wait for auth state to initialize
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe(); // Only listen once
        if (user && user.email) {
          resolve(user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
        } else {
          resolve(false);
        }
      });
      
      // Timeout after 2 seconds if auth state doesn't change
      setTimeout(() => {
        unsubscribe();
        if (auth.currentUser && auth.currentUser.email) {
          resolve(auth.currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
        } else {
          resolve(false);
        }
      }, 2000);
    });
  } catch (error) {
    logger.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin email
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}
