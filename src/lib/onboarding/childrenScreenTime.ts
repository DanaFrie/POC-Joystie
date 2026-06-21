import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';

export type OnboardingChildScreenTime = {
  name: string;
  hours: number;
};

export const ONBOARDING_SCREEN_TIME_MIN = 0;
export const ONBOARDING_SCREEN_TIME_MAX = 12;
export const ONBOARDING_SCREEN_TIME_STEP = 0.5;

import { readOnboardingJson, writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';

const SCREEN_TIME_STORAGE_KEY = 'onboardingChildrenScreenTime';


export function createScreenTimesFromChildren(
  children: OnboardingChildDraft[]
): OnboardingChildScreenTime[] {
  return children.map((child, index) => ({
    name: child.name.trim(),
    hours: index === 0 ? 1 : 2,
  }));
}

export function setOnboardingChildrenScreenTime(entries: OnboardingChildScreenTime[]) {
  writeOnboardingJson(SCREEN_TIME_STORAGE_KEY, entries);
}

export function getOnboardingChildrenScreenTime(): OnboardingChildScreenTime[] | null {
  const parsed = readOnboardingJson<OnboardingChildScreenTime[]>(
    SCREEN_TIME_STORAGE_KEY
  );
  return Array.isArray(parsed) ? parsed : null;
}

export function snapScreenTimeHours(hours: number): number {
  const snapped =
    Math.round(hours / ONBOARDING_SCREEN_TIME_STEP) *
    ONBOARDING_SCREEN_TIME_STEP;
  return Math.min(
    ONBOARDING_SCREEN_TIME_MAX,
    Math.max(ONBOARDING_SCREEN_TIME_MIN, snapped)
  );
}

export function formatScreenTimeHours(hours: number):
  | { kind: 'one' }
  | { kind: 'half' }
  | { kind: 'many'; value: number } {
  if (hours === 1) return { kind: 'one' };
  if (hours === 0.5) return { kind: 'half' };
  return { kind: 'many', value: hours };
}

/** Pick-child card subtitle — Figma 12703:42220 */
export function formatDailyScreenTimeSubtitle(hours: number): string {
  if (hours === 0.5) return 'כחצי שעה זמן מסך יומי';
  if (hours === 1) return 'כשעה זמן מסך יומי';
  if (hours === 1.5) return 'כשעה וחצי זמן מסך יומי';
  if (hours === 2) return 'כשעתיים זמן מסך יומי';
  const label = Number.isInteger(hours)
    ? `${hours}`
    : formatNumber(hours);
  return `כ-${label} שעות זמן מסך יומי`;
}

function formatNumber(num: number): string {
  const formatted = num.toFixed(1);
  return formatted.replace(/\.?0+$/, '');
}
