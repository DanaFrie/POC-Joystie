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
import { kidsAgesFromChildrenDocs } from '@/lib/auth/userOnboardingStatus';
import type {
  FirestoreChild,
  FirestoreUser,
  UserKidAgeScreenTime,
} from '@/types/firestore';

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

function applyHydratedChildren(
  children: OnboardingChildDraft[],
  screenTimes: OnboardingChildScreenTime[],
  snapshotIds?: string[]
): boolean {
  if (!children.length) return false;

  setOnboardingChildrenDetails(children);
  setOnboardingChildrenPhoneCount(children.length);
  setOnboardingChildrenScreenTime(screenTimes);

  const snapshots: OnboardingChildSnapshot[] = children.map((child, index) => ({
    id: snapshotIds?.[index] ?? `draft-${index}`,
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
  const screenTimes: OnboardingChildScreenTime[] = [];
  for (const entry of kids) {
    const draft = kidEntryToDraft(entry as UserKidAgeScreenTime | string);
    if (!draft?.name.trim()) continue;
    children.push(draft);
    screenTimes.push(kidEntryToScreenTime(entry as UserKidAgeScreenTime | string, draft));
  }

  if (!children.length) {
    return false;
  }

  return applyHydratedChildren(children, screenTimes);
}

/**
 * v0.2 fallback — seed funnel session from `children` collection docs
 * (not from funnel drafts / signup-in-progress local storage).
 */
export function hydrateOnboardingChildrenFromChildrenDocs(
  childrenDocs: FirestoreChild[]
): boolean {
  if (!childrenDocs.length) return false;

  const kidsAges = kidsAgesFromChildrenDocs(childrenDocs);
  const children: OnboardingChildDraft[] = [];
  const screenTimes: OnboardingChildScreenTime[] = [];

  for (let i = 0; i < kidsAges.length; i++) {
    const draft = kidEntryToDraft(kidsAges[i]);
    if (!draft?.name.trim()) continue;
    children.push(draft);
    screenTimes.push(kidEntryToScreenTime(kidsAges[i], draft));
  }

  return applyHydratedChildren(
    children,
    screenTimes,
    childrenDocs.map((c) => c.id)
  );
}

/**
 * Named kidsAges first; otherwise `children` docs. Never seeds Figma placeholders.
 */
export async function hydrateSessionChildrenFromAccount(
  user: FirestoreUser,
  childrenDocs?: FirestoreChild[] | null
): Promise<boolean> {
  if (hydrateOnboardingChildrenFromUser(user)) return true;

  let docs = childrenDocs;
  if (docs == null) {
    try {
      const { getChildrenByParent } = await import('@/lib/api/children');
      docs = await getChildrenByParent(user.id);
    } catch {
      docs = [];
    }
  }
  if (docs.length) {
    return hydrateOnboardingChildrenFromChildrenDocs(docs);
  }
  return false;
}

/** Drop local funnel child drafts so a signup-existing / v0.2 path cannot overwrite Firestore. */
export function clearOnboardingChildrenSession(): void {
  if (typeof window === 'undefined') return;
  const keys = [
    'onboardingChildrenDetails',
    'onboardingChildrenPhoneCount',
    'onboardingChildrenScreenTime',
    'onboardingChildSnapshots',
    'parentData',
  ];
  for (const key of keys) {
    sessionStorage.removeItem(key);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore quota / private mode
    }
  }
}
