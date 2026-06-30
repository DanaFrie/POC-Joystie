/**
 * RTDB child funnel milestones — parent subscribes while waiting.
 */
import { ref, onValue, update, get, type Unsubscribe } from 'firebase/database';
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
  updatedAt?: string;
};

const pathFor = (parentId: string) => `onboardingChildProgress/${parentId}`;

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
    updatedAt: new Date().toISOString(),
  });
  logger.log('reset', { parentId });
}

export async function publishOnboardingChildProgress(
  parentId: string,
  patch: Partial<OnboardingChildProgress>
): Promise<void> {
  const db = await getDatabaseInstance();
  const now = new Date().toISOString();
  await update(ref(db, pathFor(parentId)), {
    ...patch,
    updatedAt: now,
  });
  logger.log('publish', { parentId, ...patch });
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
      onChange(snap.exists() ? (snap.val() as OnboardingChildProgress) : null);
    });
  });

  return () => {
    cancelled = true;
    innerUnsub?.();
  };
}
