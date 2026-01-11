// Firestore types for Firebase Functions
// These match the types in src/types/firestore.ts

export interface FirestoreUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  kidsAges: string[];
  notificationsEnabled: boolean;
  termsAccepted: boolean;
  signupDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreChild {
  id: string;
  parentId: string;
  name: string;
  age: string;
  gender: 'boy' | 'girl';
  deviceType: 'ios' | 'android';
  profilePicture?: string;
  nickname?: string;
  moneyGoals?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreChallenge {
  id: string;
  parentId: string;
  childId: string;
  motivationReason?: 'balance' | 'education' | 'communication';
  selectedBudget: number;
  dailyBudget: number;
  dailyScreenTimeGoal: number;
  weekNumber: number;
  totalWeeks: number;
  startDate: string;
  challengeDays: number;
  isActive: boolean;
  redemptionAmount?: number;
  redemptionChoice?: 'cash' | 'donation' | 'activity' | 'save';
  redeemedAt?: string;
  createdAt: string;
  updatedAt: string;
  notificationsSent?: {
    first_day?: boolean;
    first_upload_success?: boolean;
    first_upload_failure?: boolean;
    two_pending?: boolean;
    missing_upload?: boolean;
  };
}

export interface FirestoreDailyUpload {
  id: string;
  challengeId: string;
  parentId: string;
  childId: string;
  date: string;
  dayName: string;
  screenTimeUsed: number;
  screenTimeMinutes?: number;
  screenTimeGoal: number;
  coinsEarned: number;
  coinsMaxPossible: number;
  success: boolean;
  screenshotUrl?: string;
  requiresApproval: boolean;
  parentAction?: 'approved' | null;
  uploadedAt: string;
  approvedAt?: string;
  apps?: Array<{
    name: string;
    timeUsed: number;
    icon?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

