import { getAuthInstance } from '@/lib/firebase';
import { getCurrentUserId } from '@/utils/auth';

/** Anonymous Firebase session for child device (onboarding + game). */
export async function ensureAnonymousChildAuth(): Promise<string | null> {
  const auth = await getAuthInstance();
  const { signInAnonymously, signOut } = await import('firebase/auth');
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    await signOut(auth);
  }
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return getCurrentUserId();
}
