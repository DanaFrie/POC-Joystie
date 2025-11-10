// Types for push notifications and alerts

export type PushNotificationType = 
  | 'upload_success' // פוש סוג 2 - עמידה ביעד
  | 'upload_exceeded' // פוש סוג 3 - אי-עמידה ביעד
  | 'reminder_approval' // פוש סוג 1 - תזכורת לאישור
  | 'missing_report' // פוש תהליך E - חוסר סטטוס

export interface PushNotification {
  id: string;
  type: PushNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  dayDate?: string; // תאריך היום הרלוונטי
  dayName?: string; // שם היום הרלוונטי
}

