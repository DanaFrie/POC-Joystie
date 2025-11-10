// Utility functions for push notifications
import type { PushNotification, PushNotificationType } from '@/types/notifications';
import type { WeekDay } from '@/types/dashboard';

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

export function saveNotification(notification: PushNotification): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications();
  notifications.unshift(notification);
  localStorage.setItem('parentNotifications', JSON.stringify(notifications));
  
  // Trigger event for UI update
  window.dispatchEvent(new Event('notificationsUpdated'));
}

export function getNotifications(): PushNotification[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('parentNotifications');
  return stored ? JSON.parse(stored) : [];
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem('parentNotifications', JSON.stringify(updated));
  window.dispatchEvent(new Event('notificationsUpdated'));
}

export function removeNotification(id: string): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getNotifications();
  const updated = notifications.filter(n => n.id !== id);
  localStorage.setItem('parentNotifications', JSON.stringify(updated));
  window.dispatchEvent(new Event('notificationsUpdated'));
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

export function clearAllNotifications(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('parentNotifications');
  window.dispatchEvent(new Event('notificationsUpdated'));
}

// Check if goal was met
export function checkGoalMet(day: WeekDay): boolean {
  return day.screenTimeUsed <= day.screenTimeGoal;
}

