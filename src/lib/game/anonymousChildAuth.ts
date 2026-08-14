import { getAuthInstance } from '@/lib/firebase';
import { getCurrentUserId } from '@/utils/auth';

/** Anonymous Firebase session for child device (onboarding + game). */
export async function ensureAnonymousChildAuth(): Promise<string | null> {
  const auth = await getAuthInstance();
  const { signInAnonymously, signOut } = await import('firebase/auth');
  const authStateReady = (auth as { authStateReady?: () => Promise<void> }).authStateReady;
  if (typeof authStateReady === 'function') {
    await authStateReady();
  }
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    await signOut(auth);
  }
  if (!auth.currentUser) {
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  }
  return getCurrentUserId({ allowAnonymous: true });
}
