// User Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreUser } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Users');

const USERS_COLLECTION = 'users';

/**
 * Create a new user document in Firestore
 */
export async function createUser(
  userId: string,
  userData: Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const userRef = doc(db, USERS_COLLECTION, userId);
    const now = new Date().toISOString();
    
    const firestoreUser: FirestoreUser = {
      id: userId,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(userRef, firestoreUser);
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new Error('שגיאה ביצירת משתמש. נסה שוב.');
  }
}

/**
 * Find a user profile by email (POC: public read on users collection).
 */
export async function getUserByEmail(email: string): Promise<FirestoreUser | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  try {
    const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', normalized),
      limit(1)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return null;
    }

    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as FirestoreUser;
  } catch (error) {
    logger.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Get user data by ID
 */
export async function getUser(userId: string, useCache: boolean = true): Promise<FirestoreUser | null> {
  // Check cache first
  if (useCache) {
    const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
    const cached = dataCache.get<FirestoreUser>(cacheKeys.user(userId));
    if (cached) {
      logger.log(`Using cached user ${userId}`);
      return cached;
    }
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const user = userSnap.data() as FirestoreUser;
    
    // Cache the result
    if (useCache) {
      const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
      dataCache.set(cacheKeys.user(userId), user, cacheTTL.user);
    }
    
    return user;
  } catch (error) {
    logger.error('Error getting user:', error);
    throw new Error('שגיאה בטעינת נתוני המשתמש.');
  }
}

/**
 * Update user data
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<FirestoreUser, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const { dataCache, cacheKeys } = await import('@/utils/data-cache');
    dataCache.invalidate(cacheKeys.user(userId));
  } catch (error) {
    logger.error('Error updating user:', error);
    throw new Error('שגיאה בעדכון נתוני המשתמש.');
  }
}

