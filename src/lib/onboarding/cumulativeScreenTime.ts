import { getOnboardingChildrenDetails } from '@/lib/onboarding/childrenDetails';
import type { ChildGender } from '@/lib/onboarding/childrenDetails';
import { getOnboardingChildrenScreenTime } from '@/lib/onboarding/childrenScreenTime';

const ADULT_AGE = 18;

export type ChildCumulativeProjection = {
  name: string;
  gender: ChildGender;
  hoursPerDay: number;
  /** Total projected screen days until 18. */
  totalDays: number;
  durationLabel: string;
};

/** Under 2 months («חודשיים») — show encouraging copy instead of a duration badge. */
export function isLowCumulativeScreenTime(totalDays: number): boolean {
  return totalDays < 60;
}

function hebrewYears(n: number): string {
  if (n === 1) return 'שנה';
  if (n === 2) return 'שנתיים';
  return `${n} שנים`;
}

function hebrewMonths(n: number): string {
  if (n === 1) return 'חודש';
  if (n === 2) return 'חודשיים';
  return `${n} חודשים`;
}

function hebrewDays(n: number): string {
  if (n === 1) return 'יום';
  if (n === 2) return 'יומיים';
  return `${n} ימים`;
}

function joinHebrewDuration(parts: string[]): string {
  if (parts.length === 0) return '0 ימים';
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} ו${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} ו${parts[parts.length - 1]}`;
}

/** Screen-time hours → total days on screen until age 18. */
export function cumulativeScreenDays(hoursPerDay: number, age: number): number {
  const yearsRemaining = Math.max(0, ADULT_AGE - age);
  const totalHours = hoursPerDay * 365.25 * yearsRemaining;
  return Math.max(1, Math.round(totalHours / 24));
}

export function formatCumulativeDurationHebrew(totalDays: number): string {
  const years = Math.floor(totalDays / 365);
  let remainder = totalDays % 365;
  const months = Math.floor(remainder / 30);
  const days = remainder % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(hebrewYears(years));
  if (months > 0) parts.push(hebrewMonths(months));
  if (days > 0 || parts.length === 0) parts.push(hebrewDays(days));

  return joinHebrewDuration(parts);
}

export function futureScreenTimeVerb(gender: ChildGender): string {
  return gender === 'girl' ? 'עתידה' : 'עתיד';
}

const FALLBACK_PROJECTIONS: ChildCumulativeProjection[] = [
  {
    name: 'יואב',
    gender: 'boy',
    hoursPerDay: 3,
    totalDays: 365 + 5 * 30 + 3,
    durationLabel: 'שנה, 5 חודשים ו3 ימים',
  },
];

/** Merges onboarding session data; demo fallback when empty. */
export function getChildCumulativeProjections(): ChildCumulativeProjection[] {
  if (typeof window === 'undefined') return FALLBACK_PROJECTIONS;

  const details = getOnboardingChildrenDetails();
  const screenTimes = getOnboardingChildrenScreenTime();
  if (!details?.length || !screenTimes?.length) return FALLBACK_PROJECTIONS;

  const count = Math.min(details.length, screenTimes.length);
  const projections: ChildCumulativeProjection[] = [];

  for (let i = 0; i < count; i += 1) {
    const detail = details[i]!;
    const screen = screenTimes[i]!;
    const name = screen.name.trim() || detail.name.trim() || `ילד ${i + 1}`;
    const days = cumulativeScreenDays(screen.hours, detail.age);
    projections.push({
      name,
      gender: detail.gender,
      hoursPerDay: screen.hours,
      totalDays: days,
      durationLabel: formatCumulativeDurationHebrew(days),
    });
  }

  return projections.length > 0 ? projections : FALLBACK_PROJECTIONS;
}
