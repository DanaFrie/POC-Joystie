import {
  isRedemptionOpen,
  redemptionOpenDateFromStart,
  roundMoney,
} from '@/lib/challenge/v03ChallengeMath';
import { V03_CHALLENGE_DEFAULT_DAILY_HOURS } from '@/constants/v03-challenge';
import type { Challenge, Child, DashboardState } from '@/types/dashboard';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';

export function deriveHourlyRate(
  challenge: Pick<Challenge, 'dailyBudget' | 'dailyScreenTimeGoal'> & { hourlyRate?: number }
): number {
  if (challenge.hourlyRate && challenge.hourlyRate > 0) return challenge.hourlyRate;
  const dailyBudget = challenge.dailyBudget ?? 0;
  const dailyGoal = challenge.dailyScreenTimeGoal ?? 0;
  if (dailyGoal > 0) {
    return roundMoney(dailyBudget / dailyGoal, 1);
  }
  return roundMoney(dailyBudget, 1);
}

export function deriveWeeklyBudget(challenge: Pick<Challenge, 'selectedBudget' | 'weeklyBudget'>): number {
  return challenge.selectedBudget || challenge.weeklyBudget || 0;
}

export function isChildDealSetupComplete(
  child: Child,
  challenge?: Pick<Challenge, 'moneyGoals'> | null
): boolean {
  if (challenge?.moneyGoals && challenge.moneyGoals.length > 0) return true;
  return Boolean(child.moneyGoals && child.moneyGoals.length > 0);
}

export function isChallengeStarted(challenge: Challenge): boolean {
  if (!challenge.startDate) return false;
  const start = new Date(challenge.startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime() >= start.getTime();
}

export function isV03DealLive(
  challengeEnabled: boolean,
  challenge: Challenge,
  child: Child,
  _challengeNotStarted?: boolean
): boolean {
  if (!challengeEnabled) return false;
  if (!challenge.isActive) return false;
  // Deal values (card / conversion / countdown) go live once the child confirms —
  // even if the calendar start date is still in the future.
  if (!isChildDealSetupComplete(child, challenge)) return false;
  return deriveWeeklyBudget(challenge) > 0;
}

export function isParentChallengeSet(
  challenge: Challenge,
  noChallengeExists: boolean
): boolean {
  return !noChallengeExists && challenge.isActive && deriveWeeklyBudget(challenge) > 0;
}

export function canOpenParentChallengeSetup(
  challengeEnabled: boolean,
  challenge: Challenge,
  noChallengeExists: boolean
): boolean {
  if (!challengeEnabled) return false;
  return noChallengeExists || !challenge.isActive;
}

export function canOpenChildChallengeSetup(
  challengeEnabled: boolean,
  challenge: Challenge,
  child: Child,
  noChallengeExists: boolean,
  _challengeNotStarted?: boolean
): boolean {
  if (!challengeEnabled || noChallengeExists) return false;
  if (!challenge.isActive) return false;
  return !isChildDealSetupComplete(child, challenge);
}

export function canOpenChildRedemption(
  challengeEnabled: boolean,
  challenge: Challenge,
  child: Child,
  weeklyUpload?: WeeklyUpload | null,
  now: Date = new Date()
): boolean {
  if (!isV03DealLive(challengeEnabled, challenge, child)) return false;
  if (!challenge.startDate) return false;
  if (!isRedemptionOpen(new Date(challenge.startDate), now)) return false;
  if (weeklyUpload?.status === 'approved') return false;
  return true;
}

export function getRedemptionCountdownTarget(startDateIso?: string): Date | null {
  if (!startDateIso) return null;
  return redemptionOpenDateFromStart(new Date(startDateIso));
}

export function estimatedDailyHoursFromDashboard(data: DashboardState): number {
  const baselineMinutes = data.child.baselineDailyMinutes;
  if (typeof baselineMinutes === 'number' && baselineMinutes > 0) {
    return roundMoney(baselineMinutes / 60, 1);
  }
  return V03_CHALLENGE_DEFAULT_DAILY_HOURS;
}

export function parentLabelFromGender(gender?: 'male' | 'female'): string {
  if (gender === 'female') return 'אמא';
  if (gender === 'male') return 'אבא';
  return 'אמא';
}

export function firestoreHourlyRate(challenge: FirestoreChallenge): number {
  return deriveHourlyRate({
    dailyBudget: challenge.dailyBudget ?? 0,
    dailyScreenTimeGoal: challenge.dailyScreenTimeGoal ?? 0,
    hourlyRate: challenge.hourlyRate,
  });
}
