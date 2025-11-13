// Notification Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreNotification } from '@/types/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Create a new notification
 */
export async function createNotification(
  notificationData: Omit<FirestoreNotification, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const notificationRef = doc(notificationsRef);
    const now = new Date().toISOString();
    
    const notification: FirestoreNotification = {
      id: notificationRef.id,
      ...notificationData,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(notificationRef, notification);
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('שגיאה ביצירת התראה.');
  }
}

/**
 * Get notification by ID
 */
export async function getNotification(notificationId: string): Promise<FirestoreNotification | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    const notificationSnap = await getDoc(notificationRef);
    
    if (!notificationSnap.exists()) {
      return null;
    }
    
    return notificationSnap.data() as FirestoreNotification;
  } catch (error) {
    console.error('Error getting notification:', error);
    throw new Error('שגיאה בטעינת ההתראה.');
  }
}

/**
 * Get all notifications for a user
 */
export async function getNotifications(
  parentId: string,
  limitCount?: number
): Promise<FirestoreNotification[]> {
  try {
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    let q = query(
      notificationsRef,
      where('parentId', '==', parentId),
      orderBy('timestamp', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as FirestoreNotification);
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw new Error('שגיאה בטעינת ההתראות.');
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(parentId: string): Promise<number> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('parentId', '==', parentId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('שגיאה בסימון ההתראה כנקראה.');
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(parentId: string): Promise<void> {
  try {
    const { collection, query, where, getDocs, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('parentId', '==', parentId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => {
      const notificationRef = doc.ref;
      return updateDoc(notificationRef, {
        read: true,
        updatedAt: new Date().toISOString(),
      });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw new Error('שגיאה בסימון כל ההתראות כנקראות.');
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error('שגיאה במחיקת ההתראה.');
  }
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(parentId: string): Promise<void> {
  try {
    const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(notificationsRef, where('parentId', '==', parentId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw new Error('שגיאה במחיקת כל ההתראות.');
  }
}

