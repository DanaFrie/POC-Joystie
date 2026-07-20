export type ChildGender = 'boy' | 'girl';

export type OnboardingChildDraft = {
  name: string;
  age: number;
  gender: ChildGender;
};

export const ONBOARDING_CHILD_AGE_MIN = 6;
export const ONBOARDING_CHILD_AGE_MAX = 14;
export const ONBOARDING_CHILD_DEFAULT_AGE = 8;

import { readOnboardingJson, writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';

const CHILDREN_STORAGE_KEY = 'onboardingChildrenDetails';

/** Birth-order name label on details screen (שם הבכור/ה, …). */
export function getChildDetailsStaticNameLabel(
  index: number,
  childCount: number
): string {
  if (childCount <= 0) return '';
  const oldest = 'הבכור/ה';
  const middle = 'הסנדוויץ׳/ית';
  const youngest = 'הקטן/ה';

  if (childCount === 1) return `שם ${oldest}`;
  if (index === 0) return `שם ${oldest}`;
  if (index === childCount - 1) return `שם ${youngest}`;
  return `שם ${middle}`;
}

/** Gendered birth-order role — screen-time screen only. */
export function getChildScreenTimeRoleLabel(
  index: number,
  childCount: number,
  gender: ChildGender
): string {
  if (childCount <= 0) return '';
  const isGirl = gender === 'girl';
  const oldest = isGirl ? 'הבכורה' : 'הבכור';
  const middle = isGirl ? "הסנדוויצ'ית" : "הסנדוויץ'";
  const youngest = isGirl ? 'הקטנה' : 'הקטן';

  if (childCount === 1) return oldest;
  if (index === 0) return oldest;
  if (index === childCount - 1) return youngest;
  return middle;
}

export function createEmptyChildren(count: number): OnboardingChildDraft[] {
  return Array.from({ length: count }, () => ({
    name: '',
    age: ONBOARDING_CHILD_DEFAULT_AGE,
    gender: 'girl',
  }));
}

export function setOnboardingChildrenDetails(children: OnboardingChildDraft[]) {
  writeOnboardingJson(CHILDREN_STORAGE_KEY, children);
}

export function getOnboardingChildrenDetails(): OnboardingChildDraft[] | null {
  const parsed = readOnboardingJson<OnboardingChildDraft[]>(CHILDREN_STORAGE_KEY);
  if (!Array.isArray(parsed)) return null;
  return parsed;
}

export function hasOnboardingChildrenDetails(): boolean {
  const children = getOnboardingChildrenDetails();
  return Boolean(children?.length && childrenDetailsComplete(children));
}

const HEBREW_LETTER_RE = /[\u05D0-\u05EA]/;

/** Hebrew letters, spaces, apostrophe, hyphen */
const HEBREW_NAME_RE = /^[\u0590-\u05FF'"\-\s]+$/;

export const ONBOARDING_HEBREW_ONLY_ERROR =
  'אנחנו תומכים כרגע רק בעברית :)';

export function isHebrewChildName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  return HEBREW_NAME_RE.test(trimmed) && HEBREW_LETTER_RE.test(trimmed);
}

export function getChildrenHebrewNameErrors(
  children: OnboardingChildDraft[]
): Record<number, string> {
  const errors: Record<number, string> = {};
  children.forEach((child, index) => {
    const trimmed = child.name.trim();
    if (!trimmed) return;
    if (!isHebrewChildName(trimmed)) {
      errors[index] = ONBOARDING_HEBREW_ONLY_ERROR;
    }
  });
  return errors;
}

export function childrenDetailsComplete(children: OnboardingChildDraft[]): boolean {
  return (
    children.length > 0 &&
    children.every(
      (c) =>
        c.name.trim().length > 0 &&
        isHebrewChildName(c.name) &&
        c.age >= ONBOARDING_CHILD_AGE_MIN &&
        c.age <= ONBOARDING_CHILD_AGE_MAX
    )
  );
}
