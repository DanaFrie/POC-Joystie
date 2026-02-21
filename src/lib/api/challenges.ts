// Challenge Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';
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
 * Get the latest challenge for a user (most recent by createdAt), including pending (isActive: false).
 * Used when user has completed onboarding but consultation not yet approved - so we can show "בקרוב ניפגש".
 */
export async function getLatestChallenge(parentId: string): Promise<FirestoreChallenge | null> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const q = query(challengesRef, where('parentId', '==', parentId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreChallenge));
    challenges.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return challenges[0] || null;
  } catch (error) {
    logger.error('Error getting latest challenge:', error);
    return null;
  }
}

/**
 * Get all pending challenges (for admin - consultation approval)
 * Returns challenges where consultationCompleted is not true and isActive is false
 */
export async function getAllPendingChallenges(): Promise<FirestoreChallenge[]> {
  try {
    const { collection, query, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    
    // Query all challenges (no filter - admin has permission to read all)
    const q = query(challengesRef);
    const querySnapshot = await getDocs(q);
    
    // Filter in code: pending consultations (not completed and not active)
    const allChallenges = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestoreChallenge));
    
    const pendingChallenges = allChallenges.filter(
      (challenge) => challenge.consultationCompleted !== true && !challenge.isActive
    );
    
    logger.log(`Found ${pendingChallenges.length} pending challenges out of ${allChallenges.length} total`);
    
    return pendingChallenges;
  } catch (error) {
    logger.error('Error getting all pending challenges:', error);
    throw new Error('שגיאה בטעינת האתגרים הממתינים.');
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
    redemptionChoice?: 'cash' | 'donation' | 'activity' | 'save';
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

/**
 * Create or update weekly upload for a challenge
 * Called when child uploads screenshot on redemption day
 */
export async function updateWeeklyUpload(
  challengeId: string,
  uploadData: {
    screenshotUrl: string;
    uploadedBy: 'parent' | 'child';
    childEstimate?: {
      metGoal: boolean;
      estimatedEarnings: number;
    };
    processedData?: {
      screenTimeMinutes: number;
      /** Minutes per day (Hebrew day name -> minutes). From single weekly processing. */
      minutesPerDay?: Record<string, number>;
      apps?: Array<{
        name: string;
        timeUsed: number;
        icon?: string;
      }>;
    };
    /** Set when image processing detected mismatch or all-zero; front should show manual review */
    manualReviewRequired?: boolean;
  }
): Promise<void> {
  return withRetry(async () => {
    try {
      const now = new Date().toISOString();
      
      const weeklyUpload: WeeklyUpload = {
        screenshotUrl: uploadData.screenshotUrl,
        uploadedAt: now,
        uploadedBy: uploadData.uploadedBy,
        status: 'pending',
        childEstimate: uploadData.childEstimate,
        processedData: uploadData.processedData,
        manualReviewRequired: uploadData.manualReviewRequired,
      };
      
      // Remove undefined values
      const cleanedUpload = removeUndefined(weeklyUpload);
      
      await updateChallenge(challengeId, {
        weeklyUpload: cleanedUpload as WeeklyUpload,
      });
      
      logger.log(`Weekly upload created for challenge ${challengeId}`);
    } catch (error: any) {
      logger.error('Error creating weekly upload:', error);
      if (error.code === 'permission-denied') {
        throw new Error('אין הרשאה להעלות. אנא בדוק את ההרשאות.');
      }
      throw new Error('שגיאה בהעלאת צילום המסך. נסה שוב.');
    }
  });
}

/**
 * Approve the weekly upload
 * Called by parent after reviewing the screenshot
 */
export async function approveWeeklyUpload(challengeId: string): Promise<void> {
  return withRetry(async () => {
    try {
      // First get the current challenge to access weeklyUpload
      const challenge = await getChallenge(challengeId, false);
      if (!challenge) {
        throw new Error('האתגר לא נמצא');
      }
      
      if (!challenge.weeklyUpload) {
        throw new Error('לא נמצאה העלאה לאישור');
      }
      
      const now = new Date().toISOString();
      
      const updatedWeeklyUpload: WeeklyUpload = {
        ...challenge.weeklyUpload,
        status: 'approved',
        approvedAt: now,
      };
      
      await updateChallenge(challengeId, {
        weeklyUpload: updatedWeeklyUpload,
      });
      
      // Invalidate cache
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      dataCache.invalidate(cacheKeys.challengeById(challengeId));
      if (challenge.parentId) {
        dataCache.invalidate(cacheKeys.challenge(challenge.parentId));
      }
      
      logger.log(`Weekly upload approved for challenge ${challengeId}`);
    } catch (error: any) {
      logger.error('Error approving weekly upload:', error);
      throw new Error('שגיאה באישור ההעלאה. נסה שוב.');
    }
  });
}

/**
 * Reject the weekly upload
 * Called by parent if screenshot doesn't match expectations
 */
export async function rejectWeeklyUpload(
  challengeId: string,
  reason?: string
): Promise<void> {
  return withRetry(async () => {
    try {
      // First get the current challenge to access weeklyUpload
      const challenge = await getChallenge(challengeId, false);
      if (!challenge) {
        throw new Error('האתגר לא נמצא');
      }
      
      if (!challenge.weeklyUpload) {
        throw new Error('לא נמצאה העלאה לדחייה');
      }
      
      const now = new Date().toISOString();
      
      const updatedWeeklyUpload: WeeklyUpload = {
        ...challenge.weeklyUpload,
        status: 'rejected',
        rejectedAt: now,
        rejectionReason: reason,
      };
      
      await updateChallenge(challengeId, {
        weeklyUpload: updatedWeeklyUpload,
      });
      
      // Invalidate cache
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      dataCache.invalidate(cacheKeys.challengeById(challengeId));
      if (challenge.parentId) {
        dataCache.invalidate(cacheKeys.challenge(challenge.parentId));
      }
      
      logger.log(`Weekly upload rejected for challenge ${challengeId}`);
    } catch (error: any) {
      logger.error('Error rejecting weekly upload:', error);
      throw new Error('שגיאה בדחיית ההעלאה. נסה שוב.');
    }
  });
}

/**
 * Check if weekly upload exists and get its status
 */
export async function getWeeklyUploadStatus(challengeId: string): Promise<{
  exists: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  weeklyUpload?: WeeklyUpload;
}> {
  try {
    const challenge = await getChallenge(challengeId, true);
    if (!challenge || !challenge.weeklyUpload) {
      return { exists: false };
    }
    
    return {
      exists: true,
      status: challenge.weeklyUpload.status,
      weeklyUpload: challenge.weeklyUpload,
    };
  } catch (error) {
    logger.error('Error getting weekly upload status:', error);
    return { exists: false };
  }
}

