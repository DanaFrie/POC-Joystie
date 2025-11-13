// Upload Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreDailyUpload } from '@/types/firestore';

const UPLOADS_COLLECTION = 'daily_uploads';

/**
 * Create a new daily upload
 */
export async function createUpload(
  uploadData: Omit<FirestoreDailyUpload, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadsRef = collection(db, UPLOADS_COLLECTION);
    const uploadRef = doc(uploadsRef);
    const now = new Date().toISOString();
    
    const upload: FirestoreDailyUpload = {
      id: uploadRef.id,
      ...uploadData,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(uploadRef, upload);
    return uploadRef.id;
  } catch (error) {
    console.error('Error creating upload:', error);
    throw new Error('שגיאה בשמירת ההעלאה. נסה שוב.');
  }
}

/**
 * Get upload by ID
 */
export async function getUpload(uploadId: string): Promise<FirestoreDailyUpload | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadRef = doc(db, UPLOADS_COLLECTION, uploadId);
    const uploadSnap = await getDoc(uploadRef);
    
    if (!uploadSnap.exists()) {
      return null;
    }
    
    return uploadSnap.data() as FirestoreDailyUpload;
  } catch (error) {
    console.error('Error getting upload:', error);
    throw new Error('שגיאה בטעינת ההעלאה.');
  }
}

/**
 * Get uploads for a specific challenge
 */
export async function getUploadsByChallenge(
  challengeId: string,
  limitCount?: number
): Promise<FirestoreDailyUpload[]> {
  try {
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadsRef = collection(db, UPLOADS_COLLECTION);
    let q = query(
      uploadsRef,
      where('challengeId', '==', challengeId),
      orderBy('date', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as FirestoreDailyUpload);
  } catch (error) {
    console.error('Error getting uploads by challenge:', error);
    throw new Error('שגיאה בטעינת ההעלאות.');
  }
}

/**
 * Get upload for a specific date
 */
export async function getUploadByDate(
  challengeId: string,
  date: string
): Promise<FirestoreDailyUpload | null> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadsRef = collection(db, UPLOADS_COLLECTION);
    const q = query(
      uploadsRef,
      where('challengeId', '==', challengeId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data() as FirestoreDailyUpload;
  } catch (error) {
    console.error('Error getting upload by date:', error);
    throw new Error('שגיאה בטעינת ההעלאה לתאריך זה.');
  }
}

/**
 * Get uploads requiring approval
 */
export async function getPendingApprovals(parentId: string): Promise<FirestoreDailyUpload[]> {
  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadsRef = collection(db, UPLOADS_COLLECTION);
    const q = query(
      uploadsRef,
      where('parentId', '==', parentId),
      where('requiresApproval', '==', true),
      where('parentAction', '==', null),
      orderBy('uploadedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as FirestoreDailyUpload);
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    throw new Error('שגיאה בטעינת ההעלאות הממתינות לאישור.');
  }
}

/**
 * Approve an upload
 */
export async function approveUpload(uploadId: string): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadRef = doc(db, UPLOADS_COLLECTION, uploadId);
    const now = new Date().toISOString();
    
    await updateDoc(uploadRef, {
      requiresApproval: false,
      parentAction: 'approved',
      approvedAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error approving upload:', error);
    throw new Error('שגיאה באישור ההעלאה.');
  }
}

/**
 * Reject an upload
 */
export async function rejectUpload(uploadId: string): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadRef = doc(db, UPLOADS_COLLECTION, uploadId);
    const now = new Date().toISOString();
    
    await updateDoc(uploadRef, {
      requiresApproval: false,
      parentAction: 'rejected',
      rejectedAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error rejecting upload:', error);
    throw new Error('שגיאה בדחיית ההעלאה.');
  }
}

/**
 * Update upload data
 */
export async function updateUpload(
  uploadId: string,
  updates: Partial<Omit<FirestoreDailyUpload, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadRef = doc(db, UPLOADS_COLLECTION, uploadId);
    await updateDoc(uploadRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating upload:', error);
    throw new Error('שגיאה בעדכון ההעלאה.');
  }
}

