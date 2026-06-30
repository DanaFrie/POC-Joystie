import { writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';
import {
  setOnboardingChildrenDetails,
  type ChildGender,
  type OnboardingChildDraft,
} from '@/lib/onboarding/childrenDetails';
import { setOnboardingChildrenPhoneCount } from '@/lib/onboarding/childrenPhoneCount';
import {
  DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
  setOnboardingChildrenScreenTime,
  type OnboardingChildScreenTime,
} from '@/lib/onboarding/childrenScreenTime';
import type { OnboardingChildSnapshot } from '@/lib/onboarding/persistOnboardingAccount';
import type { FirestoreUser, UserKidAgeScreenTime } from '@/types/firestore';

function parseKidAge(age: unknown): number | null {
  const n = Number.parseInt(String(age ?? ''), 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

function kidEntryToDraft(entry: UserKidAgeScreenTime | string): OnboardingChildDraft | null {
  if (typeof entry === 'string') {
    const age = parseKidAge(entry);
    if (age == null) return null;
    return { name: '', age, gender: 'girl' };
  }

  const age = parseKidAge(entry.age);
  if (age == null) return null;

  const gender: ChildGender = entry.gender === 'boy' ? 'boy' : 'girl';
  return {
    name: entry.name?.trim() ?? '',
    age,
    gender,
  };
}

function kidEntryToScreenTime(
  entry: UserKidAgeScreenTime | string,
  child: OnboardingChildDraft
): OnboardingChildScreenTime {
  const hours =
    typeof entry === 'object' &&
    entry != null &&
    typeof entry.dailyScreenTimeHours === 'number'
      ? entry.dailyScreenTimeHours
      : DEFAULT_ONBOARDING_SCREEN_TIME_HOURS;

  return {
    name: child.name.trim(),
    hours,
  };
}

/**
 * Apply Firestore user.kidsAges to funnel session storage — Firestore is canonical
 * (names, gender, age, screen time) whenever the profile has saved children.
 */
export function hydrateOnboardingChildrenFromUser(user: FirestoreUser): boolean {
  const kids = user.kidsAges ?? [];
  if (!kids.length) {
    return false;
  }

  const children: OnboardingChildDraft[] = [];
  for (const entry of kids) {
    const draft = kidEntryToDraft(entry as UserKidAgeScreenTime | string);
    if (draft) {
      children.push(draft);
    }
  }

  if (!children.length) {
    return false;
  }

  const screenTimes = children.map((child, index) =>
    kidEntryToScreenTime(kids[index] as UserKidAgeScreenTime | string, child)
  );

  setOnboardingChildrenDetails(children);
  setOnboardingChildrenPhoneCount(children.length);
  setOnboardingChildrenScreenTime(screenTimes);

  const snapshots: OnboardingChildSnapshot[] = children.map((child, index) => ({
    id: `draft-${index}`,
    name: child.name.trim(),
    age: String(child.age),
    gender: child.gender,
    dailyScreenTimeHours: screenTimes[index]?.hours ?? DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
  }));
  writeOnboardingJson('onboardingChildSnapshots', snapshots);

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'parentData',
      JSON.stringify({
        kidsAges: snapshots.map((s) => ({
          name: s.name,
          age: s.age,
          gender: s.gender,
          dailyScreenTimeHours: s.dailyScreenTimeHours,
        })),
        children: snapshots.map((s) => ({
          name: s.name,
          age: s.age,
          gender: s.gender,
          dailyScreenTimeHours: s.dailyScreenTimeHours,
        })),
      })
    );
  }

  return true;
}
