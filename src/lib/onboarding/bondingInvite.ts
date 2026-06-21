import { getOnboardingFirstChildIndex, getSignupPickChildOptions } from '@/lib/onboarding/pickFirstChild';
import { readOnboardingJson, writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';

const BONDING_CHILD_URL_KEY = 'onboardingBondingChildUrl';

export function getSelectedFirstChildName(): string {
  const options = getSignupPickChildOptions();
  const index = getOnboardingFirstChildIndex() ?? 0;
  return options[index]?.name?.trim() || 'הילד/ה';
}

export function setBondingChildUrl(url: string) {
  writeOnboardingJson(BONDING_CHILD_URL_KEY, url);
}

export function getBondingChildUrl(): string {
  const stored = readOnboardingJson<string>(BONDING_CHILD_URL_KEY);
  if (stored && typeof stored === 'string') return stored;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/onboarding/child`;
  }
  return '';
}
