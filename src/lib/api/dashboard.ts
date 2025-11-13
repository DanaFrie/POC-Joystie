// Dashboard Data API
import { getActiveChallenge } from './challenges';
import { getUploadsByChallenge, getPendingApprovals } from './uploads';
import { getNotifications } from './notifications';
import { getUser } from './users';
import type { DashboardState } from '@/types/dashboard';
import type { FirestoreChallenge, FirestoreDailyUpload } from '@/types/firestore';

/**
 * Get complete dashboard data for a user
 */
export async function getDashboardData(parentId: string): Promise<DashboardState | null> {
  try {
    // Get user data
    const user = await getUser(parentId);
    if (!user) {
      return null;
    }

    // Get active challenge
    const challenge = await getActiveChallenge(parentId);
    if (!challenge) {
      // No active challenge - return basic user data
      return null;
    }

    // Get child data (would need to fetch from children collection)
    // For now, we'll need to get this from the challenge or a separate call
    // This is a placeholder - you'll need to implement getChild() in children API
    
    // Get uploads for current week
    const uploads = await getUploadsByChallenge(challenge.id);
    
    // Get pending approvals
    const pendingApprovals = await getPendingApprovals(parentId);
    
    // Get notifications
    const notifications = await getNotifications(parentId, 10);

    // Build dashboard state
    // Note: This is a simplified version - you'll need to map Firestore data
    // to your DashboardState interface based on your specific needs
    
    // TODO: Implement full mapping from Firestore data to DashboardState
    // This requires implementing getChild() and mapping uploads to WeekDay format
    
    return null; // Placeholder - implement full mapping
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw new Error('שגיאה בטעינת נתוני הדשבורד.');
  }
}

/**
 * Get weekly data for a challenge
 */
export async function getWeekData(challengeId: string): Promise<FirestoreDailyUpload[]> {
  try {
    return await getUploadsByChallenge(challengeId);
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

