// Dashboard Data API
import { getActiveChallenge } from './challenges';
import { getUploadsByChallenge, getPendingApprovals } from './uploads';
import { getNotifications } from './notifications';
import { getUser } from './users';
import { getChild } from './children';
import type { DashboardState, WeekDay, Today } from '@/types/dashboard';
import type { FirestoreChallenge, FirestoreDailyUpload } from '@/types/firestore';

/**
 * Helper: Get Hebrew day name from date
 */
function getHebrewDayName(date: Date): string {
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return dayNames[date.getDay()];
}

/**
 * Helper: Get Hebrew day abbreviation
 */
function getHebrewDayAbbreviation(dayName: string): string {
  const dayMap: { [key: string]: string } = {
    'ראשון': 'א׳',
    'שני': 'ב׳',
    'שלישי': 'ג׳',
    'רביעי': 'ד׳',
    'חמישי': 'ה׳',
    'שישי': 'ו׳',
    'שבת': 'ש׳'
  };
  return dayMap[dayName] || dayName;
}

/**
 * Helper: Parse date string (DD/MM format) to Date object
 */
function parseDate(dateStr: string, year?: number): Date {
  const [day, month] = dateStr.split('/').map(Number);
  const currentYear = year || new Date().getFullYear();
  return new Date(currentYear, month - 1, day);
}

/**
 * Helper: Format date as DD/MM
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Helper: Map upload status to WeekDay status
 */
function getUploadStatus(
  upload: FirestoreDailyUpload | null,
  isFuture: boolean,
  isRedemptionDay: boolean
): WeekDay['status'] {
  if (isRedemptionDay) return 'redemption';
  if (isFuture) return 'future';
  if (!upload) return 'missing';
  
  if (upload.requiresApproval && !upload.parentAction) {
    return 'awaiting_approval';
  }
  
  if (upload.parentAction === 'rejected') {
    return 'rejected';
  }
  
  if (upload.parentAction === 'approved' || !upload.requiresApproval) {
    return upload.success ? 'success' : 'warning';
  }
  
  return 'pending';
}

/**
 * Helper: Generate week array from challenge start date and uploads
 */
function generateWeek(
  challenge: FirestoreChallenge,
  uploads: FirestoreDailyUpload[]
): WeekDay[] {
  const startDate = new Date(challenge.startDate);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const week: WeekDay[] = [];
  
  // Find the start of the challenge week (Sunday)
  const challengeStartDay = startDate.getDay(); // 0 = Sunday
  const challengeSunday = new Date(startDate);
  challengeSunday.setDate(startDate.getDate() - challengeStartDay);
  
  // Generate 7 days starting from challenge Sunday
  // Always generate the week, even if challenge hasn't started yet
  for (let i = 0; i < 7; i++) {
    const day = new Date(challengeSunday);
    day.setDate(challengeSunday.getDate() + i);
    
    const dateStr = formatDate(day);
    const dayName = getHebrewDayName(day);
    const dayAbbr = getHebrewDayAbbreviation(dayName);
    const isFuture = day > today;
    const isRedemptionDay = challenge.redemptionDay === 'saturday' 
      ? i === 6 
      : dayName === challenge.redemptionDay;
    
    // Find matching upload
    const upload = uploads.find(u => u.date === dateStr);
    
    // Calculate coins
    const hourlyRate = challenge.dailyScreenTimeGoal > 0 
      ? challenge.dailyBudget / challenge.dailyScreenTimeGoal 
      : 0;
    
    const screenTimeUsed = upload?.screenTimeUsed || 0;
    const screenTimeGoal = challenge.dailyScreenTimeGoal;
    const coinsEarned = upload?.coinsEarned || 0;
    
    // If challenge hasn't started yet, all days should be 'future'
    const challengeNotStarted = today < startDate;
    const status = challengeNotStarted 
      ? 'future' 
      : getUploadStatus(upload, isFuture, isRedemptionDay);
    
    week.push({
      dayName: dayAbbr,
      date: dateStr,
      status,
      coinsEarned,
      screenTimeUsed,
      screenTimeGoal,
      isRedemptionDay,
      requiresApproval: upload?.requiresApproval || false,
      uploadedAt: upload?.uploadedAt,
      parentAction: upload?.parentAction || null,
      screenshotUrl: upload?.screenshotUrl,
      apps: upload?.apps || []
    });
  }
  
  return week;
}

/**
 * Helper: Calculate weekly totals
 */
function calculateWeeklyTotals(
  week: WeekDay[],
  challenge: FirestoreChallenge
): { coinsEarned: number; coinsMaxPossible: number; redemptionDate: string; redemptionDay: string } {
  const coinsEarned = week.reduce((sum, day) => sum + day.coinsEarned, 0);
  const coinsMaxPossible = challenge.dailyBudget * 7; // Max possible for 7 days
  
  // Find redemption day
  const redemptionDay = week.find(day => day.isRedemptionDay);
  const redemptionDate = redemptionDay?.date || '';
  const redemptionDayName = redemptionDay?.dayName || '';
  
  return {
    coinsEarned,
    coinsMaxPossible,
    redemptionDate,
    redemptionDay: redemptionDayName
  };
}

/**
 * Helper: Build Today object
 */
function buildToday(
  week: WeekDay[],
  challenge: FirestoreChallenge
): Today {
  const today = new Date();
  const todayDateStr = formatDate(today);
  
  // Find today's day in the week array
  let todayDay = week.find(day => day.date === todayDateStr);
  
  // If not found, try to find by day index (fallback)
  if (!todayDay && week.length > 0) {
    const dayIndex = today.getDay();
    todayDay = week[dayIndex] || week[0]; // Fallback to first day if index doesn't exist
  }
  
  // If still no day found, create a default one
  if (!todayDay) {
    todayDay = {
      dayName: getHebrewDayAbbreviation(getHebrewDayName(today)),
      date: todayDateStr,
      status: 'pending',
      coinsEarned: 0,
      screenTimeUsed: 0,
      screenTimeGoal: challenge.dailyScreenTimeGoal,
      isRedemptionDay: false,
      requiresApproval: false
    };
  }
  
  // Determine screenshot status
  let screenshotStatus: Today['screenshotStatus'] = 'pending';
  if (todayDay.status === 'uploaded' || todayDay.status === 'success' || todayDay.status === 'warning') {
    screenshotStatus = 'uploaded';
  } else if (todayDay.status === 'awaiting_approval') {
    screenshotStatus = 'uploaded';
  } else if (todayDay.status === 'missing') {
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    if (new Date() > endOfDay) {
      screenshotStatus = 'overdue';
    } else {
      screenshotStatus = 'missing';
    }
  }
  
  const hourlyRate = challenge.dailyScreenTimeGoal > 0 
    ? challenge.dailyBudget / challenge.dailyScreenTimeGoal 
    : 0;
  
  return {
    date: todayDateStr,
    hebrewDate: '', // TODO: Calculate Hebrew date if needed
    screenshotStatus,
    screenTimeUsed: todayDay.screenTimeUsed || 0,
    screenTimeGoal: todayDay.screenTimeGoal || challenge.dailyScreenTimeGoal,
    coinsEarned: todayDay.coinsEarned || 0,
    coinsMaxPossible: challenge.dailyBudget,
    requiresApproval: todayDay.requiresApproval || false,
    uploadedAt: todayDay.uploadedAt || new Date().toISOString(),
    apps: todayDay.apps || []
  };
}

/**
 * Get complete dashboard data for a user
 */
export async function getDashboardData(parentId: string): Promise<DashboardState | null> {
  try {
    console.log('[Dashboard] Loading data for user:', parentId);
    
    // Get user data
    const user = await getUser(parentId);
    if (!user) {
      console.warn('[Dashboard] User not found in Firestore:', parentId);
      return null;
    }
    console.log('[Dashboard] User found:', user.username);

    // Get active challenge
    const challenge = await getActiveChallenge(parentId);
    if (!challenge) {
      // No active challenge - return null
      console.warn('[Dashboard] No active challenge found for user:', parentId);
      return null;
    }
    console.log('[Dashboard] Active challenge found:', challenge.id);

    // Get child data
    const child = await getChild(challenge.childId);
    if (!child) {
      throw new Error('Child not found for challenge');
    }
    
    // Get uploads for current week (include parentId for security rules)
    const uploads = await getUploadsByChallenge(challenge.id, parentId);
    
    // Check if challenge hasn't started yet
    const startDate = new Date(challenge.startDate);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const challengeNotStarted = today < startDate;
    
    // Generate week array (empty if challenge hasn't started)
    const week = challengeNotStarted ? [] : generateWeek(challenge, uploads);
    
    // Calculate weekly totals
    const weeklyTotals = calculateWeeklyTotals(week, challenge);
    
    // Build today object
    const todayObj = buildToday(week, challenge);
    
    // Map FirestoreChallenge to Challenge
    // Calculate weeklyBudget from selectedBudget (equal to selectedBudget)
    const weeklyBudget = challenge.selectedBudget;
    const challengeData = {
      selectedBudget: challenge.selectedBudget,
      weeklyBudget: weeklyBudget,
      dailyBudget: challenge.dailyBudget,
      dailyScreenTimeGoal: challenge.dailyScreenTimeGoal,
      weekNumber: challenge.weekNumber,
      totalWeeks: challenge.totalWeeks,
      startDate: challenge.startDate,
      isActive: challenge.isActive
    };
    
    // Build dashboard state
    const dashboardState: DashboardState = {
      parent: {
        name: user.firstName || user.username || 'הורה',
        id: user.id,
        googleAuth: {}, // TODO: Add if needed
        profilePicture: '' // TODO: Add if available
      },
      child: {
        name: child.name,
        id: child.id,
        profilePicture: child.profilePicture || '',
        gender: child.gender
      },
      challenge: challengeData,
      today: todayObj,
      week,
      weeklyTotals,
      challengeNotStarted: challengeNotStarted,
      challengeStartDate: challenge.startDate
    };
    
    return dashboardState;
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw new Error('שגיאה בטעינת נתוני הדשבורד.');
  }
}

/**
 * Get weekly data for a challenge
 */
export async function getWeekData(challengeId: string, parentId?: string): Promise<FirestoreDailyUpload[]> {
  try {
    return await getUploadsByChallenge(challengeId, parentId);
  } catch (error) {
    console.error('Error getting week data:', error);
    throw new Error('שגיאה בטעינת נתוני השבוע.');
  }
}

/**
 * Get today's upload data
 */
export async function getTodayData(
  challengeId: string,
  date: string
): Promise<FirestoreDailyUpload | null> {
  try {
    const { getUploadByDate } = await import('./uploads');
    return await getUploadByDate(challengeId, date);
  } catch (error) {
    console.error('Error getting today data:', error);
    throw new Error('שגיאה בטעינת נתוני היום.');
  }
}

// Re-export for convenience
export { getUploadByDate } from './uploads';

