export interface Parent {
  name: string;
  id: string;
  googleAuth: any; // Replace with proper Google Auth type
  profilePicture: string;
  gender?: 'male' | 'female';
}

export interface Child {
  name: string;
  id: string;
  profilePicture: string;
  gender?: 'boy' | 'girl';
  nickname?: string;
  moneyGoals?: string[];
}

export interface Challenge {
  selectedBudget: number; // תקציב נבחר
  weeklyBudget: number; // תקציב שבועי (שווה לתקציב הנבחר)
  dailyBudget: number;
  dailyScreenTimeGoal: number;
  weekNumber: number;
  totalWeeks: number;
  startDate: string;
  isActive: boolean;
}

export interface App {
  name: string;
  timeUsed: number;
  icon: string;
}

export interface Today {
  date: string;
  hebrewDate: string;
  screenshotStatus: 'pending' | 'uploaded' | 'approved' | 'overdue' | 'missing';
  screenTimeUsed: number;
  screenTimeGoal: number;
  coinsEarned: number;
  coinsMaxPossible: number;
  requiresApproval: boolean;
  uploadedAt: string;
  apps: App[];
}

export interface WeekDay {
  dayName: string;
  date: string;
  status: 'success' | 'warning' | 'missing' | 'future' | 'redemption' | 'awaiting_approval';
  coinsEarned: number;
  screenTimeUsed: number;
  screenTimeGoal: number;
  isRedemptionDay: boolean;
  requiresApproval?: boolean; // האם דורש אישור הורה
  uploadedAt?: string; // תאריך ושעה של העלאה
  parentAction?: 'approved' | null; // פעולה של ההורה
  screenTimeMinutes?: number; // דקות זמן מסך (לצורך הצגה והכנסה ידנית)
  screenshotUrl?: string; // קישור לצילום מסך שהועלה
  apps?: App[]; // אפליקציות ששימשו באותו יום
  approvalType?: 'manual' | 'automatic'; // האם האישור היה ידני או אוטומטי
}

export interface WeeklyTotals {
  coinsEarned: number;
  coinsMaxPossible: number;
  redemptionDate: string;
  redemptionDay: string;
}

export interface DashboardState {
  parent: Parent;
  child: Child;
  challenge: Challenge;
  today: Today;
  week: WeekDay[];
  weeklyTotals: WeeklyTotals;
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
}




