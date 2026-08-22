// Dashboard Data API
import { getActiveChallenge, getLatestChallenge } from './challenges';
import { getUploadsByChallenge } from './uploads';
import { getUser } from './users';
import { getChild, ensureChildForParent } from './children';
import { changeDayChecksToMatrix } from '@/lib/onboarding/changeDayChecks';
import { defaultSelfieAssetForChild } from '@/lib/onboarding/defaultSelfieAsset';
import { avgMinutesFromWeeklyScreenTime } from '@/lib/dashboard/parentDailyAverage';
import type { DashboardState, WeekDay, Today, Challenge } from '@/types/dashboard';
import type { FirestoreChallenge, FirestoreChild, FirestoreDailyUpload } from '@/types/firestore';
import { dataCache, cacheKeys, cacheTTL } from '@/utils/data-cache';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Dashboard');

const DASHBOARD_PREFETCH_KEY = 'joystieDashboardPrefetch';
const DASHBOARD_PREFETCH_TTL_MS = 60 * 1000;

function normalizeParentGender(gender: unknown): 'male' | 'female' | undefined {
  if (gender === 'female' || gender === 'male') return gender;
  if (gender === 'mother' || gender === 'אמא') return 'female';
  if (gender === 'father' || gender === 'אבא') return 'male';
  return undefined;
}

function dropSessionPrefetch(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DASHBOARD_PREFETCH_KEY);
  } catch {
    // quota / private mode
  }
}

export function clearPrefetchedDashboard(): void {
  dropSessionPrefetch();
}

function rememberDashboardState(parentId: string, data: DashboardState): void {
  dataCache.set(cacheKeys.dashboard(parentId), data, cacheTTL.dashboard);
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      DASHBOARD_PREFETCH_KEY,
      JSON.stringify({ uid: parentId, data, at: Date.now() })
    );
  } catch {
    // quota / private mode
  }
}

/** Memory + session snapshot from login/onboarding prefetch. One-shot session copy. */
export function readPrefetchedDashboard(parentId: string): DashboardState | null {
  if (typeof window === 'undefined' || !parentId) return null;
  const mem = dataCache.get<DashboardState>(cacheKeys.dashboard(parentId));
  if (mem) {
    dropSessionPrefetch();
    return mem;
  }
  try {
    const raw = sessionStorage.getItem(DASHBOARD_PREFETCH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { uid?: string; data?: DashboardState; at?: number };
    dropSessionPrefetch();
    if (parsed.uid !== parentId || !parsed.data) return null;
    if (!parsed.at || Date.now() - parsed.at > DASHBOARD_PREFETCH_TTL_MS) return null;
    dataCache.set(cacheKeys.dashboard(parentId), parsed.data, cacheTTL.dashboard);
    return parsed.data;
  } catch {
    return null;
  }
}

function resolveChildShareCardFields(child: FirestoreChild): {
  shareCardUrl: string | null;
  shareCardSource: 'ai' | 'default' | null;
  shareCardStored: boolean;
} {
  const card = child.shareCard;
  if (!card) {
    return { shareCardUrl: null, shareCardSource: null, shareCardStored: false };
  }
  // Never expose permanent Storage downloadUrl — access is via getChildShareCardAccess.
  if (card.storagePath) {
    return {
      shareCardUrl: null,
      shareCardSource: card.source ?? null,
      shareCardStored: true,
    };
  }
  if (card.source === 'default') {
    return {
      shareCardUrl: defaultSelfieAssetForChild(child.gender),
      shareCardSource: 'default',
      shareCardStored: false,
    };
  }
  return { shareCardUrl: null, shareCardSource: card.source ?? null, shareCardStored: false };
}

function challengeDailyBudget(challenge: FirestoreChallenge): number {
  if (challenge.dailyBudget != null) return challenge.dailyBudget;
  if (challenge.selectedBudget && challenge.challengeDays) {
    return challenge.selectedBudget / challenge.challengeDays;
  }
  return 0;
}

function challengeDailyGoalHours(challenge: FirestoreChallenge): number {
  return challenge.dailyScreenTimeGoal ?? 0;
}

/**
 * Helper: Transform FirestoreChallenge to Challenge type (adds weeklyBudget)
 */
function transformChallenge(firestoreChallenge: FirestoreChallenge): Challenge {
  return {
    selectedBudget: firestoreChallenge.selectedBudget,
    weeklyBudget: firestoreChallenge.selectedBudget,
    dailyBudget: firestoreChallenge.dailyBudget,
    dailyScreenTimeGoal: firestoreChallenge.dailyScreenTimeGoal,
    hourlyRate: firestoreChallenge.hourlyRate,
    moneyGoals: firestoreChallenge.moneyGoals,
    weekNumber: firestoreChallenge.weekNumber,
    totalWeeks: firestoreChallenge.totalWeeks,
    startDate: firestoreChallenge.startDate,
    challengeDays: firestoreChallenge.challengeDays,
    isActive: firestoreChallenge.isActive,
  };
}

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
  
  // Check if approval is required and not yet approved
  // Note: After approval, requiresApproval is set to false, so this check handles pending approvals
  if (upload.requiresApproval && (!upload.parentAction || upload.parentAction === null)) {
    return 'awaiting_approval';
  }
  
  // If approved, show success/warning based on goal achievement
  if (upload.parentAction === 'approved') {
    return upload.success ? 'success' : 'warning';
  }
  
  // If doesn't require approval
  // parentAction can be null/undefined/approved, all are OK if requiresApproval is false
  if (!upload.requiresApproval) {
    return upload.success ? 'success' : 'warning';
  }
  
  // This should not be reached, but if it is, treat as missing
  return 'missing';
}

/**
 * Helper: Generate week array from challenge start date and uploads
 */
function generateWeek(
  challenge: FirestoreChallenge,
  uploads: FirestoreDailyUpload[]
): WeekDay[] {
  if (!challenge.startDate) {
    // Challenge not started yet - return empty week
    return [];
  }
  
  const startDate = new Date(challenge.startDate);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const week: WeekDay[] = [];
  
  // Generate challengeDays + 1 days (challenge days + redemption day) starting from challenge start date
  // Always generate the week, even if challenge hasn't started yet
  const totalDays = challenge.challengeDays + 1; // challenge days + redemption day
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    
    const dateStr = formatDate(day);
    const dayName = getHebrewDayName(day);
    const dayAbbr = getHebrewDayAbbreviation(dayName);
    // Day is considered "future" if it's today or later (not yet passed)
    // Only days that have already passed can be "missing"
    const isFuture = day >= today;
    // Redemption day is the day after challenge days (index challengeDays)
    const isRedemptionDay = i === challenge.challengeDays;
    
    // Find matching upload
    const matchingUploads = uploads.filter(u => u.date === dateStr);
    const upload = matchingUploads.length > 0 ? matchingUploads[0] : null;
    
    if (matchingUploads.length > 1) {
      logger.warn(`Multiple uploads found for date ${dateStr}:`, matchingUploads.map(u => ({
        id: u.id,
        date: u.date,
        requiresApproval: u.requiresApproval,
        parentAction: u.parentAction,
        uploadedAt: u.uploadedAt
      })));
    }

    // Calculate coins
    const dailyGoalHours = challengeDailyGoalHours(challenge);
    const dailyBudget = challengeDailyBudget(challenge);
    const hourlyRate = dailyGoalHours > 0 
      ? dailyBudget / dailyGoalHours 
      : 0;
    
    let screenTimeUsed = upload?.screenTimeUsed || 0;
    const screenTimeGoal = dailyGoalHours;
    let coinsEarned = upload?.coinsEarned || 0;
    let requiresApproval = upload?.requiresApproval || false;

    // Single source: when weeklyUpload has minutesPerDay, use it for this day (no weekUploads mix)
    const weeklyUpload = challenge.weeklyUpload;
    const minutesPerDay = weeklyUpload?.processedData?.minutesPerDay;
    let status: WeekDay['status'];
    const useWeeklyOnly = minutesPerDay && !isFuture && !isRedemptionDay;
    if (useWeeklyOnly) {
      const mins = minutesPerDay[dayName];
      if (mins != null) {
        screenTimeUsed = mins / 60;
        const goalMinutes = dailyGoalHours * 60;
        const success = mins <= goalMinutes;
        coinsEarned = success ? dailyBudget : Math.max(0, dailyBudget * (1 - (mins - goalMinutes) / goalMinutes));
        if (weeklyUpload.status === 'approved') {
          status = success ? 'success' : 'warning';
          requiresApproval = false;
        } else if (weeklyUpload.status === 'pending') {
          status = 'awaiting_approval';
          requiresApproval = true;
        } else {
          status = 'missing';
          requiresApproval = false;
        }
      } else {
        const challengeNotStarted = today < startDate;
        status = challengeNotStarted ? 'future' : getUploadStatus(upload, isFuture, isRedemptionDay);
      }
    } else {
      const challengeNotStarted = today < startDate;
      status = challengeNotStarted 
        ? 'future' 
        : getUploadStatus(upload, isFuture, isRedemptionDay);
    }
    
    week.push({
      dayName: dayAbbr,
      date: dateStr,
      status,
      coinsEarned,
      screenTimeUsed,
      screenTimeGoal,
      isRedemptionDay,
      requiresApproval,
      uploadedAt: upload?.uploadedAt,
      parentAction: upload?.parentAction ?? null,
      screenshotUrl: upload?.screenshotUrl,
      screenTimeMinutes: (upload as any)?.screenTimeMinutes ?? (screenTimeUsed * 60),
      apps: (upload?.apps || []).filter((app): app is { name: string; timeUsed: number; icon: string } => app.icon !== undefined).map(app => ({ name: app.name, timeUsed: app.timeUsed, icon: app.icon! })),
      approvalType: (upload as any)?.approvalType
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
  const dailyBudget = challengeDailyBudget(challenge);
  const coinsMaxPossible = dailyBudget * challenge.challengeDays;
  
  // Get approved non-redemption days
  const nonRedemptionDays = week.filter(day => !day.isRedemptionDay);
  const approvedDays = nonRedemptionDays.filter(day => 
    day.parentAction === 'approved' || !day.requiresApproval
  );
  
  // Calculate accurate total based on original data (before rounding)
  // This fixes rounding errors from daily values
  let accurateTotal = 0;
  for (const day of approvedDays) {
    const screenTimeUsed = day.screenTimeUsed || 0;
    const screenTimeGoal = day.screenTimeGoal || 0;
    
    // Calculate coins earned using the same formula as in upload page
    // If goal met: full daily budget
    // If not met: proportional reduction
    const success = screenTimeUsed <= screenTimeGoal;
    const coinsEarned = success 
      ? dailyBudget 
      : Math.max(0, dailyBudget * (1 - (screenTimeUsed - screenTimeGoal) / screenTimeGoal));
    
    accurateTotal += coinsEarned;
  }
  
  // Round the final total to 1 decimal place (not individual daily values)
  const coinsEarned = Math.round(accurateTotal * 10) / 10;
  
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
      status: 'future', // Today hasn't passed yet, so it's future
      coinsEarned: 0,
      screenTimeUsed: 0,
      screenTimeGoal: challengeDailyGoalHours(challenge),
      isRedemptionDay: false,
      requiresApproval: false
    };
  }

  const day = todayDay;
  
  // Determine screenshot status
  let screenshotStatus: Today['screenshotStatus'] = 'pending';
  if (day.status === 'success' || day.status === 'warning') {
    screenshotStatus = 'uploaded';
  } else if (day.status === 'awaiting_approval') {
    screenshotStatus = 'uploaded';
  } else if (day.status === 'future') {
    // Today or future day - still pending (day hasn't passed yet)
    screenshotStatus = 'pending';
  } else if (day.status === 'missing') {
    // Day has passed but no upload - missing or overdue
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    if (new Date() > endOfDay) {
      screenshotStatus = 'overdue';
    } else {
      screenshotStatus = 'missing';
    }
  }
  
  const dailyGoalHours = challengeDailyGoalHours(challenge);
  const dailyBudget = challengeDailyBudget(challenge);
  const hourlyRate = dailyGoalHours > 0 
    ? dailyBudget / dailyGoalHours 
    : 0;
  
  return {
    date: todayDateStr,
    hebrewDate: '', // TODO: Calculate Hebrew date if needed
    screenshotStatus,
    screenTimeUsed: day.screenTimeUsed || 0,
    screenTimeGoal: day.screenTimeGoal || dailyGoalHours,
    coinsEarned: day.coinsEarned || 0,
    coinsMaxPossible: dailyBudget,
    requiresApproval: day.requiresApproval || false,
    uploadedAt: day.uploadedAt || new Date().toISOString(),
    apps: day.apps || []
  };
}

/**
 * Merge weekly upload per-day data into the week array (for real-time updates).
 * When the dashboard has stale week from cache but fresh weeklyUpload from listener, this fills the bars.
 */
export function mergeWeekWithWeeklyUpload(
  week: WeekDay[],
  weeklyUpload: { processedData?: { minutesPerDay?: Record<string, number> }; status: string },
  challenge: FirestoreChallenge
): WeekDay[] {
  const minutesPerDay = weeklyUpload?.processedData?.minutesPerDay;
  if (!minutesPerDay || week.length === 0) return week;

  const dailyBudget = challengeDailyBudget(challenge);
  const goalMinutes = challengeDailyGoalHours(challenge) * 60;

  const hebrewToEn: Record<string, string> = {
    ראשון: 'Sunday', שני: 'Monday', שלישי: 'Tuesday', רביעי: 'Wednesday',
    חמישי: 'Thursday', שישי: 'Friday', שבת: 'Saturday',
  };

  return week.map((day) => {
    if (day.isRedemptionDay) return day;
    const date = parseDate(day.date);
    const dayName = getHebrewDayName(date);
    const mins = minutesPerDay[dayName] ?? minutesPerDay[hebrewToEn[dayName]];
    if (mins == null) return day;

    const screenTimeUsed = mins / 60;
    const success = mins <= goalMinutes;
    const coinsEarned = success
      ? dailyBudget
      : Math.max(0, dailyBudget * (1 - (mins - goalMinutes) / goalMinutes));
    let status: WeekDay['status'] =
      weeklyUpload.status === 'approved'
        ? success
          ? 'success'
          : 'warning'
        : weeklyUpload.status === 'pending'
        ? 'awaiting_approval'
        : 'missing';

    return {
      ...day,
      screenTimeUsed,
      coinsEarned,
      status,
      requiresApproval: weeklyUpload.status === 'pending',
    };
  });
}

function buildBootstrapDashboardState(
  user: import('@/types/firestore').FirestoreUser,
  child: import('@/types/firestore').FirestoreChild
): DashboardState {
  return {
    parent: {
      name: user.firstName || 'הורה',
      id: user.id,
      googleAuth: {},
      profilePicture: '',
      gender: normalizeParentGender(user.gender),
    },
    child: {
      name: child.name,
      id: child.id,
      profilePicture: child.profilePicture || '',
      gender: child.gender,
      nickname: child.nickname,
      changes: child.changes,
      changeDayChecks: changeDayChecksToMatrix(child.changeDayChecks),
      baselineDailyMinutes: child.baselineDailyMinutes,
      ...resolveChildShareCardFields(child),
    },
    challenge: {
      selectedBudget: 0,
      weeklyBudget: 0,
      weekNumber: 0,
      startDate: '',
      isActive: false,
      challengeDays: 6,
    },
    today: {
      date: '',
      hebrewDate: '',
      screenshotStatus: 'pending',
      screenTimeUsed: 0,
      screenTimeGoal: 0,
      coinsEarned: 0,
      coinsMaxPossible: 0,
      requiresApproval: false,
      uploadedAt: '',
      apps: [],
    },
    week: [],
    weeklyTotals: {
      coinsEarned: 0,
      coinsMaxPossible: 0,
      redemptionDate: '',
      redemptionDay: '',
    },
  };
}

/**
 * Get complete dashboard data for a user
 */
export async function getDashboardData(parentId: string, useCache: boolean = true): Promise<DashboardState | null> {
  // Check cache first
  if (useCache) {
    const cached = dataCache.get<DashboardState>(cacheKeys.dashboard(parentId));
    if (cached) {
      return cached;
    }
  }
  try {
    const user = await getUser(parentId);
    if (!user) {
      logger.warn('User not found in Firestore:', parentId);
      return null;
    }

    // Get challenge from Firestore only (no cache) so we have latest weeklyUpload after child upload
    let challenge = await getActiveChallenge(parentId, false);
    if (!challenge) {
      challenge = await getLatestChallenge(parentId);
      if (!challenge) {
        const child = await ensureChildForParent(parentId);
        const bootstrap = buildBootstrapDashboardState(user, child);
        if (useCache) rememberDashboardState(parentId, bootstrap);
        return bootstrap;
      }
    }

    // Get child data
    const child = await getChild(challenge.childId);
    if (!child) {
      throw new Error('Child not found for challenge');
    }
    
    // Get uploads for current week (include parentId for security rules)
    const uploads = await getUploadsByChallenge(challenge.id, parentId);

    // Check if challenge hasn't started yet
    const challengeNotStarted = !challenge.startDate || (() => {
      const startDate = new Date(challenge.startDate!);
      startDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today < startDate;
    })();
    
    // Generate week array (empty if challenge hasn't started)
    const week = challengeNotStarted ? [] : generateWeek(challenge, uploads);
    
    // Calculate weekly totals
    const weeklyTotals = calculateWeeklyTotals(week, challenge);
    
    // Build today object
    const todayObj = buildToday(week, challenge);
    
    // Map FirestoreChallenge to Challenge
    const challengeData = transformChallenge(challenge);
    
    const lastWeeklyAvgMinutes =
      avgMinutesFromWeeklyScreenTime(
        challenge.weeklyUpload?.processedData?.screenTimeMinutes,
        challenge.challengeDays
      ) ?? undefined;

    // Build dashboard state
    const dashboardState: DashboardState = {
      parent: {
        name: user.firstName || 'הורה',
        id: user.id,
        googleAuth: {}, // TODO: Add if needed
        profilePicture: '', // TODO: Add if available
        gender: normalizeParentGender(user.gender),
      },
      child: {
        name: child.name,
        id: child.id,
        profilePicture: child.profilePicture || '',
        gender: child.gender,
        nickname: child.nickname,
        changes: child.changes,
        changeDayChecks: changeDayChecksToMatrix(child.changeDayChecks),
        baselineDailyMinutes: child.baselineDailyMinutes,
        ...resolveChildShareCardFields(child),
      },
      challenge: challengeData,
      today: todayObj,
      week,
      weeklyTotals,
      lastWeeklyAvgMinutes,
      challengeNotStarted: challengeNotStarted,
      challengeStartDate: challenge.startDate,
      activeChallengeId: challenge.id
    };
    
    if (useCache) {
      rememberDashboardState(parentId, dashboardState);
    }
    
    return dashboardState;
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    throw new Error('שגיאה בטעינת נתוני הדשבורד.');
  }
}

const dashboardInflight = new Map<string, Promise<DashboardState | null>>();

/** One in-flight fetch per parent — login/onboarding prefetch and dashboard mount share it. */
export function loadDashboardDataShared(parentId: string): Promise<DashboardState | null> {
  const existing = dashboardInflight.get(parentId);
  if (existing) return existing;
  const pending = getDashboardData(parentId).finally(() => {
    dashboardInflight.delete(parentId);
  });
  dashboardInflight.set(parentId, pending);
  return pending;
}

