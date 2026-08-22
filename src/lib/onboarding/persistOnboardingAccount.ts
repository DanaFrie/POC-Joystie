import { createUser, getUser, updateUser } from '@/lib/api/users';
import {
  createScreenTimesFromChildren,
  DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
  getOnboardingChildrenScreenTime,
  type OnboardingChildScreenTime,
} from '@/lib/onboarding/childrenScreenTime';
import {
  getOnboardingChildrenDetails,
  type OnboardingChildDraft,
} from '@/lib/onboarding/childrenDetails';
import { readOnboardingJson, writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';
import {
  clearOnboardingTermsAccepted,
  readOnboardingTermsAccepted,
} from '@/lib/onboarding/oauthSession';
import {
  getOnboardingParentRole,
  parentRoleToGender,
} from '@/lib/onboarding/parentRole';
import { hasV03KidsAgesReady, ONBOARDING_RESUME_KIND_KEY } from '@/lib/auth/userOnboardingStatus';
import type { UserKidAgeScreenTime } from '@/types/firestore';
import { createSession } from '@/utils/session';
import { trackMetaSignupSuccess } from '@/utils/meta-pixel';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('OnboardingSignupPersist');

const ACCOUNT_CREATED_KEY = 'onboardingAccountCreated';
export const ONBOARDING_TERMS_KEY = 'onboardingTermsAccepted';

export type OnboardingChildSnapshot = {
  id: string;
  name: string;
  age: string;
  gender: 'boy' | 'girl';
  dailyScreenTimeHours: number;
};

export function splitDisplayName(displayName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

export function markOnboardingAccountCreated() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ACCOUNT_CREATED_KEY, '1');
  }
}

export function clearOnboardingAccountCreated() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ACCOUNT_CREATED_KEY);
  }
}

export function isOnboardingAccountCreated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ACCOUNT_CREATED_KEY) === '1';
}

/** Draft child ids from funnel session (no Firestore children until child opens their page). */
export function getOnboardingChildIds(): string[] {
  const snapshots = readOnboardingJson<OnboardingChildSnapshot[]>('onboardingChildSnapshots');
  return snapshots?.map((s) => s.id) ?? [];
}

function buildKidsAgesFromFunnel(
  children: OnboardingChildDraft[],
  screenTimes: OnboardingChildScreenTime[]
): UserKidAgeScreenTime[] {
  return children.map((child, index) => ({
    name: child.name.trim(),
    age: String(child.age),
    gender: child.gender,
    dailyScreenTimeHours: screenTimes[index]?.hours ?? DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
  }));
}

/** Keep funnel child data in session/local storage only — no Firestore children yet. */
function saveFunnelChildrenToSession(
  children: OnboardingChildDraft[],
  screenTimes: OnboardingChildScreenTime[]
): OnboardingChildSnapshot[] {
  const snapshots: OnboardingChildSnapshot[] = children.map((child, index) => ({
    id: `draft-${index}`,
    name: child.name.trim(),
    age: String(child.age),
    gender: child.gender,
    dailyScreenTimeHours: screenTimes[index]?.hours ?? DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
  }));

  writeOnboardingJson('onboardingChildSnapshots', snapshots);

  if (typeof window !== 'undefined') {
    const kidsAges = snapshots.map((s) => ({
      name: s.name,
      age: s.age,
      gender: s.gender,
      dailyScreenTimeHours: s.dailyScreenTimeHours,
    }));
    localStorage.setItem(
      'parentData',
      JSON.stringify({
        kidsAges,
        children: snapshots.map((s) => ({
          name: s.name,
          age: s.age,
          gender: s.gender,
          dailyScreenTimeHours: s.dailyScreenTimeHours,
        })),
      })
    );
  }

  return snapshots;
}

function readOnboardingPayload(options: {
  displayName?: string;
  firstName?: string;
  lastName?: string;
}) {
  const children = getOnboardingChildrenDetails() ?? [];
  let screenTimes = getOnboardingChildrenScreenTime();
  if (!screenTimes?.length && children.length) {
    screenTimes = createScreenTimesFromChildren(children);
  }
  screenTimes = screenTimes ?? [];

  const role = getOnboardingParentRole();
  const gender = role ? parentRoleToGender(role) : ('female' as const);
  const kidsAges = buildKidsAgesFromFunnel(children, screenTimes);

  const fromSplit = splitDisplayName(options.displayName?.trim() ?? '');
  const firstName = options.firstName?.trim() || fromSplit.firstName;
  const lastName = options.lastName?.trim() || fromSplit.lastName;

  return { children, screenTimes, gender, kidsAges, firstName, lastName };
}

function resolveTermsAccepted(_termsAccepted?: boolean): boolean {
  return true;
}

/**
 * After email or OAuth signup — persist parent profile from funnel data.
 * Children stay in session storage until the child opens their page.
 */
export async function persistOnboardingAccountAfterAuth(params: {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  termsAccepted?: boolean;
}): Promise<{ childSnapshots: OnboardingChildSnapshot[] }> {
  if (!resolveTermsAccepted(params.termsAccepted)) {
    throw new Error('יש לאשר את תנאי השימוש');
  }

  const { uid, email } = params;
  const { children, screenTimes, gender, kidsAges, firstName, lastName } =
    readOnboardingPayload(params);

  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();
  const existing = await getUser(uid, false);

  if (!existing) {
    await createUser(uid, {
      email: normalizedEmail,
      firstName,
      lastName,
      gender,
      kidsAges,
      termsAccepted: true,
      onboarding: false,
      signupDate: now,
    });
  } else {
    const resumeKind =
      typeof window !== 'undefined'
        ? sessionStorage.getItem(ONBOARDING_RESUME_KIND_KEY)
        : null;
    // Prefer Firestore kids on v03 resume / empty funnel drafts.
    // v02_legacy: allow funnel kidsAges to replace legacy string/partial kids.
    const preferExistingKids =
      (resumeKind === 'v03_resume' && hasV03KidsAgesReady(existing)) ||
      (!kidsAges.length && hasV03KidsAgesReady(existing));

    await updateUser(uid, {
      email: normalizedEmail || existing.email,
      firstName: firstName || existing.firstName,
      lastName: lastName || existing.lastName,
      gender: existing.gender || gender,
      kidsAges: preferExistingKids
        ? existing.kidsAges?.length
          ? existing.kidsAges
          : kidsAges
        : kidsAges.length
          ? kidsAges
          : existing.kidsAges,
      termsAccepted: true,
    });
  }

  let childSnapshots: OnboardingChildSnapshot[] = [];
  if (children.length) {
    childSnapshots = saveFunnelChildrenToSession(children, screenTimes);
  }

  clearOnboardingTermsAccepted();

  createSession(uid);
  markOnboardingAccountCreated();

  try {
    trackMetaSignupSuccess({ content_name: 'onboarding_signup' });
  } catch (error) {
    logger.warn('Meta tracking failed:', error);
  }

  try {
    const { logEventOnce, AnalyticsEvents, setUserId } = await import('@/utils/analytics');
    await setUserId(uid);
    await logEventOnce(`signup:${uid}`, AnalyticsEvents.SIGNUP, {
      method: 'onboarding',
    });
  } catch (error) {
    logger.warn('Signup analytics failed:', error);
  }

  return { childSnapshots };
}

/**
 * Write funnel session kidsAges (v0.3 shape) onto an existing Firestore user.
 * Also mirrors kidsAges onto existing `children` docs so dashboard UI matches.
 */
export async function syncFunnelKidsAgesToUser(
  uid: string
): Promise<UserKidAgeScreenTime[] | null> {
  const children = getOnboardingChildrenDetails() ?? [];
  if (!children.length) return null;

  let screenTimes = getOnboardingChildrenScreenTime();
  if (!screenTimes?.length) {
    screenTimes = createScreenTimesFromChildren(children);
  }
  const kidsAges = buildKidsAgesFromFunnel(children, screenTimes ?? []);
  if (!kidsAges.length) return null;

  saveFunnelChildrenToSession(children, screenTimes ?? []);
  await updateUser(uid, { kidsAges, termsAccepted: true });

  try {
    const { getChildrenByParent, updateChild } = await import('@/lib/api/children');
    const childDocs = await getChildrenByParent(uid);
    if (childDocs.length) {
      const user = await getUser(uid, false);
      const ordered = [...childDocs];
      if (user?.primaryChildId) {
        ordered.sort((a, b) => {
          if (a.id === user.primaryChildId) return -1;
          if (b.id === user.primaryChildId) return 1;
          return 0;
        });
      }
      const limit = Math.min(ordered.length, kidsAges.length);
      for (let i = 0; i < limit; i++) {
        const kid = kidsAges[i];
        await updateChild(
          ordered[i].id,
          {
            name: kid.name?.trim() || ordered[i].name,
            age: String(kid.age ?? ordered[i].age ?? ''),
            gender: kid.gender === 'girl' ? 'girl' : 'boy',
            ...(typeof kid.dailyScreenTimeHours === 'number'
              ? { baselineDailyMinutes: Math.round(kid.dailyScreenTimeHours * 60) }
              : {}),
          },
          uid
        );
      }
    }
  } catch (error) {
    logger.warn('Could not mirror kidsAges onto children docs', error);
  }

  return kidsAges;
}
