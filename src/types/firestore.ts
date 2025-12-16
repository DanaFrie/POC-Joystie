// Firestore data types - matching the database schema

export interface FirestoreUser {
  id: string; // Document ID (same as Firebase Auth UID)
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  kidsAges: string[];
  notificationsEnabled: boolean;
  termsAccepted: boolean;
  signupDate: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface FirestoreChild {
  id: string; // Document ID
  parentId: string; // Reference to users collection
  name: string;
  age: string;
  gender: 'boy' | 'girl';
  deviceType: 'ios' | 'android';
  profilePicture?: string;
  nickname?: string;
  moneyGoals?: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface FirestoreChallenge {
  id: string; // Document ID
  parentId: string; // Reference to users collection
  childId: string; // Reference to children collection
  motivationReason?: 'balance' | 'education' | 'communication'; // למה אתם עושים את זה?
  selectedBudget: number; // תקציב נבחר (100%)
  dailyBudget: number; // תקציב יומי
  dailyScreenTimeGoal: number; // שעות זמן מסך יומי
  weekNumber: number;
  totalWeeks: number;
  startDate: string; // ISO date
  challengeDays: number; // מספר ימי האתגר (6 ימים)
  redemptionDay: 'saturday' | string; // יום פדיון
  isActive: boolean;
  // Redemption data (set when redemption is completed)
  redemptionAmount?: number; // Final amount redeemed
  redemptionChoice?: 'cash' | 'gift' | 'activity' | 'save'; // Redemption option selected
  redeemedAt?: string; // ISO timestamp when redemption was completed
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface FirestoreDailyUpload {
  id: string; // Document ID
  challengeId: string; // Reference to challenges collection
  parentId: string; // Reference to users collection
  childId: string; // Reference to children collection
  date: string; // Format: "DD/MM"
  dayName: string; // Hebrew day name
  screenTimeUsed: number; // שעות
  screenTimeMinutes?: number; // דקות זמן מסך (לצורך הצגה והכנסה ידנית)
  screenTimeGoal: number; // שעות
  coinsEarned: number; // שקלים
  coinsMaxPossible: number; // שקלים
  success: boolean; // האם עמד ביעד
  screenshotUrl?: string; // Screenshot URL (data URL or external URL)
  requiresApproval: boolean;
  parentAction?: 'approved' | null;
  uploadedAt: string; // ISO timestamp
  approvedAt?: string; // ISO timestamp
  apps?: Array<{
    name: string;
    timeUsed: number;
    icon?: string;
  }>;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface FirestoreNotification {
  id: string; // Document ID
  parentId: string; // Reference to users collection
  type: 'upload_success' | 'upload_exceeded' | 'reminder_approval' | 'missing_report';
  title: string;
  message: string;
  timestamp: string; // ISO timestamp
  read: boolean;
  dayDate?: string; // Format: "DD/MM"
  dayName?: string; // Hebrew day name
  relatedUploadId?: string; // Reference to daily_uploads collection
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface FirestoreSession {
  id: string; // Document ID
  userId: string; // Reference to users collection (Firebase Auth UID)
  loginTime: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  lastActivity: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

