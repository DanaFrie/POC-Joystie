import { getAuthInstance } from '@/lib/firebase';
import { createUser, getUser, getUserByEmail, getUsersByEmail, updateUser } from '@/lib/api/users';
import { splitDisplayName } from '@/lib/onboarding/persistOnboardingAccount';
import { getOAuthUserDisplayName, getOAuthUserEmail } from '@/utils/auth-oauth';
import { hasV03KidsAgesReady } from '@/lib/auth/userOnboardingStatus';
import { FLOW_STEP_STORAGE_KEY, isInProgressOnboardingFunnelStep } from '@/lib/onboarding/parentFlowSession';
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
 * Google always signs into the original Auth uid. A later signup can leave a
 * richer v0.3 `users` doc on a different uid with the same email — copy kids.
 */
async function mergeRicherEmailTwin(
  uid: string,
  existing: FirestoreUser
): Promise<FirestoreUser> {
  if (hasV03KidsAgesReady(existing) || existing.onboarding) {
    return existing;
  }
  const email = existing.email?.trim().toLowerCase();
  if (!email) return existing;

  const twins = (await getUsersByEmail(email)).filter((row) => row.id !== uid);
  const better = twins
    .filter((row) => hasV03KidsAgesReady(row))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))[0];
  if (!better) return existing;

  try {
    const gender =
      existing.gender === 'male' || existing.gender === 'female'
        ? existing.gender
        : better.gender;
    await updateUser(uid, {
      kidsAges: better.kidsAges,
      firstName: existing.firstName || better.firstName,
      lastName: existing.lastName || better.lastName,
      gender,
    });
    logger.log('Merged v03 kidsAges from email twin', { uid, from: better.id });
    return {
      ...existing,
      kidsAges: better.kidsAges,
      firstName: existing.firstName || better.firstName,
      lastName: existing.lastName || better.lastName,
      gender,
    };
  } catch (error) {
    logger.warn('Could not merge email-twin profile', error);
    return existing;
  }
}

/**
 * Resolve Firestore profile after Auth sign-in. Creates or re-links a profile when missing at uid.
 */
export async function ensureUserProfileForLogin(uid: string): Promise<FirestoreUser> {
  // Fresh read — cached stubs (pre-terms) caused false "unknown account" after Apple signup.
  const existing = await getUser(uid, false);
  if (existing) {
    if (
      typeof window !== 'undefined' &&
      isInProgressOnboardingFunnelStep(sessionStorage.getItem(FLOW_STEP_STORAGE_KEY))
    ) {
      return existing;
    }
    return mergeRicherEmailTwin(uid, existing);
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
