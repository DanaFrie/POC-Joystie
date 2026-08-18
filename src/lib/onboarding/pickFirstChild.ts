import {
  createScreenTimesFromChildren,
  DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
  getOnboardingChildrenScreenTime,
  setOnboardingChildrenScreenTime,
} from '@/lib/onboarding/childrenScreenTime';
import {
  getOnboardingChildrenDetails,
  hasOnboardingChildrenDetails,
} from '@/lib/onboarding/childrenDetails';
import { readOnboardingJson, writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';

const FIRST_CHILD_INDEX_KEY = 'onboardingFirstChildIndex';

export type PickFirstChildOption = {
  name: string;
  hours: number;
  gender: 'boy' | 'girl';
};

/** Figma 12703:42220 placeholders when parent flow data is not in storage yet. */
export const SIGNUP_PICK_CHILD_DEMO: PickFirstChildOption[] = [
  { name: 'יואב', hours: 4, gender: 'boy' },
  { name: 'שולמית', hours: 2, gender: 'girl' },
  { name: 'דינה', hours: 1, gender: 'girl' },
];

export function getSignupPickChildOptions(): PickFirstChildOption[] {
  return buildPickFirstChildOptions() ?? SIGNUP_PICK_CHILD_DEMO;
}

export function hasPickFirstChildOptions(): boolean {
  return buildPickFirstChildOptions() != null;
}

export function buildPickFirstChildOptions(): PickFirstChildOption[] | null {
  if (typeof window === 'undefined') return null;

  const children = getOnboardingChildrenDetails();
  if (!children?.length || !hasOnboardingChildrenDetails()) return null;

  let screenTimes = getOnboardingChildrenScreenTime();
  if (!screenTimes?.length) {
    screenTimes = createScreenTimesFromChildren(children);
    setOnboardingChildrenScreenTime(screenTimes);
  }
  const times = screenTimes ?? createScreenTimesFromChildren(children);

  return children.map((child, index) => ({
    name: child.name.trim(),
    hours: times[index]?.hours ?? DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
    gender: child.gender,
  }));
}

export function setOnboardingFirstChildIndex(index: number) {
  writeOnboardingJson(FIRST_CHILD_INDEX_KEY, index);
}

export function getOnboardingFirstChildIndex(): number | null {
  const value = readOnboardingJson<number>(FIRST_CHILD_INDEX_KEY);
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
