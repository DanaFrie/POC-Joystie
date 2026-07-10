// Firestore data types - matching the database schema

/** Age, name, gender + daily screen time from parent onboarding (no children collection yet). */
export type UserKidAgeScreenTime = {
  name?: string;
  age: string;
  gender?: 'boy' | 'girl';
  dailyScreenTimeHours: number;
};

export type SubscriptionStatus =
  | 'freemium'
  | 'checkout_pending'
  | 'trialing'
  | 'payment_failed'
  | 'active'
  | 'canceled';

export type FirestoreUserSubscription = {
  provider: 'cardcom' | 'none';
  status: SubscriptionStatus;
  plan?: 'annual' | 'monthly';
  trialEndsAt?: string;
  lowProfileId?: string;
  returnValue?: string;
  cardcomVerifiedAt?: string;
  /** True after webhook stored token in `billing_tokens/{uid}` (server-only). */
  hasStoredToken?: boolean;
  /** Last 4 digits for UI — not the charge token. */
  cardLast4?: string;
  lastError?: string;
  updatedAt?: string;
};

/** Server-only — written by `cardcomWebhook`; use Admin SDK / Cloud Functions to charge. */
export type FirestoreBillingToken = {
  provider: 'cardcom';
  token: string;
  tokenExDate?: string;
  cardMonth?: number;
  cardYear?: number;
  tokenApprovalNumber?: string;
  last4?: string;
  lowProfileId?: string;
  createdAt?: string;
  updatedAt?: string;
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
  /** Cardcom trial / subscription — set after payment gate. */
  subscription?: FirestoreUserSubscription;
  /** Unlocks challenge flows for parent + child after successful trial checkout. */
  challengeUnlocked?: boolean;
  /** Selected / created child after onboarding completion. */
  primaryChildId?: string;
  /** Latest bonding invite id (Firestore `bonding_invites`). */
  bondingInviteId?: string;
}

export interface FirestoreChild {
  id: string; // Document ID
  parentId: string; // Reference to users collection
  name: string;
  age: string;
  gender: 'boy' | 'girl';
  /** Legacy v0.2 — omit on v0.3 create. */
  deviceType?: 'ios' | 'android';
  profilePicture?: string;
  nickname?: string;
  /** @deprecated Prefer challenge.moneyGoals — kept for legacy child-accept flows. */
  moneyGoals?: string[];
  /** Behavior changes from onboarding (1–2). */
  changes?: string[];
  /**
   * Per-change day checkmarks (7 days, Sun→Sat).
   * Stored as `{ days: boolean[] }[]` — Firestore rejects nested arrays.
   */
  changeDayChecks?: Array<{ days: boolean[] }>;
  /** Onboarding slider assumption — daily screen minutes for dashboard baseline. */
  baselineDailyMinutes?: number;
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
  motivationReason?: 'balance' | 'education' | 'communication';
  selectedBudget: number;
  /** @deprecated v0.3 — not written on new challenges. */
  dailyBudget?: number;
  /** @deprecated v0.3 — not written on new challenges. */
  dailyScreenTimeGoal?: number;
  /** v0.3 — ₪ per screen hour (loss-aversion rate). */
  hourlyRate?: number;
  /** Child money goals for this weekly deal (can change week to week). */
  moneyGoals?: string[];
  weekNumber: number;
  /** @deprecated v0.3 — not written on new challenges. */
  totalWeeks?: number;
  startDate?: string;
  challengeDays: number; // 6
  isActive: boolean;
  weekUploads?: ChallengeDayUpload[];
  /** Results — weekly OCR / settlement upload. */
  weeklyUpload?: WeeklyUpload;
  /** Redemption — set when week is settled. */
  redemptionAmount?: number;
  redemptionChoice?: 'cash' | 'donation' | 'activity' | 'save';
  redeemedAt?: string;
  createdAt: string;
  updatedAt: string;
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
