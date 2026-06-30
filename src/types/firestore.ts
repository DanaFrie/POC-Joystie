// Firestore data types - matching the database schema

/** Age, name, gender + daily screen time from parent onboarding (no children collection yet). */
export type UserKidAgeScreenTime = {
  name?: string;
  age: string;
  gender?: 'boy' | 'girl';
  dailyScreenTimeHours: number;
};

export interface FirestoreUser {
  id: string; // Document ID (same as Firebase Auth UID)
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  kidsAges: UserKidAgeScreenTime[];
  termsAccepted: boolean;
  /** When true, parent finished onboarding and can go to dashboard. */
  onboarding?: boolean;
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

// Weekly upload data (single upload per week on redemption day)
export interface WeeklyUpload {
  screenshotUrl: string; // Screenshot URL from Firebase Storage
  uploadedAt: string; // ISO timestamp
  uploadedBy: 'parent' | 'child'; // Who performed the upload
  status: 'pending' | 'approved' | 'rejected'; // Approval status
  // Child's self-assessment before seeing results
  childEstimate?: {
    metGoal: boolean; // Did they think they met the goal?
    estimatedEarnings: number; // How much did they think they earned?
  };
  // OCR processed data
  processedData?: {
    screenTimeMinutes: number; // Total screen time in minutes (sum of all days)
    /** Minutes per day (Hebrew day name -> minutes). From single weekly processing. */
    minutesPerDay?: Record<string, number>;
    apps?: Array<{
      name: string;
      timeUsed: number; // Minutes
      icon?: string;
    }>;
  };
  // Approval/rejection data
  approvedAt?: string; // ISO timestamp
  rejectedAt?: string; // ISO timestamp
  rejectionReason?: string;
  /** Set by image processing when manual review is needed (mismatch, all zero, etc.); reason is logged in service only */
  manualReviewRequired?: boolean;
}

/** One day's upload data – stored inside challenge.weekUploads (no separate collection) */
export interface ChallengeDayUpload {
  date: string; // DD/MM
  dayName: string;
  screenTimeUsed?: number;
  screenTimeMinutes?: number;
  screenTimeGoal?: number;
  coinsEarned?: number;
  coinsMaxPossible?: number;
  success?: boolean;
  screenshotUrl?: string;
  requiresApproval?: boolean;
  parentAction?: 'approved' | null;
  uploadedAt?: string;
  approvedAt?: string;
  apps?: Array<{ name: string; timeUsed: number; icon?: string }>;
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
  startDate?: string; // ISO date - set by admin after consultation approval
  challengeDays: number; // מספר ימי האתגר (6 ימים)
  isActive: boolean;
  consultationCompleted?: boolean; // Whether consultation with advisor has been completed
  /** כל נתוני ההעלאות היומיות של השבוע – בתוך המסמך (ללא אוסף daily_uploads) */
  weekUploads?: ChallengeDayUpload[];
  // Weekly upload (single upload on redemption day)
  weeklyUpload?: WeeklyUpload;
  // Redemption data (set when redemption is completed)
  redemptionAmount?: number; // Final amount redeemed
  redemptionChoice?: 'cash' | 'donation' | 'activity' | 'save'; // Redemption option selected
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
  relatedUploadId?: string; // Optional reference (legacy)
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
