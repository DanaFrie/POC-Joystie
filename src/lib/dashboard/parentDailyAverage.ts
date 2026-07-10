/**
 * Parent dashboard metrics — daily average minutes + week-over-week %.
 */
import { V03_CHALLENGE_DAYS } from '@/lib/challenge/v03ChallengeMath';
import type { FirestoreChallenge } from '@/types/firestore';
import type { Child } from '@/types/dashboard';

export type ParentDailyAverageMetrics = {
  averageMinutes: number;
  weekOverWeekPercent: number;
  source: 'baseline' | 'redemption';
};

function avgMinutesFromChallenge(challenge: FirestoreChallenge): number | null {
  const total = challenge.weeklyUpload?.processedData?.screenTimeMinutes;
  if (total == null || !Number.isFinite(total)) return null;
  const days = challenge.challengeDays || V03_CHALLENGE_DAYS;
  return Math.round(total / Math.max(1, days));
}

function isAccomplished(challenge: FirestoreChallenge): boolean {
  return Boolean(challenge.redeemedAt) || challenge.weeklyUpload?.status === 'approved';
}

/**
 * Avg daily minutes:
 * - no accomplished challenge → onboarding slider baseline
 * - else → last accomplished challenge redemption avg
 *
 * % vs last week / starting assumption:
 * - no prior week to compare → 0%
 */
export function computeParentDailyAverageMetrics(params: {
  child: Child;
  challenges: FirestoreChallenge[];
}): ParentDailyAverageMetrics {
  const baseline = params.child.baselineDailyMinutes ?? 0;
  const accomplished = params.challenges
    .filter(isAccomplished)
    .sort((a, b) =>
      (b.redeemedAt || b.updatedAt || '').localeCompare(a.redeemedAt || a.updatedAt || '')
    );

  const latest = accomplished[0];
  const latestAvg = latest ? avgMinutesFromChallenge(latest) : null;

  if (latestAvg == null) {
    return {
      averageMinutes: baseline || 90,
      weekOverWeekPercent: 0,
      source: 'baseline',
    };
  }

  const previous = accomplished[1];
  const previousAvg = previous ? avgMinutesFromChallenge(previous) : null;
  const compareTo = previousAvg != null && previousAvg > 0 ? previousAvg : baseline;

  let weekOverWeekPercent = 0;
  if (compareTo > 0 && previousAvg != null) {
    weekOverWeekPercent = Math.round(((latestAvg - compareTo) / compareTo) * 100);
  }

  return {
    averageMinutes: latestAvg,
    weekOverWeekPercent,
    source: 'redemption',
  };
}
