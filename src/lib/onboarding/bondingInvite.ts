import { getOnboardingFirstChildIndex, getSignupPickChildOptions } from '@/lib/onboarding/pickFirstChild';
import { readOnboardingJson, writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';
import { rewriteOnboardingChildUrlToCurrentOrigin } from '@/utils/url-encoding';

const BONDING_CHILD_URL_KEY = 'onboardingBondingChildUrl';
const BONDING_CHILD_NAME_KEY = 'onboardingBondingChildName';
const BONDING_CHILD_GENDER_KEY = 'onboardingBondingChildGender';

export function getSelectedFirstChildName(): string {
  const options = getSignupPickChildOptions();
  const index = getOnboardingFirstChildIndex() ?? 0;
  const fromPick = options[index]?.name?.trim();
  if (fromPick) return fromPick;
  return getBondingChildName() || 'הילד/ה';
}

export function getSelectedFirstChildGender(): 'boy' | 'girl' {
  const options = getSignupPickChildOptions();
  const index = getOnboardingFirstChildIndex() ?? 0;
  return options[index]?.gender ?? 'boy';
}

export function setBondingChildName(name: string) {
  const trimmed = name.trim();
  if (trimmed) writeOnboardingJson(BONDING_CHILD_NAME_KEY, trimmed);
}

export function setBondingChildGender(gender: 'boy' | 'girl') {
  writeOnboardingJson(BONDING_CHILD_GENDER_KEY, gender);
}

export function getBondingChildGender(): 'boy' | 'girl' | null {
  const stored = readOnboardingJson<'boy' | 'girl'>(BONDING_CHILD_GENDER_KEY);
  return stored === 'girl' || stored === 'boy' ? stored : null;
}

export function getBondingChildName(): string | null {
  const stored = readOnboardingJson<string>(BONDING_CHILD_NAME_KEY);
  if (typeof stored === 'string' && stored.trim()) return stored.trim();
  return null;
}

function removeOnboardingKey(key: string) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Drop cached invite URL so the next share rebuilds for the current child. */
export function clearBondingChildUrl() {
  removeOnboardingKey(BONDING_CHILD_URL_KEY);
}

export function setBondingChildUrl(url: string) {
  const normalized =
    typeof window !== 'undefined' ? rewriteOnboardingChildUrlToCurrentOrigin(url) : url;
  writeOnboardingJson(BONDING_CHILD_URL_KEY, normalized);
}

export function getBondingChildUrl(): string {
  const stored = readOnboardingJson<string>(BONDING_CHILD_URL_KEY);
  if (stored && typeof stored === 'string') {
    return rewriteOnboardingChildUrlToCurrentOrigin(stored);
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/onboarding/child`;
  }
  return '';
}
