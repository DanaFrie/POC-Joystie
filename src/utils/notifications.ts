// Utility functions for push notifications
import type { PushNotification, PushNotificationType } from '@/types/notifications';
import type { WeekDay } from '@/types/dashboard';
import { createNotification, getNotifications as getFirestoreNotifications, markNotificationAsRead as markFirestoreNotificationAsRead, deleteNotification, deleteAllNotifications as deleteAllFirestoreNotifications, getUnreadCount as getFirestoreUnreadCount } from '@/lib/api/notifications';
import type { FirestoreNotification } from '@/types/firestore';

export function createPushNotification(
  type: PushNotificationType,
  childName: string,
  dayDate?: string,
  dayName?: string,
  count?: number,
  childGender: 'boy' | 'girl' = 'boy'
): PushNotification {
  const now = new Date().toISOString();
  
  // Gender pronouns for child
  const childPronouns = {
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', uploaded: 'העלה', stood: 'עמד', child: 'הילד', with: 'איתו' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', uploaded: 'העלתה', stood: 'עמדה', child: 'הילדה', with: 'איתה' }
  };
  const childP = childPronouns[childGender] || childPronouns.boy;
  
  switch (type) {
    case 'upload_success':
      return {
        id: `push-${Date.now()}`,
        type,
        title: 'סטטוס יומי הועלה',
        message: `איזה יופי! ${childName} ${childP.uploaded} את הסטטוס היומי ו${childP.stood} ביעד! 🥳 מזכירים שאתם נדרשים לאשר לפני הסיכום השבועי`,
        timestamp: now,
        read: false,
        dayDate,
        dayName
      };
    
    case 'upload_exceeded':
      return {
        id: `push-${Date.now()}`,
        type,
        title: 'סטטוס יומי חרג מהיעד',
        message: `נראה ש${childName} ${childP.uploaded} נתונים שחורגים מהיעד. זו הזדמנות טובה לבדוק מה קרה.`,
        timestamp: now,
        read: false,
        dayDate,
        dayName
      };
    
    case 'reminder_approval':
      return {
        id: `push-${Date.now()}`,
        type,
        title: 'תזכורת לאישור',
        message: `שמנו לב שיש ${count} ימים שממתינים לאישור שלך. כדאי להיכנס ולעדכן את ${childName} בהתקדמות.`,
        timestamp: now,
        read: false
      };
    
    case 'missing_report':
      return {
        id: `push-${Date.now()}`,
        type,
        title: 'בוקר טוב',
        message: `בוקר טוב. לא התקבל סטטוס מ${childName} עבור ${dayDate || 'אתמול'}. זה טבעי ש${childP.child} יהיה קשה להניח את הטלפון. סביר מאוד הניסיונות הראשונים יהיו לא פשוטים, אולי שווה לדבר ${childP.with} ולחשוב יחד איך מצליחים מחר? טיפ:✨ הציעו ל${childP.child} רעיון לתכלית של החיסכון הכספי לפי מה שאתם מכירים הכי טוב שיכול להתאים ל${childP.him}`,
        timestamp: now,
        read: false,
        dayDate,
        dayName
      };
    
    default:
      return {
        id: `push-${Date.now()}`,
        type,
        title: 'התראה',
        message: '',
        timestamp: now,
        read: false
      };
  }
}

// Convert PushNotification to FirestoreNotification
function pushToFirestore(pushNotif: PushNotification, parentId: string, relatedUploadId?: string): Omit<FirestoreNotification, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    parentId,
    type: pushNotif.type,
    title: pushNotif.title,
    message: pushNotif.message,
    timestamp: pushNotif.timestamp,
    read: pushNotif.read,
    dayDate: pushNotif.dayDate,
    dayName: pushNotif.dayName,
    relatedUploadId
  };
}

// Convert FirestoreNotification to PushNotification
function firestoreToPush(firestoreNotif: FirestoreNotification): PushNotification {
  return {
    id: firestoreNotif.id,
    type: firestoreNotif.type,
    title: firestoreNotif.title,
    message: firestoreNotif.message,
    timestamp: firestoreNotif.timestamp,
    read: firestoreNotif.read,
    dayDate: firestoreNotif.dayDate,
    dayName: firestoreNotif.dayName
  };
}

export async function saveNotification(notification: PushNotification, parentId: string, relatedUploadId?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const firestoreData = pushToFirestore(notification, parentId, relatedUploadId);
    await createNotification(firestoreData);
    
    // Trigger event for UI update
    window.dispatchEvent(new Event('notificationsUpdated'));
  } catch (error) {
    console.error('Error saving notification to Firebase:', error);
    // Fallback: still trigger event even if save fails
    window.dispatchEvent(new Event('notificationsUpdated'));
  }
}

export async function getNotifications(parentId: string): Promise<PushNotification[]> {
  if (typeof window === 'undefined') return [];
  
  try {
    const firestoreNotifications = await getFirestoreNotifications(parentId);
    return firestoreNotifications.map(firestoreToPush);
  } catch (error) {
    console.error('Error getting notifications from Firebase:', error);
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    await markFirestoreNotificationAsRead(id);
    window.dispatchEvent(new Event('notificationsUpdated'));
  } catch (error) {
    console.error('Error marking notification as read in Firebase:', error);
  }
}

export async function removeNotification(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    await deleteNotification(id);
    window.dispatchEvent(new Event('notificationsUpdated'));
  } catch (error) {
    console.error('Error removing notification from Firebase:', error);
  }
}

export async function getUnreadCount(parentId: string): Promise<number> {
  try {
    return await getFirestoreUnreadCount(parentId);
  } catch (error) {
    console.error('Error getting unread count from Firebase:', error);
    return 0;
  }
}

export async function clearAllNotifications(parentId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    await deleteAllFirestoreNotifications(parentId);
    window.dispatchEvent(new Event('notificationsUpdated'));
  } catch (error) {
    console.error('Error clearing all notifications from Firebase:', error);
  }
}

// Check if goal was met
export function checkGoalMet(day: WeekDay): boolean {
  return day.screenTimeUsed <= day.screenTimeGoal;
}

