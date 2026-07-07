import { getAuthInstance } from '@/lib/firebase';
import { createUser, getUser, getUserByEmail } from '@/lib/api/users';
import { splitDisplayName } from '@/lib/onboarding/persistOnboardingAccount';
import { getOAuthUserDisplayName, getOAuthUserEmail } from '@/utils/auth-oauth';
import type { FirestoreUser } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('EnsureUserProfile');

function profileFromFirestoreDoc(profile: FirestoreUser): Omit<
  FirestoreUser,
  'id' | 'createdAt' | 'updatedAt'
> {
  return {
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender,
    kidsAges: profile.kidsAges ?? [],
    termsAccepted: profile.termsAccepted ?? false,
    onboarding: profile.onboarding ?? false,
    signupDate: profile.signupDate,
  };
}

/**
 * Resolve Firestore profile after Auth sign-in. Creates or re-links a profile when missing at uid.
 */
export async function ensureUserProfileForLogin(uid: string): Promise<FirestoreUser> {
  const existing = await getUser(uid, true);
  if (existing) {
    return existing;
  }

  const auth = await getAuthInstance();
  const firebaseUser = auth.currentUser;
  if (!firebaseUser || firebaseUser.uid !== uid) {
    throw new Error('נתוני המשתמש לא נמצאו. אנא הירשמו מחדש.');
  }

  const email = getOAuthUserEmail(firebaseUser).toLowerCase();
  const byEmail = email ? await getUserByEmail(email) : null;
  const now = new Date().toISOString();

  if (byEmail) {
    if (byEmail.id !== uid) {
      logger.warn(
        `Firestore user ${byEmail.id} email match but Auth uid is ${uid} — creating profile at Auth uid`
      );
    }
    const profile = {
      ...profileFromFirestoreDoc(byEmail),
      signupDate: byEmail.signupDate || now,
    };
    await createUser(uid, profile);
    return { id: uid, ...profile, createdAt: now, updatedAt: now };
  }

  const { firstName, lastName } = splitDisplayName(
    getOAuthUserDisplayName(firebaseUser)
  );
  const profile = {
    email,
    firstName,
    lastName,
    gender: 'male' as const,
    kidsAges: [],
    termsAccepted: false,
    onboarding: false,
    signupDate: now,
  };
  await createUser(uid, profile);
  return { id: uid, ...profile, createdAt: now, updatedAt: now };
}
