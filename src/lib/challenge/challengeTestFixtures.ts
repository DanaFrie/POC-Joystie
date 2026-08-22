import type { DashboardState } from '@/types/dashboard';
import { V03_CHALLENGE_BUDGET, V03_CHALLENGE_HOURLY_RATE } from '@/constants/v03-challenge';
import { PLACEHOLDER_CHILD } from '@/constants/placeholder-child';

/** Static dashboard shell for challenge / redemption UI test routes. */
export function createChallengeTestDashboardState(
  overrides?: Partial<{
    childName: string;
    parentName: string;
    parentGender: 'male' | 'female';
    childGender: 'boy' | 'girl';
    weeklyBudget: number;
    estimatedDailyHours: number;
  }>
): DashboardState {
  const weeklyBudget = overrides?.weeklyBudget ?? V03_CHALLENGE_BUDGET.default;
  const dailyHours = overrides?.estimatedDailyHours ?? 1.5;

  return {
    parent: {
      name: overrides?.parentName ?? 'דנה',
      id: 'test-parent',
      googleAuth: {},
      profilePicture: '',
      gender: overrides?.parentGender ?? 'female',
    },
    child: {
      name: overrides?.childName ?? PLACEHOLDER_CHILD.name,
      id: 'test-child',
      profilePicture: '',
      gender: overrides?.childGender ?? PLACEHOLDER_CHILD.gender,
      nickname: '',
    },
    challenge: {
      selectedBudget: weeklyBudget,
      weeklyBudget,
      dailyBudget: weeklyBudget / 6,
      dailyScreenTimeGoal: dailyHours,
      weekNumber: 1,
      totalWeeks: 4,
      startDate: '',
      isActive: false,
    },
    today: {
      date: '',
      hebrewDate: '',
      screenshotStatus: 'pending',
      screenTimeUsed: 0,
      screenTimeGoal: dailyHours,
      coinsEarned: 0,
      coinsMaxPossible: weeklyBudget / 6,
      requiresApproval: false,
      uploadedAt: '',
      apps: [],
    },
    week: [],
    weeklyTotals: {
      coinsEarned: 0,
      coinsMaxPossible: weeklyBudget,
      redemptionDate: '',
      redemptionDay: '',
    },
    challengeNotStarted: true,
  };
}

export const CHALLENGE_TEST_DEFAULTS = {
  weeklyBudget: V03_CHALLENGE_BUDGET.default,
  hourlyRate: V03_CHALLENGE_HOURLY_RATE.default,
  /** Mock “from onboarding” estimated daily hours. */
  estimatedDailyHours: 1.5,
  /** Mock OCR total minutes over 6 days (~9h). */
  ocrTotalMinutes: 540,
} as const;
