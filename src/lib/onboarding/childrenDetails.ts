export type ChildGender = 'boy' | 'girl';

export type OnboardingChildDraft = {
  name: string;
  age: number;
  gender: ChildGender;
};

export const ONBOARDING_CHILD_AGE_MIN = 6;
export const ONBOARDING_CHILD_AGE_MAX = 12;
export const ONBOARDING_CHILD_DEFAULT_AGE = 8;

const CHILDREN_STORAGE_KEY = 'onboardingChildrenDetails';

/** Birth-order labels — middle slots (2+ kids) are always סנדוויץ׳/ית. */
export function getChildNameLabels(childCount: number): string[] {
  if (childCount <= 0) return [];
  if (childCount === 1) return ['שם הבכור/ה'];

  const labels = ['שם הבכור/ה'];
  for (let i = 0; i < childCount - 2; i += 1) {
    labels.push('שם הסנדוויץ׳/ית');
  }
  labels.push('שם הקטנטן/ה');
  return labels;
}

export function createEmptyChildren(count: number): OnboardingChildDraft[] {
  return Array.from({ length: count }, () => ({
    name: '',
    age: ONBOARDING_CHILD_DEFAULT_AGE,
    gender: 'girl',
  }));
}

export function setOnboardingChildrenDetails(children: OnboardingChildDraft[]) {
  sessionStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(children));
}

export function getOnboardingChildrenDetails(): OnboardingChildDraft[] | null {
  const raw = sessionStorage.getItem(CHILDREN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OnboardingChildDraft[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function childrenDetailsComplete(children: OnboardingChildDraft[]): boolean {
  return (
    children.length > 0 &&
    children.every(
      (c) =>
        c.name.trim().length > 0 &&
        c.age >= ONBOARDING_CHILD_AGE_MIN &&
        c.age <= ONBOARDING_CHILD_AGE_MAX
    )
  );
}
