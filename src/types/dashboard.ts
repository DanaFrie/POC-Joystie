export interface Parent {
  name: string;
  id: string;
  googleAuth: any; // Replace with proper Google Auth type
  profilePicture: string;
}

export interface Child {
  name: string;
  id: string;
  profilePicture: string;
  gender?: 'boy' | 'girl';
}

export interface Challenge {
  selectedBudget: number; // תקציב נבחר (100%)
  weeklyBudget: number; // תקציב שבועי (90% מהתקציב הנבחר)
  dailyBudget: number;
  dailyScreenTimeGoal: number;
  penaltyRate: number;
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
  status: 'success' | 'warning' | 'pending' | 'missing' | 'future' | 'redemption' | 'awaiting_approval' | 'rejected';
  coinsEarned: number;
  screenTimeUsed: number;
  screenTimeGoal: number;
  isRedemptionDay: boolean;
  requiresApproval?: boolean; // האם דורש אישור הורה
  uploadedAt?: string; // תאריך ושעה של העלאה
  parentAction?: 'approved' | 'rejected' | null; // פעולה של ההורה
  screenshotUrl?: string; // קישור לצילום מסך שהועלה
  apps?: App[]; // אפליקציות ששימשו באותו יום
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
}




