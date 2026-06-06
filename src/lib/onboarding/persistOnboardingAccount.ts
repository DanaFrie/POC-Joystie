import { createChild, getChildrenByParent } from '@/lib/api/children';
import { createUser, getUser, updateUser } from '@/lib/api/users';
import {
  createScreenTimesFromChildren,
  getOnboardingChildrenScreenTime,
  type OnboardingChildScreenTime,
} from '@/lib/onboarding/childrenScreenTime';
import {
  getOnboardingChildrenDetails,
  type OnboardingChildDraft,
} from '@/lib/onboarding/childrenDetails';
import { writeOnboardingJson } from '@/lib/onboarding/onboardingStorage';
import {
  getOnboardingParentRole,
  parentRoleToGender,
} from '@/lib/onboarding/parentRole';
import { createSession } from '@/utils/session';
import { trackMetaCompleteRegistration } from '@/utils/meta-pixel';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('OnboardingSignupPersist');

const CHILD_IDS_STORAGE_KEY = 'onboardingChildIds';
const ACCOUNT_CREATED_KEY = 'onboardingAccountCreated';

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

export function isOnboardingAccountCreated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ACCOUNT_CREATED_KEY) === '1';
}

export function getOnboardingChildIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(CHILD_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

function setOnboardingChildIds(ids: string[]) {
  writeOnboardingJson(CHILD_IDS_STORAGE_KEY, ids);
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
  const kidsAges = children.map((c) => String(c.age));

  const fromSplit = splitDisplayName(options.displayName?.trim() ?? '');
  const firstName = options.firstName?.trim() || fromSplit.firstName;
  const lastName = options.lastName?.trim() || fromSplit.lastName;

  return { children, screenTimes, gender, kidsAges, firstName, lastName };
}

async function syncChildrenToFirestore(
  parentId: string,
  children: OnboardingChildDraft[],
  screenTimes: OnboardingChildScreenTime[]
): Promise<OnboardingChildSnapshot[]> {
  const existing = await getChildrenByParent(parentId);
  if (existing.length >= children.length && existing.length > 0) {
    const snapshots = existing.slice(0, children.length).map((doc, index) => ({
      id: doc.id,
      name: doc.name || children[index]?.name.trim() || '',
      age: doc.age || String(children[index]?.age ?? ''),
      gender: doc.gender,
      dailyScreenTimeHours: screenTimes[index]?.hours ?? 1,
    }));
    setOnboardingChildIds(snapshots.map((s) => s.id));
    return snapshots;
  }

  const snapshots: OnboardingChildSnapshot[] = [];

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index]!;
    const hours = screenTimes[index]?.hours ?? (index === 0 ? 1 : 2);
    const childId = await createChild({
      parentId,
      name: child.name.trim(),
      age: String(child.age),
      gender: child.gender,
      deviceType: 'ios',
    });
    snapshots.push({
      id: childId,
      name: child.name.trim(),
      age: String(child.age),
      gender: child.gender,
      dailyScreenTimeHours: hours,
    });
  }

  setOnboardingChildIds(snapshots.map((s) => s.id));
  writeOnboardingJson('onboardingChildSnapshots', snapshots);

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'parentData',
      JSON.stringify({
        kidsAges: snapshots.map((s) => s.age),
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

/**
 * After email or OAuth signup — persist parent profile + children from funnel data.
 */
export async function persistOnboardingAccountAfterAuth(params: {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ childSnapshots: OnboardingChildSnapshot[] }> {
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
      notificationsEnabled: true,
      termsAccepted: true,
      signupDate: now,
    });
  } else {
    await updateUser(uid, {
      email: normalizedEmail || existing.email,
      firstName: firstName || existing.firstName,
      lastName: lastName || existing.lastName,
      gender: existing.gender || gender,
      kidsAges: kidsAges.length ? kidsAges : existing.kidsAges,
      termsAccepted: true,
    });
  }

  let childSnapshots: OnboardingChildSnapshot[] = [];
  if (children.length) {
    try {
      childSnapshots = await syncChildrenToFirestore(uid, children, screenTimes);
    } catch (error) {
      logger.error('Failed to sync children:', error);
    }
  }

  createSession(uid);
  markOnboardingAccountCreated();

  try {
    trackMetaCompleteRegistration({ content_name: 'onboarding_signup' });
  } catch (error) {
    logger.warn('Meta tracking failed:', error);
  }

  try {
    const { logEvent, AnalyticsEvents, setUserId } = await import('@/utils/analytics');
    await setUserId(uid);
    await logEvent(AnalyticsEvents.SIGNUP, {
      user_id: uid,
      email: normalizedEmail,
    });
  } catch (error) {
    logger.warn('Signup analytics failed:', error);
  }

  return { childSnapshots };
}
