import { getAuthInstance } from '@/lib/firebase';
import { getUserByEmail } from '@/lib/api/users';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('AuthApi');

/** Auth-only check — use after a Firestore email lookup already missed. */
export async function authEmailHasSignInMethods(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  try {
    const { fetchSignInMethodsForEmail } = await import('firebase/auth');
    const auth = await getAuthInstance();
    const methods = await fetchSignInMethodsForEmail(auth, normalized);
    return methods.length > 0;
  } catch (error) {
    logger.warn('authEmailHasSignInMethods unavailable', error);
    return false;
  }
}

/**
 * Returns true when an account already exists for this email.
 * Prefers Firestore (works before deploy / without enumeration API).
 */
export async function checkAuthEmailExists(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const profile = await getUserByEmail(normalized);
  if (profile) return true;

  return authEmailHasSignInMethods(normalized);
}
