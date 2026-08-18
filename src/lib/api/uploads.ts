// Upload reads — challenge.weekUploads (no separate daily_uploads collection)
import { getChallenge } from './challenges';
import type { FirestoreDailyUpload, ChallengeDayUpload } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Uploads');

/** Map day upload from challenge to FirestoreDailyUpload shape (with id, challengeId, parentId, childId) */
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
