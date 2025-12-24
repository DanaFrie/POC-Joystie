// Challenge Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreChallenge } from '@/types/firestore';
import { withRetry } from '@/utils/firestore-retry';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Challenges');

const CHALLENGES_COLLECTION = 'challenges';

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

/**
 * Create a new challenge
 */
export async function createChallenge(
  challengeData: Omit<FirestoreChallenge, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  return withRetry(async () => {
    try {
      const { collection, doc, setDoc } = await import('firebase/firestore');
      const db = await getFirestoreInstance();
      const challengesRef = collection(db, CHALLENGES_COLLECTION);
      const challengeRef = doc(challengesRef);
      const now = new Date().toISOString();
      
      // Remove undefined values before creating the challenge object
      const cleanedData = removeUndefined(challengeData);
      
      const challenge: FirestoreChallenge = {
        id: challengeRef.id,
        ...cleanedData,
        createdAt: now,
        updatedAt: now,
      } as FirestoreChallenge;
      
      await setDoc(challengeRef, challenge);
      return challengeRef.id;
    } catch (error: any) {
      logger.error('Error creating challenge:', error);
      if (error.code === 'permission-denied') {
        throw new Error('אין הרשאה ליצור אתגר. אנא בדוק את ההרשאות.');
      }
      throw new Error('שגיאה ביצירת אתגר. נסה שוב.');
    }
  });
}

/**
 * Get challenge by ID
 */
export async function getChallenge(challengeId: string, useCache: boolean = true): Promise<FirestoreChallenge | null> {
  // Check cache first
  if (useCache) {
    const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
    const cached = dataCache.get<FirestoreChallenge>(cacheKeys.challengeById(challengeId));
    if (cached) {
      logger.log(`Using cached challenge ${challengeId}`);
      return cached;
    }
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    const challengeSnap = await getDoc(challengeRef);
    
    if (!challengeSnap.exists()) {
      return null;
    }
    
    const challenge = challengeSnap.data() as FirestoreChallenge;
    
    // Cache the result
    if (useCache) {
      const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
      dataCache.set(cacheKeys.challengeById(challengeId), challenge, cacheTTL.challenge);
      // Also cache by parentId if available
      if (challenge.parentId) {
        dataCache.set(cacheKeys.challenge(challenge.parentId), challenge, cacheTTL.challenge);
      }
    }
    
    return challenge;
  } catch (error) {
    logger.error('Error getting challenge:', error);
    throw new Error('שגיאה בטעינת נתוני האתגר.');
  }
}

/**
 * Update challenge
 */
export async function updateChallenge(
  challengeId: string,
  updates: Partial<Omit<FirestoreChallenge, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    
    // Remove undefined values before updating
    const cleanedUpdates = removeUndefined({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    await updateDoc(challengeRef, cleanedUpdates);
  } catch (error) {
    logger.error('Error updating challenge:', error);
    throw new Error('שגיאה בעדכון האתגר.');
  }
}

/**
 * Get active challenge for a user
 */
export async function getActiveChallenge(parentId: string, useCache: boolean = true): Promise<FirestoreChallenge | null> {
  // Check cache first
  if (useCache) {
    const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
    const cached = dataCache.get<FirestoreChallenge>(cacheKeys.challenge(parentId));
    if (cached) {
      logger.log(`Using cached challenge for ${parentId}`);
      return cached;
    }
  }

  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    
    // Ensure db is valid
    if (!db) {
      logger.error('Firestore instance is null or undefined');
      throw new Error('Firestore not initialized');
    }
    
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    
    // First, check all challenges for this user (for debugging)
    const allChallengesQuery = query(challengesRef, where('parentId', '==', parentId));
    const allChallengesSnapshot = await getDocs(allChallengesQuery);
    logger.log(`Found ${allChallengesSnapshot.size} total challenges for user ${parentId}`);
    
    if (allChallengesSnapshot.size > 0) {
      allChallengesSnapshot.docs.forEach(doc => {
        const challenge = doc.data() as FirestoreChallenge;
        logger.log(`Challenge ${doc.id}: isActive=${challenge.isActive}, childId=${challenge.childId}`);
      });
    }
    
    // Now query for active challenges
    const q = query(
      challengesRef,
      where('parentId', '==', parentId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      logger.warn(`No active challenge found for user ${parentId}`);
      return null;
    }
    
    // Return the first active challenge (should only be one)
    const challenge = querySnapshot.docs[0].data() as FirestoreChallenge;
    logger.log(`Found active challenge: ${querySnapshot.docs[0].id}`);
    
    // Cache the result
    if (useCache) {
      const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
      dataCache.set(cacheKeys.challenge(parentId), challenge, cacheTTL.challenge);
    }
    
    return challenge;
  } catch (error) {
    logger.error('Error getting active challenge:', error);
    throw new Error('שגיאה בטעינת האתגר הפעיל.');
  }
}

/**
 * Get all challenges for a user
 */
export async function getUserChallenges(parentId: string): Promise<FirestoreChallenge[]> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const q = query(challengesRef, where('parentId', '==', parentId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as FirestoreChallenge);
  } catch (error) {
    logger.error('Error getting user challenges:', error);
    throw new Error('שגיאה בטעינת האתגרים.');
  }
}

/**
 * Deactivate a challenge
 * Optionally includes redemption data when deactivating after redemption
 */
export async function deactivateChallenge(
  challengeId: string,
  redemptionData?: {
    redemptionAmount?: number;
    redemptionChoice?: 'cash' | 'gift' | 'activity' | 'save';
    redeemedAt?: string;
  }
): Promise<void> {
  try {
    await updateChallenge(challengeId, {
      isActive: false,
      ...(redemptionData && {
        redemptionAmount: redemptionData.redemptionAmount,
        redemptionChoice: redemptionData.redemptionChoice,
        redeemedAt: redemptionData.redeemedAt
      })
    });
  } catch (error) {
    logger.error('Error deactivating challenge:', error);
    throw new Error('שגיאה בביטול האתגר.');
  }
}

