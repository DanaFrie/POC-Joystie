import {
  buildChangeDayCheckRows,
} from '@/lib/onboarding/changeDayChecks';
import { createChild, getChildrenByParent, updateChild } from '@/lib/api/children';
import { updateUser, getUser } from '@/lib/api/users';
import { getLatestBondingInviteForParent } from '@/lib/api/bondingInvites';
import { readOnboardingChildProgress } from '@/lib/onboarding/childProgress';
import { readOnboardingParentProgress } from '@/lib/onboarding/parentProgress';
import {
  DEFAULT_ONBOARDING_SCREEN_TIME_HOURS,
  getOnboardingChildrenScreenTime,
} from '@/lib/onboarding/childrenScreenTime';
import { getOnboardingChildrenDetails } from '@/lib/onboarding/childrenDetails';
import {
  getOnboardingFirstChildIndex,
  getSignupPickChildOptions,
} from '@/lib/onboarding/pickFirstChild';
import type { FirestoreChild, UserKidAgeScreenTime } from '@/types/firestore';
import { getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('FinalizeOnboardingCompletion');

function collectOnboardingChanges(
  childText: string | null | undefined,
  parentText: string | null | undefined
): string[] {
  const changes: string[] = [];
  const first = childText?.trim();
  if (first) changes.push(first);
  const second = parentText?.trim();
  if (second && second !== first) changes.push(second);
  return changes.slice(0, 2);
}

/**
 * Prefer Firestore kidsAges (canonical after signup). Session drafts only fill gaps
 * during the same browser session before kidsAges is written.
 */
function resolveSelectedChildDraft(kidsAges: UserKidAgeScreenTime[] | undefined): {
  name: string;
  age: string;
  gender: 'boy' | 'girl';
  baselineDailyMinutes: number;
} {
  const index = getOnboardingFirstChildIndex() ?? 0;
  const kidAge = kidsAges?.[index] ?? kidsAges?.[0];
  const drafts = getOnboardingChildrenDetails();
  const times = getOnboardingChildrenScreenTime();
  const pick = getSignupPickChildOptions()[index];
  const draft = drafts?.[index];

  const name =
    kidAge?.name?.trim() ||
    draft?.name?.trim() ||
    pick?.name?.trim() ||
    'ילד/ה';

  const gender: 'boy' | 'girl' =
    kidAge?.gender === 'girl' || kidAge?.gender === 'boy'
      ? kidAge.gender
      : draft?.gender === 'girl' || draft?.gender === 'boy'
        ? draft.gender
        : pick?.gender === 'girl'
          ? 'girl'
          : 'boy';

  const age =
    kidAge?.age != null
      ? String(kidAge.age)
      : draft?.age != null
        ? String(draft.age)
        : '';

  const hours =
    (typeof kidAge === 'object' &&
    kidAge &&
    typeof kidAge.dailyScreenTimeHours === 'number'
      ? kidAge.dailyScreenTimeHours
      : undefined) ??
    times?.[index]?.hours ??
    pick?.hours ??
    DEFAULT_ONBOARDING_SCREEN_TIME_HOURS;

  return {
    name: name.trim() || 'ילד/ה',
    age,
    gender,
    baselineDailyMinutes: Math.round(Number(hours) * 60),
  };
}

/**
 * On appear of parent onboarding completion:
 * - create (or update) the selected child with onboarding changes (1–2)
 * - set onboarding=true + subscription.status=freemium
 * - persist primaryChildId / link bonding invite in Firestore (no sessionStorage)
 */
export async function finalizeParentOnboardingOnCompletionAppear(): Promise<{
  childId: string | null;
}> {
  const parentId = await getCurrentUserIdAsync();
  if (!parentId) {
    logger.warn('No parent uid — skip finalize');
    return { childId: null };
  }

  const user = await getUser(parentId, false);
  const selected = resolveSelectedChildDraft(user?.kidsAges);

  let childProgress = null;
  let parentProgress = null;
  try {
    [childProgress, parentProgress] = await Promise.all([
      readOnboardingChildProgress(parentId),
      readOnboardingParentProgress(parentId),
    ]);
  } catch (error) {
    logger.warn('Could not read RTDB changes:', error);
  }

  const changes = collectOnboardingChanges(
    childProgress?.changeSelectedText,
    parentProgress?.additionalChangeText
  );

  const existing = await getChildrenByParent(parentId);
  let child: FirestoreChild | null =
    (user?.primaryChildId
      ? existing.find((c) => c.id === user.primaryChildId)
      : undefined) ??
    existing.find((c) => c.name.trim() === selected.name) ??
    existing[0] ??
    null;

  /** Merge onboarding texts into child.changes (max 2), preserving order. */
  const mergeChanges = (current: string[] | undefined, incoming: string[]): string[] => {
    const out: string[] = [];
    for (const raw of [...(current ?? []), ...incoming]) {
      const text = raw.trim();
      if (!text || out.includes(text)) continue;
      out.push(text);
      if (out.length >= 2) break;
    }
    return out;
  };

  if (!child) {
    const changeDayChecks = buildChangeDayCheckRows(changes.length);
    const childId = await createChild({
      parentId,
      name: selected.name,
      age: selected.age,
      gender: selected.gender,
      changes,
      changeDayChecks,
      baselineDailyMinutes: selected.baselineDailyMinutes,
    });
    child = {
      id: childId,
      parentId,
      name: selected.name,
      age: selected.age,
      gender: selected.gender,
      changes,
      changeDayChecks,
      baselineDailyMinutes: selected.baselineDailyMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    logger.log('Created child on completion', { childId, changes: changes.length });
  } else {
    const patch: Partial<FirestoreChild> = {
      name: selected.name || child.name,
      age: selected.age || child.age,
      gender: selected.gender || child.gender,
      baselineDailyMinutes: selected.baselineDailyMinutes || child.baselineDailyMinutes,
    };

    const mergedChanges = mergeChanges(child.changes, changes);
    const prevCount = child.changes?.length ?? 0;
    if (mergedChanges.length > prevCount) {
      patch.changes = mergedChanges;
      const existingChecks = child.changeDayChecks ?? [];
      if (mergedChanges.length > existingChecks.length) {
        patch.changeDayChecks = [
          ...existingChecks,
          ...buildChangeDayCheckRows(mergedChanges.length - existingChecks.length),
        ];
      } else if (existingChecks.length === 0 && mergedChanges.length > 0) {
        patch.changeDayChecks = buildChangeDayCheckRows(mergedChanges.length);
      }
    } else if (changes.length && prevCount === 0) {
      patch.changes = changes;
      patch.changeDayChecks = buildChangeDayCheckRows(changes.length);
    }

    await updateChild(child.id, patch, parentId);
    logger.log('Updated child on completion', {
      childId: child.id,
      changes: patch.changes?.length ?? prevCount,
    });
  }

  // Link bonding invite from Firestore (not sessionStorage).
  let bondingInviteId = user?.bondingInviteId?.trim() || null;
  try {
    const invite = bondingInviteId
      ? await (async () => {
          const { getFirestoreInstance } = await import('@/lib/firebase');
          const { doc, getDoc } = await import('firebase/firestore');
          const db = await getFirestoreInstance();
          const snap = await getDoc(doc(db, 'bonding_invites', bondingInviteId!));
          if (snap.exists()) {
            return { id: snap.id, ...(snap.data() as { childId?: string }) };
          }
          return getLatestBondingInviteForParent(parentId);
        })()
      : await getLatestBondingInviteForParent(parentId);

    if (invite?.id) {
      bondingInviteId = invite.id;
      if (child.id && invite.childId !== child.id) {
        const { getFirestoreInstance } = await import('@/lib/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');
        const db = await getFirestoreInstance();
        await updateDoc(doc(db, 'bonding_invites', invite.id), {
          childId: child.id,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    logger.warn('Could not link bonding invite to child:', error);
  }

  const now = new Date().toISOString();
  const existingStatus = user?.subscription?.status;
  const keepPaid =
    existingStatus === 'trialing' ||
    existingStatus === 'active' ||
    existingStatus === 'checkout_pending';

  await updateUser(parentId, {
    onboarding: true,
    primaryChildId: child.id,
    ...(bondingInviteId ? { bondingInviteId } : {}),
    ...(keepPaid
      ? {}
      : {
          subscription: {
            provider: 'none' as const,
            status: 'freemium' as const,
            updatedAt: now,
          },
        }),
  });

  try {
    const { consumeOnboardingInviteRecords } = await import(
      '@/lib/onboarding/consumeOnboardingInvite'
    );
    await consumeOnboardingInviteRecords({
      parentId,
      inviteId: bondingInviteId,
    });
  } catch (error) {
    logger.warn('Could not consume onboarding invite records:', error);
  }

  try {
    const { trackMetaOnboardingComplete } = await import('@/utils/meta-pixel');
    trackMetaOnboardingComplete({ content_name: 'parent_onboarding_complete' });
  } catch (error) {
    logger.warn('Meta onboarding-complete tracking failed:', error);
  }

  return { childId: child.id };
}
