/**
 * RTDB child funnel milestones — parent subscribes while waiting.
 */
import { ref, onValue, update, get, remove, type Unsubscribe } from 'firebase/database';
import { getDatabaseInstance } from '@/lib/firebase';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ChildProgress');

export type OnboardingChildProgress = {
  linkOpened?: boolean;
  linkOpenedAt?: string;
  welcomeReached?: boolean;
  welcomeReachedAt?: string;
  doriRevealed?: boolean;
  doriRevealedAt?: string;
  eggComplete?: boolean;
  eggCompleteAt?: string;
  missionReady?: boolean;
  missionReadyAt?: string;
  /** Post-game — child confirmed castle change (tick). */
  changeSelected?: boolean;
  changeSelectedText?: string | null;
  changeSelectedAt?: string;
  /** Post-game — child accepted parent's additional change. */
  parentChangeAccepted?: boolean;
  /** Post-game — child declined parent's additional change (negotiation loop). */
  parentChangeDeclined?: boolean;
  parentChangeRespondedAt?: string | null;
  /** Post-game — child finished selfie mission. */
  selfieMissionDone?: boolean;
  selfieMissionDoneAt?: string;
  updatedAt?: string;
};

const pathFor = (parentId: string) => `onboardingChildProgress/${parentId}`;

/** Firebase RTDB rejects `undefined` — coerce clears to `null`. */
function sanitizeChildProgressPatch(
  patch: Partial<OnboardingChildProgress>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value]) => [key, value === undefined ? null : value])
  );
}

export async function resetOnboardingChildProgress(parentId: string): Promise<void> {
  const db = await getDatabaseInstance();
  await update(ref(db, pathFor(parentId)), {
    linkOpened: false,
    linkOpenedAt: null,
    welcomeReached: false,
    welcomeReachedAt: null,
    doriRevealed: false,
    doriRevealedAt: null,
    eggComplete: false,
    eggCompleteAt: null,
    missionReady: false,
    missionReadyAt: null,
    changeSelected: false,
    changeSelectedText: null,
    changeSelectedAt: null,
    parentChangeAccepted: false,
    parentChangeDeclined: false,
    parentChangeRespondedAt: null,
    selfieMissionDone: false,
    selfieMissionDoneAt: null,
    updatedAt: new Date().toISOString(),
  });
  logger.log('reset', { parentId });
}

/** Drop child funnel RTDB after onboarding completes. */
export async function removeOnboardingChildProgress(parentId: string): Promise<void> {
  const db = await getDatabaseInstance();
  await remove(ref(db, pathFor(parentId)));
  logger.log('remove', { parentId });
}

export async function publishOnboardingChildProgress(
  parentId: string,
  patch: Partial<OnboardingChildProgress>
): Promise<void> {
  const db = await getDatabaseInstance();
  const now = new Date().toISOString();
  await update(ref(db, pathFor(parentId)), {
    ...sanitizeChildProgressPatch(patch),
    updatedAt: now,
  });
  logger.log('publish', { parentId, ...patch });
}

export async function clearChildParentChangeResponse(parentId: string): Promise<void> {
  await publishOnboardingChildProgress(parentId, {
    parentChangeDeclined: false,
    parentChangeAccepted: false,
    parentChangeRespondedAt: null,
  });
}

export async function readOnboardingChildProgress(
  parentId: string
): Promise<OnboardingChildProgress | null> {
  const db = await getDatabaseInstance();
  const snap = await get(ref(db, pathFor(parentId)));
  if (!snap.exists()) return null;
  return snap.val() as OnboardingChildProgress;
}

export function subscribeOnboardingChildProgress(
  parentId: string,
  onChange: (progress: OnboardingChildProgress | null) => void
): Unsubscribe {
  let cancelled = false;
  let innerUnsub: Unsubscribe | undefined;

  void getDatabaseInstance().then((db) => {
    if (cancelled) return;
    innerUnsub = onValue(ref(db, pathFor(parentId)), (snap) => {
      if (cancelled) return;
      onChange(snap.exists() ? (snap.val() as OnboardingChildProgress) : null);
    });
  });

  return () => {
    cancelled = true;
    innerUnsub?.();
  };
}
