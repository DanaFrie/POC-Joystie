// Automated reminder functions for processes D and E
// These would typically run on a server/cron job, but here we provide client-side utilities

import { createPushNotification, saveNotification, getNotifications } from './notifications';
import type { WeekDay } from '@/types/dashboard';
import type { DashboardState } from '@/types/dashboard';

/**
 * Process D: Check for pending approvals and send reminder
 * Should run twice a week (Tuesday and Thursday at 16:00)
 */
export function checkPendingApprovals(
  week: WeekDay[],
  childName: string,
  childGender: 'boy' | 'girl' = 'boy'
): boolean {
  const pendingDays = week.filter(
    day => day.requiresApproval && day.status === 'awaiting_approval'
  );

  if (pendingDays.length > 0) {
    const notification = createPushNotification(
      'reminder_approval',
      childName,
      undefined,
      undefined,
      pendingDays.length,
      childGender
    );
    saveNotification(notification);
    return true;
  }

  return false;
}

/**
 * Process E: Check for missing reports from yesterday
 * Should run daily at 05:00
 */
export function checkMissingReport(
  yesterdayDate: string,
  yesterdayDayName: string,
  week: WeekDay[],
  childName: string,
  childGender: 'boy' | 'girl' = 'boy'
): boolean {
  // Find yesterday's day in the week
  const yesterdayDay = week.find(day => day.date === yesterdayDate);

  // Check if yesterday has no upload (status is pending or missing)
  if (yesterdayDay && (yesterdayDay.status === 'pending' || yesterdayDay.status === 'missing')) {
    const notification = createPushNotification(
      'missing_report',
      childName,
      yesterdayDate,
      yesterdayDayName,
      undefined,
      childGender
    );
    saveNotification(notification);

    // Update day status to missing
    yesterdayDay.status = 'missing';
    return true;
  }

  return false;
}

/**
 * Helper: Get yesterday's date in the format used by the system
 */
export function getYesterdayDate(): { date: string; dayName: string } {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateStr = `${yesterday.getDate()}/${yesterday.getMonth() + 1}/${yesterday.getFullYear()}`;
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayName = dayNames[yesterday.getDay()];

  return { date: dateStr, dayName };
}

/**
 * Helper: Check if it's time to run Process D (Tuesday or Thursday)
 */
export function shouldRunProcessD(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = now.getHours();
  
  // Tuesday (2) or Thursday (4) at 16:00 (4 PM)
  return (dayOfWeek === 2 || dayOfWeek === 4) && hour === 16;
}

/**
 * Helper: Check if it's time to run Process E (daily at 05:00)
 */
export function shouldRunProcessE(): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // Daily at 05:00 (5 AM)
  return hour === 5;
}

