// Children Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreChild } from '@/types/firestore';

const CHILDREN_COLLECTION = 'children';

/**
 * Create a new child profile
 */
export async function createChild(
  childData: Omit<FirestoreChild, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const childrenRef = collection(db, CHILDREN_COLLECTION);
    const childRef = doc(childrenRef);
    const now = new Date().toISOString();
    
    const child: FirestoreChild = {
      id: childRef.id,
      ...childData,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(childRef, child);
    return childRef.id;
  } catch (error) {
    console.error('Error creating child:', error);
    throw new Error('שגיאה ביצירת פרופיל ילד. נסה שוב.');
  }
}

/**
 * Get child by ID
 */
export async function getChild(childId: string): Promise<FirestoreChild | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    const childSnap = await getDoc(childRef);
    
    if (!childSnap.exists()) {
      return null;
    }
    
    return childSnap.data() as FirestoreChild;
  } catch (error) {
    console.error('Error getting child:', error);
    throw new Error('שגיאה בטעינת נתוני הילד.');
  }
}

/**
 * Update child data
 */
export async function updateChild(
  childId: string,
  updates: Partial<Omit<FirestoreChild, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    await updateDoc(childRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating child:', error);
    throw new Error('שגיאה בעדכון נתוני הילד.');
  }
}

/**
 * Get all children for a parent
 */
export async function getChildrenByParent(parentId: string): Promise<FirestoreChild[]> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const childrenRef = collection(db, CHILDREN_COLLECTION);
    const q = query(childrenRef, where('parentId', '==', parentId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as FirestoreChild);
  } catch (error) {
    console.error('Error getting children by parent:', error);
    throw new Error('שגיאה בטעינת הילדים.');
  }
}

