// Upload Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreDailyUpload } from '@/types/firestore';
import { withRetry } from '@/utils/firestore-retry';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Uploads');

const UPLOADS_COLLECTION = 'daily_uploads';

/**
 * Create a new daily upload
 */
export async function createUpload(
  uploadData: Omit<FirestoreDailyUpload, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  return withRetry(async () => {
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
    } catch (error: any) {
      logger.error('Error creating upload:', error);
      // Re-throw with user-friendly message
      if (error.code === 'permission-denied') {
        throw new Error('אין הרשאה ליצור העלאה. אנא בדוק את ההרשאות.');
      }
      throw new Error('שגיאה בשמירת ההעלאה. נסה שוב.');
    }
  });
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
    logger.error('Error getting upload:', error);
    throw new Error('שגיאה בטעינת ההעלאה.');
  }
}

/**
 * Get uploads for a specific challenge
 * Note: parentId is required for Firestore security rules validation
 */
export async function getUploadsByChallenge(
  challengeId: string,
  parentId?: string,
  limitCount?: number,
  useCache: boolean = true
): Promise<FirestoreDailyUpload[]> {
  // Check cache first (only if parentId is provided and no limit)
  if (useCache && parentId && !limitCount) {
    const { dataCache, cacheKeys } = await import('@/utils/data-cache');
    const cached = dataCache.get<FirestoreDailyUpload[]>(cacheKeys.uploads(challengeId, parentId));
    if (cached) {
      logger.log(`Using cached uploads for challenge ${challengeId}`);
      return cached;
    }
  }

  try {
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadsRef = collection(db, UPLOADS_COLLECTION);
    
    // Build query - must include parentId for security rules
    let q;
    if (parentId) {
      // Query with both challengeId and parentId (required for security rules)
      q = query(
        uploadsRef,
        where('challengeId', '==', challengeId),
        where('parentId', '==', parentId),
        orderBy('date', 'desc')
      );
    } else {
      // Fallback: query by challengeId only (may fail if security rules require parentId)
      q = query(
        uploadsRef,
        where('challengeId', '==', challengeId),
        orderBy('date', 'desc')
      );
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    // Use getDocs which gets from server if cache is stale, or force server fetch
    const querySnapshot = await getDocs(q);
    const uploads = querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreDailyUpload;
      logger.log(`Fetched upload from getUploadsByChallenge:`, {
        id: data.id,
        date: data.date,
        challengeId: data.challengeId,
        parentId: data.parentId,
        requiresApproval: data.requiresApproval,
        parentAction: data.parentAction,
        success: data.success,
        uploadedAt: data.uploadedAt,
        updatedAt: data.updatedAt
      });
      return data;
    });
    logger.log(`Total uploads fetched: ${uploads.length}`);
    return uploads;
  } catch (error) {
    logger.error('Error getting uploads by challenge:', error);
    throw new Error('שגיאה בטעינת ההעלאות.');
  }
}

/**
 * Get upload for a specific date
 * Note: parentId is required for Firestore security rules validation
 */
export async function getUploadByDate(
  challengeId: string,
  date: string,
  parentId?: string
): Promise<FirestoreDailyUpload | null> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadsRef = collection(db, UPLOADS_COLLECTION);
    
    // Build query - must include parentId for security rules
    let q;
    if (parentId) {
      // Query with both challengeId and parentId (required for security rules)
      q = query(
        uploadsRef,
        where('challengeId', '==', challengeId),
        where('parentId', '==', parentId),
        where('date', '==', date)
      );
    } else {
      // Fallback: query by challengeId and date only (may fail if security rules require parentId)
      q = query(
        uploadsRef,
        where('challengeId', '==', challengeId),
        where('date', '==', date)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      logger.log(`No upload found for date ${date} in challenge ${challengeId}`);
      return null;
    }
    
    const upload = querySnapshot.docs[0].data() as FirestoreDailyUpload;
    logger.log(`Found upload by date:`, {
      id: upload.id,
      date: upload.date,
      challengeId: upload.challengeId,
      parentId: upload.parentId,
      requiresApproval: upload.requiresApproval,
      parentAction: upload.parentAction,
      success: upload.success,
      uploadedAt: upload.uploadedAt,
      updatedAt: upload.updatedAt
    });
    
    // Log if multiple uploads found (shouldn't happen, but indicates data issue)
    if (querySnapshot.docs.length > 1) {
      logger.warn(`⚠️ Multiple uploads found for date ${date} in challenge ${challengeId}:`, 
        querySnapshot.docs.map(doc => {
          const data = doc.data() as FirestoreDailyUpload;
          return {
            id: data.id,
            date: data.date,
            requiresApproval: data.requiresApproval,
            parentAction: data.parentAction,
            uploadedAt: data.uploadedAt,
            updatedAt: data.updatedAt
          };
        })
      );
    }
    
    return upload;
  } catch (error) {
    logger.error('Error getting upload by date:', error);
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
    logger.error('Error getting pending approvals:', error);
    throw new Error('שגיאה בטעינת ההעלאות הממתינות לאישור.');
  }
}

/**
 * Get pending approvals for a specific challenge (lean query)
 * Only fetches uploads that require approval and haven't been approved yet
 * Returns at most 1 document (the most recent pending approval)
 */
export async function getPendingApprovalsByChallenge(
  challengeId: string,
  parentId: string
): Promise<FirestoreDailyUpload[]> {
  try {
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const uploadsRef = collection(db, UPLOADS_COLLECTION);
    
    // Lean query: only pending approvals for this challenge
    // Uses uploadedAt for ordering (better indexing) and limits to 1 document
    const q = query(
      uploadsRef,
      where('challengeId', '==', challengeId),
      where('parentId', '==', parentId),
      where('requiresApproval', '==', true),
      where('parentAction', '==', null),
      orderBy('uploadedAt', 'desc'),
      limit(1) // Only need to know if there's any pending approval
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as FirestoreDailyUpload);
  } catch (error) {
    logger.error('Error getting pending approvals by challenge:', error);
    throw new Error('שגיאה בטעינת ההעלאות הממתינות לאישור.');
  }
}

/**
 * Batch approve an upload with optional manual data updates
 * This combines updateUpload + approveUpload into a single batch write for better performance
 */
export async function batchApproveUpload(
  uploadId: string,
  manualUpdates?: Partial<Omit<FirestoreDailyUpload, 'id' | 'createdAt'>>,
  isManual: boolean = false
): Promise<void> {
  return withRetry(async () => {
    try {
      const { doc, writeBatch } = await import('firebase/firestore');
      const db = await getFirestoreInstance();
      const uploadRef = doc(db, UPLOADS_COLLECTION, uploadId);
      const batch = writeBatch(db);
      
      const now = new Date().toISOString();
      
      // If manual updates are provided, add them to the batch
      if (manualUpdates) {
        batch.update(uploadRef, {
          ...manualUpdates,
          updatedAt: now,
        });
      }
      
      // Determine approval type
      const approvalType = (manualUpdates as any)?.approvalType || (isManual ? 'manual' as const : 'automatic' as const);
      
      // Add approval update to batch
      batch.update(uploadRef, {
        requiresApproval: false,
        parentAction: 'approved' as const,
        approvedAt: now,
        approvalType,
        updatedAt: now,
      });
      
      logger.log(`Committing batch for upload ${uploadId}`, {
        hasManualUpdates: !!manualUpdates,
        approvalType
      });
      
      // Commit all updates in a single batch write
      await batch.commit();
      
      logger.log(`Successfully approved upload ${uploadId}`);
    } catch (error: any) {
      logger.error('Error batch approving upload:', error);
      if (error.code === 'permission-denied') {
        throw new Error('אין הרשאה לאשר העלאה. אנא בדוק את ההרשאות.');
      }
      if (error.code === 'not-found') {
        throw new Error('ההעלאה לא נמצאה.');
      }
      throw new Error('שגיאה באישור ההעלאה.');
    }
  });
}

/**
 * Approve an upload (simplified version without manual updates)
 * For manual updates, use batchApproveUpload instead
 */
export async function approveUpload(uploadId: string, isManual: boolean = false): Promise<void> {
  return withRetry(async () => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const db = await getFirestoreInstance();
      const uploadRef = doc(db, UPLOADS_COLLECTION, uploadId);
      
      const now = new Date().toISOString();
      const approvalType = isManual ? 'manual' as const : 'automatic' as const;
      
      const updateData = {
        requiresApproval: false,
        parentAction: 'approved' as const,
        approvedAt: now,
        approvalType,
        updatedAt: now,
      };
      
      logger.log(`Approving upload ${uploadId}`, updateData);
      await updateDoc(uploadRef, updateData);
      
      logger.log(`Successfully approved upload ${uploadId}`);
    } catch (error: any) {
      logger.error('Error approving upload:', error);
      if (error.code === 'permission-denied') {
        throw new Error('אין הרשאה לאשר העלאה. אנא בדוק את ההרשאות.');
      }
      if (error.code === 'not-found') {
        throw new Error('ההעלאה לא נמצאה.');
      }
      throw new Error('שגיאה באישור ההעלאה.');
    }
  });
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
    logger.error('Error updating upload:', error);
    throw new Error('שגיאה בעדכון ההעלאה.');
  }
}

