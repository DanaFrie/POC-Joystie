import { getAuthInstance } from '@/lib/firebase';
import { getUserByEmail } from '@/lib/api/users';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('AuthApi');

/**
 * Returns true when an account already exists for this email.
 * Prefers Firestore (works before deploy / without enumeration API).
 */
export async function checkAuthEmailExists(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const profile = await getUserByEmail(normalized);
  if (profile) return true;

  try {
    const { fetchSignInMethodsForEmail } = await import('firebase/auth');
    const auth = await getAuthInstance();
    const methods = await fetchSignInMethodsForEmail(auth, normalized);
    return methods.length > 0;
  } catch (error) {
    logger.warn('checkAuthEmailExists: fetchSignInMethodsForEmail unavailable', error);
    return false;
  }
}
