import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';

export type OnboardingChildScreenTime = {
  name: string;
  hours: number;
};

export const ONBOARDING_SCREEN_TIME_MIN = 0;
export const ONBOARDING_SCREEN_TIME_MAX = 12;
export const ONBOARDING_SCREEN_TIME_STEP = 0.5;

const SCREEN_TIME_STORAGE_KEY = 'onboardingChildrenScreenTime';

/** Short role labels — Figma (הבכור / הסנדוויצ׳ית / הקטנטנה). */
export function getChildScreenTimeRoleLabels(childCount: number): string[] {
  if (childCount <= 0) return [];
  if (childCount === 1) return ['הבכור'];
  if (childCount === 2) return ['הבכור', 'הקטנטנה'];

  const labels = ['הבכור'];
  for (let i = 0; i < childCount - 2; i += 1) {
    labels.push('הסנדוויצ׳ית');
  }
  labels.push('הקטנטנה');
  return labels;
}

export function createScreenTimesFromChildren(
  children: OnboardingChildDraft[]
): OnboardingChildScreenTime[] {
  return children.map((child, index) => ({
    name: child.name.trim(),
    hours: index === 0 ? 1 : 2,
  }));
}

export function setOnboardingChildrenScreenTime(entries: OnboardingChildScreenTime[]) {
  sessionStorage.setItem(SCREEN_TIME_STORAGE_KEY, JSON.stringify(entries));
}

export function getOnboardingChildrenScreenTime(): OnboardingChildScreenTime[] | null {
  const raw = sessionStorage.getItem(SCREEN_TIME_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OnboardingChildScreenTime[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
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
