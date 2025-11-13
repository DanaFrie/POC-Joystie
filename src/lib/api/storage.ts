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

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const url = await getDownloadURL(storageRef);

    return {
      url,
      path: storagePath,
    };
  } catch (error) {
    console.error('Error uploading screenshot:', error);
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

