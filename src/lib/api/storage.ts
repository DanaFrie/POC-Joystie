// Cloud Storage utilities for file uploads
import { getStorageInstance } from '@/lib/firebase';

/**
 * Upload a screenshot to Cloud Storage
 */
export async function uploadScreenshot(
  file: File,
  userId: string,
  challengeId: string,
  date: string
): Promise<{ url: string; path: string }> {
  const storage = await getStorageInstance();
  if (!storage) {
    throw new Error('Cloud Storage is not configured. Please set up Storage in Firebase Console.');
  }

  try {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    // Create storage path: screenshots/{userId}/{challengeId}/{date}/{filename}
    const fileName = `${Date.now()}_${file.name}`;
    const storagePath = `screenshots/${userId}/${challengeId}/${date}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    console.log('[Storage] Starting upload to path:', storagePath);
    
    // Upload file with better error handling
    try {
      await uploadBytes(storageRef, file);
      console.log('[Storage] File uploaded successfully');
    } catch (uploadError: any) {
      console.error('[Storage] Upload error:', uploadError);
      // Check if it's a CORS or permission error
      if (uploadError.code === 'storage/unauthorized' || uploadError.code === 'storage/canceled') {
        throw new Error('אין הרשאה להעלות תמונה. בדוק את ההרשאות.');
      }
      if (uploadError.message?.includes('CORS') || uploadError.message?.includes('cors')) {
        throw new Error('שגיאת CORS בהעלאת התמונה. זה יכול להיות בעיית הגדרות Storage.');
      }
      throw uploadError;
    }

    // Get download URL
    try {
      const url = await getDownloadURL(storageRef);
      console.log('[Storage] Got download URL');
      return {
        url,
        path: storagePath,
      };
    } catch (urlError: any) {
      console.error('[Storage] Error getting download URL:', urlError);
      // If upload succeeded but getting URL failed, still return the path
      // The URL can be generated later
      throw new Error('התמונה הועלתה אבל לא הצלחנו לקבל קישור. זה לא קריטי.');
    }
  } catch (error: any) {
    console.error('[Storage] Error uploading screenshot:', error);
    // Re-throw with more context
    if (error.message) {
      throw error;
    }
    throw new Error('שגיאה בהעלאת התמונה. נסה שוב.');
  }
}

/**
 * Get download URL for a screenshot
 */
export async function getScreenshotUrl(storagePath: string): Promise<string> {
  const storage = await getStorageInstance();
  if (!storage) {
    throw new Error('Cloud Storage is not configured.');
  }

  try {
    const { ref, getDownloadURL } = await import('firebase/storage');
    const storageRef = ref(storage, storagePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting screenshot URL:', error);
    throw new Error('שגיאה בטעינת התמונה.');
  }
}

/**
 * Delete a screenshot from Storage
 */
export async function deleteScreenshot(storagePath: string): Promise<void> {
  const storage = await getStorageInstance();
  if (!storage) {
    throw new Error('Cloud Storage is not configured.');
  }

  try {
    const { ref, deleteObject } = await import('firebase/storage');
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    throw new Error('שגיאה במחיקת התמונה.');
  }
}

