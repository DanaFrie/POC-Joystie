import type { FirestoreChild, FirestoreUser, UserKidAgeScreenTime } from '@/types/firestore';

/** Session flag: how the current onboarding resume was prepared. */
export const ONBOARDING_RESUME_KIND_KEY = 'onboardingResumeKind';

/**
 * How a logged-in Firestore user should be routed for v0.3 onboarding / login.
 *
 * - complete: `onboarding === true` → dashboard
 * - v03_resume: has v0.3-shaped kidsAges, not finished → signupIntro + hydrate
 * - v02_legacy: pre-v0.3 profile (string ages / children docs / primaryChildId) without v0.3 kids shape
 * - fresh: Auth session but nothing to resume from
 */
export type UserOnboardingRouteKind =
  | 'complete'
  | 'v03_resume'
  | 'v02_legacy'
  | 'fresh';

export type ClassifyUserOnboardingOptions = {
  /** When known, children collection docs for this parent. */
  children?: FirestoreChild[] | null;
};

function isKidObject(entry: unknown): entry is UserKidAgeScreenTime {
  return entry != null && typeof entry === 'object' && 'age' in entry;
}

/** True when kidsAges has at least one v0.3 object entry (age + name/gender/hours). */
export function hasV03KidsAgesReady(user: Pick<FirestoreUser, 'kidsAges'>): boolean {
  const kids = user.kidsAges ?? [];
  if (!kids.length) return false;

  return kids.some((entry) => {
    if (!isKidObject(entry)) return false;
    const age = String(entry.age ?? '').trim();
    if (!age) return false;
    const hasName = Boolean(entry.name?.trim());
    const hasGender = entry.gender === 'boy' || entry.gender === 'girl';
    const hasHours = typeof entry.dailyScreenTimeHours === 'number';
    // Enough to resume post-auth carousel: age plus any v0.3 field beyond bare age.
    return hasName || hasGender || hasHours;
  });
}

export function hasLegacyStringKidsAges(user: Pick<FirestoreUser, 'kidsAges'>): boolean {
  const kids = (user.kidsAges ?? []) as unknown[];
  return kids.some((entry) => typeof entry === 'string' && entry.trim().length > 0);
}

export function classifyUserOnboarding(
  user: FirestoreUser,
  options?: ClassifyUserOnboardingOptions
): UserOnboardingRouteKind {
  if (user.onboarding === true) {
    return 'complete';
  }

  if (hasV03KidsAgesReady(user)) {
    return 'v03_resume';
  }

  const children = options?.children ?? null;
  const hasChildrenDocs = Boolean(children?.length);
  if (
    hasChildrenDocs ||
    hasLegacyStringKidsAges(user) ||
    Boolean(user.primaryChildId?.trim())
  ) {
    return 'v02_legacy';
  }

  return 'fresh';
}

/** Build v0.3 kidsAges from Firestore children (v0.2 migration). */
export function kidsAgesFromChildrenDocs(
  children: FirestoreChild[]
): UserKidAgeScreenTime[] {
  return children.map((child) => ({
    name: child.name?.trim() ?? '',
    age: String(child.age ?? '').trim() || '8',
    gender: child.gender === 'boy' ? 'boy' : 'girl',
    dailyScreenTimeHours:
      typeof child.baselineDailyMinutes === 'number' && child.baselineDailyMinutes > 0
        ? Math.round((child.baselineDailyMinutes / 60) * 10) / 10
        : 3,
  }));
}
