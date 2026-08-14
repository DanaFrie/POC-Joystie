/**
 * RTDB parent post-game milestones — child subscribes while on suggested-change screens.
 */
import { ref, onValue, update, get, remove, type Unsubscribe } from 'firebase/database';
import { getDatabaseInstance } from '@/lib/firebase';
import { getCurrentUserId } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ParentProgress');

export type OnboardingParentProgress = {
  /** Parent approved child's change with no additional suggestion. */
  childChangeApproved?: boolean;
  childChangeApprovedAt?: string | null;
  /** Pending parent additional change — shown on child suggested-change card. */
  additionalChangeText?: string | null;
  additionalChangeProposedAt?: string | null;
  /** True after first additional proposal — decline loop skips reviewChange. */
  additionalNegotiationStarted?: boolean;
  updatedAt?: string;
};

const pathFor = (parentId: string) => `onboardingParentProgress/${parentId}`;

async function assertParentProgressWriteAuth(parentId: string): Promise<void> {
  const uid = await getCurrentUserId();
  if (!uid || uid !== parentId) {
    throw new Error('PERMISSION_DENIED');
  }
}

export async function resetOnboardingParentProgress(parentId: string): Promise<void> {
  await assertParentProgressWriteAuth(parentId);
  const db = await getDatabaseInstance();
  await update(ref(db, pathFor(parentId)), {
    childChangeApproved: false,
    childChangeApprovedAt: null,
    additionalChangeText: null,
    additionalChangeProposedAt: null,
    additionalNegotiationStarted: false,
    updatedAt: new Date().toISOString(),
  });
  logger.log('reset', { parentId });
}

/** Drop parent funnel RTDB after onboarding completes. */
export async function removeOnboardingParentProgress(parentId: string): Promise<void> {
  await assertParentProgressWriteAuth(parentId);
  const db = await getDatabaseInstance();
  await remove(ref(db, pathFor(parentId)));
  logger.log('remove', { parentId });
}

export async function publishOnboardingParentProgress(
  parentId: string,
  patch: Partial<OnboardingParentProgress>
): Promise<void> {
  await assertParentProgressWriteAuth(parentId);
  const db = await getDatabaseInstance();
  const now = new Date().toISOString();
  await update(ref(db, pathFor(parentId)), {
    ...patch,
    updatedAt: now,
  });
  logger.log('publish', { parentId, ...patch });
}

export async function readOnboardingParentProgress(
  parentId: string
): Promise<OnboardingParentProgress | null> {
  const db = await getDatabaseInstance();
  const snap = await get(ref(db, pathFor(parentId)));
  if (!snap.exists()) return null;
  return snap.val() as OnboardingParentProgress;
}

export function subscribeOnboardingParentProgress(
  parentId: string,
  onChange: (progress: OnboardingParentProgress | null) => void
): Unsubscribe {
  let cancelled = false;
  let innerUnsub: Unsubscribe | undefined;

  void getDatabaseInstance().then((db) => {
    if (cancelled) return;
    innerUnsub = onValue(ref(db, pathFor(parentId)), (snap) => {
      if (cancelled) return;
      onChange(snap.exists() ? (snap.val() as OnboardingParentProgress) : null);
    });
  });

  return () => {
    cancelled = true;
    innerUnsub?.();
  };
}
