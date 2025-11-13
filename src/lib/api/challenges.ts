// Challenge Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreChallenge } from '@/types/firestore';

const CHALLENGES_COLLECTION = 'challenges';

/**
 * Create a new challenge
 */
export async function createChallenge(
  challengeData: Omit<FirestoreChallenge, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const challengeRef = doc(challengesRef);
    const now = new Date().toISOString();
    
    const challenge: FirestoreChallenge = {
      id: challengeRef.id,
      ...challengeData,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(challengeRef, challenge);
    return challengeRef.id;
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw new Error('שגיאה ביצירת אתגר. נסה שוב.');
  }
}

/**
 * Get challenge by ID
 */
export async function getChallenge(challengeId: string): Promise<FirestoreChallenge | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    const challengeSnap = await getDoc(challengeRef);
    
    if (!challengeSnap.exists()) {
      return null;
    }
    
    return challengeSnap.data() as FirestoreChallenge;
  } catch (error) {
    console.error('Error getting challenge:', error);
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
    await updateDoc(challengeRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating challenge:', error);
    throw new Error('שגיאה בעדכון האתגר.');
  }
}

/**
 * Get active challenge for a user
 */
export async function getActiveChallenge(parentId: string): Promise<FirestoreChallenge | null> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const challengesRef = collection(db, CHALLENGES_COLLECTION);
    const q = query(
      challengesRef,
      where('parentId', '==', parentId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first active challenge (should only be one)
    return querySnapshot.docs[0].data() as FirestoreChallenge;
  } catch (error) {
    console.error('Error getting active challenge:', error);
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
    console.error('Error getting user challenges:', error);
    throw new Error('שגיאה בטעינת האתגרים.');
  }
}

/**
 * Deactivate a challenge
 */
export async function deactivateChallenge(challengeId: string): Promise<void> {
  try {
    await updateChallenge(challengeId, { isActive: false });
  } catch (error) {
    console.error('Error deactivating challenge:', error);
    throw new Error('שגיאה בביטול האתגר.');
  }
}

