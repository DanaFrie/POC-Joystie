// Upload Management API – reads/writes challenge.weekUploads (no daily_uploads collection)
import { getFirestoreInstance } from '@/lib/firebase';
import { getChallenge, updateChallenge } from './challenges';
import type { FirestoreDailyUpload, FirestoreChallenge, ChallengeDayUpload } from '@/types/firestore';
import { withRetry } from '@/utils/firestore-retry';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Uploads');

/** Map day upload from challenge to legacy FirestoreDailyUpload shape (with id, challengeId, parentId, childId) */
function toDailyUploadShape(
  day: ChallengeDayUpload,
  challengeId: string,
  parentId: string,
  childId: string
): FirestoreDailyUpload {
  return {
    id: day.date,
    challengeId,
    parentId,
    childId,
    date: day.date,
    dayName: day.dayName,
    screenTimeUsed: day.screenTimeUsed ?? 0,
    screenTimeMinutes: day.screenTimeMinutes,
    screenTimeGoal: day.screenTimeGoal ?? 0,
    coinsEarned: day.coinsEarned ?? 0,
    coinsMaxPossible: day.coinsMaxPossible ?? 0,
    success: day.success ?? false,
    screenshotUrl: day.screenshotUrl,
    requiresApproval: day.requiresApproval ?? false,
    parentAction: day.parentAction ?? null,
    uploadedAt: day.uploadedAt ?? '',
    approvedAt: day.approvedAt,
    apps: day.apps,
    createdAt: day.uploadedAt ?? '',
    updatedAt: day.uploadedAt ?? '',
  };
}

/**
 * Create or update a day's upload – writes into challenge.weekUploads
 */
export async function createUpload(
  uploadData: Omit<FirestoreDailyUpload, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  return withRetry(async () => {
    try {
      const challenge = await getChallenge(uploadData.challengeId, false);
      if (!challenge) throw new Error('Challenge not found');
      const now = new Date().toISOString();
      const day: ChallengeDayUpload = {
        date: uploadData.date,
        dayName: uploadData.dayName,
        screenTimeUsed: uploadData.screenTimeUsed,
        screenTimeMinutes: uploadData.screenTimeMinutes,
        screenTimeGoal: uploadData.screenTimeGoal,
        coinsEarned: uploadData.coinsEarned,
        coinsMaxPossible: uploadData.coinsMaxPossible,
        success: uploadData.success,
        screenshotUrl: uploadData.screenshotUrl,
        requiresApproval: uploadData.requiresApproval,
        parentAction: uploadData.parentAction ?? null,
        uploadedAt: uploadData.uploadedAt || now,
        approvedAt: uploadData.approvedAt,
        apps: uploadData.apps,
      };
      const weekUploads = [...(challenge.weekUploads ?? [])];
      const idx = weekUploads.findIndex((u) => u.date === uploadData.date);
      if (idx >= 0) weekUploads[idx] = day;
      else weekUploads.push(day);
      await updateChallenge(uploadData.challengeId, {
        weekUploads,
        updatedAt: now,
      });
      return uploadData.date;
    } catch (error: any) {
      logger.error('Error creating upload:', error);
      if (error.code === 'permission-denied') throw new Error('אין הרשאה ליצור העלאה. אנא בדוק את ההרשאות.');
      throw new Error('שגיאה בשמירת ההעלאה. נסה שוב.');
    }
  });
}

/**
 * Get upload by ID – deprecated (no document IDs). Use getUploadByDate(challengeId, date).
 */
export async function getUpload(uploadId: string): Promise<FirestoreDailyUpload | null> {
  logger.warn('getUpload(uploadId) is deprecated; use getUploadByDate(challengeId, date)');
  return null;
}

/**
 * Get uploads for a challenge – from challenge.weekUploads
 */
export async function getUploadsByChallenge(
  challengeId: string,
  parentId?: string,
  limitCount?: number,
  useCache: boolean = true
): Promise<FirestoreDailyUpload[]> {
  if (useCache && parentId && !limitCount) {
    const { dataCache, cacheKeys } = await import('@/utils/data-cache');
    const cached = dataCache.get<FirestoreDailyUpload[]>(cacheKeys.uploads(challengeId, parentId));
    if (cached) {
      logger.log(`Using cached uploads for challenge ${challengeId}`);
      return cached;
    }
  }

  const challenge = await getChallenge(challengeId, useCache);
  if (!challenge) return [];
  const weekUploads = challenge.weekUploads ?? [];
  let list = weekUploads
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .map((u) => toDailyUploadShape(u, challengeId, challenge.parentId, challenge.childId));
  if (limitCount) list = list.slice(0, limitCount);
  if (useCache && parentId && !limitCount) {
    const { dataCache, cacheKeys, cacheTTL } = await import('@/utils/data-cache');
    dataCache.set(cacheKeys.uploads(challengeId, parentId), list, cacheTTL.uploads);
  }
  return list;
}

/**
 * Get upload for a specific date – from challenge.weekUploads
 */
export async function getUploadByDate(
  challengeId: string,
  date: string,
  _parentId?: string
): Promise<FirestoreDailyUpload | null> {
  const challenge = await getChallenge(challengeId, true);
  if (!challenge) return null;
  const day = (challenge.weekUploads ?? []).find((u) => u.date === date);
  if (!day) return null;
  return toDailyUploadShape(day, challengeId, challenge.parentId, challenge.childId);
}

/**
 * Get uploads requiring approval – from all challenges of parent, weekUploads
 */
export async function getPendingApprovals(parentId: string): Promise<FirestoreDailyUpload[]> {
  const { getLatestChallenge, getActiveChallenge } = await import('./challenges');
  const active = await getActiveChallenge(parentId, false);
  const latest = await getLatestChallenge(parentId);
  const challenge = active ?? latest;
  if (!challenge) return [];
  const weekUploads = (challenge.weekUploads ?? []).filter(
    (u) => u.requiresApproval && (u.parentAction === undefined || u.parentAction === null)
  );
  return weekUploads.map((u) =>
    toDailyUploadShape(u, challenge.id, challenge.parentId, challenge.childId)
  );
}

/**
 * Get pending approvals for a challenge
 */
export async function getPendingApprovalsByChallenge(
  challengeId: string,
  parentId: string
): Promise<FirestoreDailyUpload[]> {
  const uploads = await getUploadsByChallenge(challengeId, parentId, undefined, false);
  return uploads.filter((u) => u.requiresApproval && (u.parentAction === undefined || u.parentAction === null));
}

/**
 * Approve a day's upload – updates challenge.weekUploads[date]
 */
export async function batchApproveUpload(
  challengeId: string,
  date: string,
  manualUpdates?: Partial<Omit<FirestoreDailyUpload, 'id' | 'createdAt'>>,
  isManual: boolean = false
): Promise<void> {
  return withRetry(async () => {
    const challenge = await getChallenge(challengeId, false);
    if (!challenge) throw new Error('Challenge not found');
    const weekUploads = [...(challenge.weekUploads ?? [])];
    const idx = weekUploads.findIndex((u) => u.date === date);
    if (idx < 0) throw new Error('Upload not found for date');
    const now = new Date().toISOString();
    weekUploads[idx] = {
      ...weekUploads[idx],
      ...(manualUpdates && {
        screenTimeUsed: manualUpdates.screenTimeUsed,
        screenTimeMinutes: manualUpdates.screenTimeMinutes,
        coinsEarned: manualUpdates.coinsEarned,
        success: manualUpdates.success,
        apps: manualUpdates.apps,
      }),
      requiresApproval: false,
      parentAction: 'approved',
      approvedAt: now,
    };
    await updateChallenge(challengeId, { weekUploads, updatedAt: now });
    logger.log(`Approved upload for challenge ${challengeId} date ${date}`);
  });
}

/**
 * Approve an upload (by challengeId + date). Legacy uploadId form supported for backward compat (treated as date if no doc found).
 */
export async function approveUpload(uploadIdOrDate: string, isManual: boolean = false): Promise<void> {
  // If call site still passes uploadId, we need challengeId. Currently no callers. Support (challengeId, date) by convention or two params.
  logger.warn('approveUpload(uploadId) is deprecated; use batchApproveUpload(challengeId, date)');
}

/**
 * Update a day's upload – updates challenge.weekUploads[date]
 */
export async function updateUpload(
  challengeId: string,
  date: string,
  updates: Partial<Omit<FirestoreDailyUpload, 'id' | 'createdAt'>>
): Promise<void> {
  const challenge = await getChallenge(challengeId, false);
  if (!challenge) throw new Error('Challenge not found');
  const weekUploads = [...(challenge.weekUploads ?? [])];
  const idx = weekUploads.findIndex((u) => u.date === date);
  if (idx < 0) throw new Error('Upload not found for date');
  const now = new Date().toISOString();
  const day = weekUploads[idx];
  const { challengeId: _c, parentId: _p, childId: _ch, updatedAt: _u, ...rest } = updates as Partial<FirestoreDailyUpload>;
  weekUploads[idx] = {
    ...day,
    ...rest,
    date: day.date,
    dayName: day.dayName,
  } as ChallengeDayUpload;
  await updateChallenge(challengeId, { weekUploads, updatedAt: now });
}
