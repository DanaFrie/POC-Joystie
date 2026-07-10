import {
  createChallenge,
  deactivateChallenge,
  getActiveChallenge,
  getUserChallenges,
  updateChallenge,
  updateWeeklyUpload,
} from '@/lib/api/challenges';
import { updateChild } from '@/lib/api/children';
import type { ChildChallengeSetupResult } from '@/components/dashboard/challenge/ChildChallengeSetupOverlay';
import type { ChildRedemptionFlowResult } from '@/components/dashboard/challenge/ChildRedemptionOverlay';
import type { ParentChallengeSetupResult } from '@/components/dashboard/challenge/ParentChallengeSetupOverlay';
import type { ParentRedemptionConfirmResult } from '@/components/dashboard/challenge/ParentRedemptionConfirmOverlay';
import { V03_CHALLENGE_DAYS } from '@/lib/challenge/v03ChallengeMath';
import type { FirestoreChallenge } from '@/types/firestore';

function invalidateDashboardCache(parentId: string) {
  void import('@/utils/data-cache').then(({ dataCache, cacheKeys }) => {
    dataCache.invalidate(cacheKeys.dashboard(parentId));
    dataCache.invalidate(cacheKeys.challenge(parentId));
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('joystie_challenge_updated'));
  }
}

function isAccomplishedChallenge(challenge: FirestoreChallenge): boolean {
  return Boolean(challenge.redeemedAt) || challenge.weeklyUpload?.status === 'approved';
}

/** Next weekNumber = last accomplished challenge week + 1 (or 1). */
export async function resolveNextChallengeWeekNumber(parentId: string): Promise<number> {
  const all = await getUserChallenges(parentId);
  const accomplished = all
    .filter(isAccomplishedChallenge)
    .sort((a, b) => (b.redeemedAt || b.updatedAt || '').localeCompare(a.redeemedAt || a.updatedAt || ''));
  const last = accomplished[0];
  if (!last?.weekNumber) return 1;
  return last.weekNumber + 1;
}

/** Parent confirms weekly deal — creates or reactivates challenge in Firestore. */
export async function persistParentChallengeSetup(
  parentId: string,
  childId: string | undefined,
  result: ParentChallengeSetupResult
): Promise<string> {
  const { ensureChildForParent } = await import('@/lib/api/children');
  const resolvedChildId = childId || (await ensureChildForParent(parentId)).id;
  const existing = await getActiveChallenge(parentId, false);
  const weekNumber = await resolveNextChallengeWeekNumber(parentId);

  const payload = {
    parentId,
    childId: resolvedChildId,
    selectedBudget: result.weeklyBudget,
    hourlyRate: result.hourlyRate,
    weekNumber,
    startDate: result.startDateIso,
    challengeDays: V03_CHALLENGE_DAYS,
    isActive: true,
  };

  let challengeId: string;
  if (existing) {
    await updateChallenge(existing.id, payload);
    challengeId = existing.id;
  } else {
    challengeId = await createChallenge(payload);
  }

  // Refresh parent-facing child share URL with this challenge id (30-day token).
  try {
    const { updateUser } = await import('@/lib/api/users');
    await updateUser(parentId, {
      primaryChildId: resolvedChildId,
    });
  } catch {
    // non-critical
  }

  invalidateDashboardCache(parentId);
  return challengeId;
}

/** Child accepts deal — money goals live on the challenge (week-scoped). */
export async function persistChildChallengeAccept(
  parentId: string,
  childId: string,
  result: ChildChallengeSetupResult
): Promise<void> {
  const goals = [
    ...result.moneyGoals,
    ...(result.customGoal?.trim() ? [result.customGoal.trim()] : []),
  ];

  const active = await getActiveChallenge(parentId, false);
  if (active) {
    await updateChallenge(active.id, {
      moneyGoals: goals,
    });
  } else {
    // Fallback for legacy flows that still expect child.moneyGoals
    await updateChild(childId, { moneyGoals: goals }, parentId);
  }

  invalidateDashboardCache(parentId);
}

/** Child redemption upload + OCR summary. */
export async function persistChildRedemptionUpload(
  parentId: string,
  challengeId: string,
  result: Pick<
    ChildRedemptionFlowResult,
    | 'uploadedBy'
    | 'screenshotDataUrl'
    | 'totalScreenMinutes'
    | 'remainingAmount'
    | 'minutesPerDay'
  >
): Promise<void> {
  if (!result.screenshotDataUrl) return;

  await updateWeeklyUpload(challengeId, {
    screenshotUrl: result.screenshotDataUrl,
    uploadedBy: result.uploadedBy,
    processedData: {
      screenTimeMinutes: result.totalScreenMinutes,
      minutesPerDay: result.minutesPerDay,
    },
  });

  invalidateDashboardCache(parentId);
}

/** Parent approves redemption — deactivates challenge for next weekly cycle. */
export async function persistParentRedemptionConfirm(
  parentId: string,
  challengeId: string,
  result: ParentRedemptionConfirmResult,
  redemptionChoice?: 'cash' | 'donation' | 'activity' | 'save'
): Promise<void> {
  const challenge = await getActiveChallenge(parentId, false);
  if (!challenge?.weeklyUpload) return;

  await updateChallenge(challengeId, {
    weeklyUpload: {
      ...challenge.weeklyUpload,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      processedData: {
        ...challenge.weeklyUpload.processedData,
        screenTimeMinutes: Math.round(result.totalScreenHours * 60),
      },
    },
  });

  await deactivateChallenge(challengeId, {
    redemptionAmount: result.redeemAmount,
    redemptionChoice,
    redeemedAt: new Date().toISOString(),
  });

  invalidateDashboardCache(parentId);
}
