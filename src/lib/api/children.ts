// Children Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreChild } from '@/types/firestore';
import { serverConfig } from '@/config/server.config';

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
export async function getChild(childId: string, useCache: boolean = true): Promise<FirestoreChild | null> {
  // Check cache first
  if (useCache) {
    const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
    const cached = dataCache.get<FirestoreChild>(cacheKeys.child(childId));
    if (cached) {
      console.log(`[Children] Using cached child ${childId}`);
      return cached;
    }
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    const childSnap = await getDoc(childRef);
    
    if (!childSnap.exists()) {
      return null;
    }
    
    const child = childSnap.data() as FirestoreChild;
    
    // Cache the result
    if (useCache) {
      const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
      dataCache.set(cacheKeys.child(childId), child, cacheTTL.child);
    }
    
    return child;
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
  updates: Partial<Omit<FirestoreChild, 'id' | 'createdAt'>>,
  parentId?: string // Optional parentId for creating document if it doesn't exist
): Promise<void> {
  try {
    const { doc, updateDoc, getDoc, setDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const childRef = doc(db, CHILDREN_COLLECTION, childId);
    
    // Log current state before update
    console.log('[updateChild] ===== Starting update =====');
    console.log('[updateChild] Child ID:', childId);
    console.log('[updateChild] Updates to apply:', JSON.stringify(updates, null, 2));
    console.log('[updateChild] Parent ID (if provided):', parentId);
    
    // Get current document to log its state
    let documentExists = false;
    let currentData: any = null;
    try {
      const currentDoc = await getDoc(childRef);
      if (currentDoc.exists()) {
        documentExists = true;
        currentData = currentDoc.data();
        console.log('[updateChild] Current document exists');
        console.log('[updateChild] Current document data:', JSON.stringify(currentData, null, 2));
        console.log('[updateChild] Current document keys:', Object.keys(currentData));
        console.log('[updateChild] Has nickname?', currentData.nickname ? `Yes: "${currentData.nickname}"` : 'No');
        console.log('[updateChild] Has moneyGoals?', currentData.moneyGoals ? `Yes: ${JSON.stringify(currentData.moneyGoals)}` : 'No');
        console.log('[updateChild] moneyGoals type:', typeof currentData.moneyGoals, Array.isArray(currentData.moneyGoals) ? '(array)' : '(not array)');
        if (Array.isArray(currentData.moneyGoals)) {
          console.log('[updateChild] moneyGoals size:', currentData.moneyGoals.length);
        }
        console.log('[updateChild] parentId:', currentData.parentId);
      } else {
        console.warn('[updateChild] Document does not exist! Will attempt to create it.');
      }
    } catch (readError: any) {
      console.error('[updateChild] Error reading current document:', readError);
      console.error('[updateChild] Read error code:', readError.code);
      console.error('[updateChild] Read error message:', readError.message);
    }
    
    // Check authentication state
    const { getAuth, signOut } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    console.log('[updateChild] Auth state:', currentUser ? `Authenticated as ${currentUser.uid}` : 'Not authenticated');
    
    // If a different user is signed in and we're doing unauthenticated update, sign them out
    // This prevents conflicts where a different user's auth interferes with the unauthenticated update
    if (currentUser && parentId && currentUser.uid !== parentId) {
      console.log('[updateChild] Different user signed in. Signing out to prevent conflict...');
      try {
        await signOut(auth);
        console.log('[updateChild] Signed out successfully');
      } catch (signOutError) {
        console.warn('[updateChild] Error signing out (non-critical):', signOutError);
      }
    }
    
    // If document doesn't exist and we have parentId, try to create it
    if (!documentExists && parentId) {
      console.log('[updateChild] Document does not exist, attempting to create with minimal data...');
      const now = new Date().toISOString();
      const createPayload: any = {
        id: childId,
        parentId: parentId,
        name: '', // Will be updated later if needed
        age: '',
        gender: 'boy' as const,
        deviceType: 'ios' as const,
        createdAt: now,
        updatedAt: now,
        ...updates, // Include nickname and moneyGoals if provided
      };
      console.log('[updateChild] Create payload:', JSON.stringify(createPayload, null, 2));
      try {
        await setDoc(childRef, createPayload);
        console.log('[updateChild] Document created successfully!');
        return;
      } catch (createError: any) {
        console.error('[updateChild] Error creating document:', createError);
        console.error('[updateChild] Create error code:', createError.code);
        console.error('[updateChild] Create error message:', createError.message);
        // Fall through to try update anyway
      }
    }
    
    // Prepare update payload
    const updatePayload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    console.log('[updateChild] Update payload:', JSON.stringify(updatePayload, null, 2));
    console.log('[updateChild] Update payload keys:', Object.keys(updatePayload));
    
    // Attempt update
    console.log('[updateChild] Attempting update...');
    await updateDoc(childRef, updatePayload);
    console.log('[updateChild] Update successful!');
    console.log('[updateChild] ===== Update complete =====');
  } catch (error: any) {
    console.error('[updateChild] ===== Update failed =====');
    console.error('[updateChild] Error updating child:', error);
    console.error('[updateChild] Error code:', error.code);
    console.error('[updateChild] Error message:', error.message);
    console.error('[updateChild] Error name:', error.name);
    if (error.serverResponse) {
      console.error('[updateChild] Server response:', error.serverResponse);
    }
    if (error.stack) {
      console.error('[updateChild] Stack trace:', error.stack);
    }
    console.error('[updateChild] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
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

/**
 * Get all occupied nicknames (children with nicknames)
 * Note: Firestore doesn't support != null queries, so we fetch all and filter
 */
export async function getOccupiedNicknames(): Promise<string[]> {
  try {
    const { collection, getDocs, limit, query } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const childrenRef = collection(db, CHILDREN_COLLECTION);
    
    // Get all children (with limit to avoid performance issues)
    // In production, consider adding an index on nickname field
    const q = query(childrenRef, limit(serverConfig.firestore.maxQueryLimit));
    const querySnapshot = await getDocs(q);
    
    const nicknames = querySnapshot.docs
      .map(doc => {
        const child = doc.data() as FirestoreChild;
        return child.nickname;
      })
      .filter((nickname): nickname is string => !!nickname);
    
    return nicknames;
  } catch (error) {
    console.error('Error getting occupied nicknames:', error);
    // Return empty array on error to allow generation to continue
    return [];
  }
}

