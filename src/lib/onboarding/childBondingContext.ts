import { readOnboardingJson, writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';

const CHILD_BONDING_CONTEXT_KEY = 'onboardingChildBondingContext';

export type ChildBondingContext = {
  parentId: string;
  childId?: string | null;
  inviteId?: string;
  childName: string;
  childGender?: 'boy' | 'girl';
  parentName: string;
  parentGender?: 'female' | 'male';
};

const CHILD_BONDING_CONTEXT_EVENT = 'child-bonding-context-updated';

export function setChildBondingContext(ctx: ChildBondingContext) {
  writeOnboardingJson(CHILD_BONDING_CONTEXT_KEY, ctx);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHILD_BONDING_CONTEXT_EVENT));
  }
}

export const childBondingContextEventName = CHILD_BONDING_CONTEXT_EVENT;

export function getChildBondingContext(): ChildBondingContext | null {
  return readOnboardingJson<ChildBondingContext>(CHILD_BONDING_CONTEXT_KEY);
}
