const COUNT_STORAGE_KEY = 'onboardingChildrenPhoneCount';

export const ONBOARDING_CHILDREN_PHONE_MIN = 1;
export const ONBOARDING_CHILDREN_PHONE_MAX = 6;

export function setOnboardingChildrenPhoneCount(count: number) {
  sessionStorage.setItem(COUNT_STORAGE_KEY, String(count));
}

export function getOnboardingChildrenPhoneCount(): number | null {
  const raw = sessionStorage.getItem(COUNT_STORAGE_KEY);
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (
    Number.isNaN(n) ||
    n < ONBOARDING_CHILDREN_PHONE_MIN ||
    n > ONBOARDING_CHILDREN_PHONE_MAX
  ) {
    return null;
  }
  return n;
}
