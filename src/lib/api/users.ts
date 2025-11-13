// User Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreUser } from '@/types/firestore';

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
    console.error('Error creating user:', error);
    throw new Error('שגיאה ביצירת משתמש. נסה שוב.');
  }
}

/**
 * Get user data by ID
 */
export async function getUser(userId: string): Promise<FirestoreUser | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return userSnap.data() as FirestoreUser;
  } catch (error) {
    console.error('Error getting user:', error);
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
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('שגיאה בעדכון נתוני המשתמש.');
  }
}

/**
 * Find user by username
 */
export async function getUserByUsername(username: string): Promise<FirestoreUser | null> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data() as FirestoreUser;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw new Error('שגיאה בחיפוש משתמש.');
  }
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const user = await getUserByUsername(username);
    return user === null;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

