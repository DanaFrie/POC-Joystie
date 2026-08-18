/**
 * RTDB public bonding snapshot — lets child device discover parent's game room
 * without a deployed Firestore callable (local dev + fallback).
 */
import { ref, set, get, remove, onValue, type Unsubscribe } from 'firebase/database';
import { getDatabaseInstance } from '@/lib/firebase';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('BondingPublic');

export type OnboardingBondingMetaRecord = {
  childName: string;
  childGender?: 'boy' | 'girl';
  parentName: string;
  parentGender?: 'female' | 'male';
  updatedAt: string;
};

export type OnboardingBondingPublicRecord = OnboardingBondingMetaRecord & {
  roomId: string;
  joinCode: string;
};

const metaPathFor = (parentId: string) => `onboardingBondingMeta/${parentId}`;
const publicPathFor = (parentId: string) => `onboardingBondingPublic/${parentId}`;

export async function publishOnboardingBondingMeta(
  parentId: string,
  record: Omit<OnboardingBondingMetaRecord, 'updatedAt'>
): Promise<void> {
  const db = await getDatabaseInstance();
  await set(ref(db, metaPathFor(parentId)), {
    ...record,
    updatedAt: new Date().toISOString(),
  });
  logger.log('publishMeta', { parentId, childName: record.childName });
}

export async function readOnboardingBondingMeta(
  parentId: string
): Promise<OnboardingBondingMetaRecord | null> {
  try {
    const db = await getDatabaseInstance();
    const snap = await get(ref(db, metaPathFor(parentId)));
    if (!snap.exists()) return null;
    const raw = snap.val() as OnboardingBondingMetaRecord;
    if (!raw?.childName) return null;
    return raw;
  } catch {
    return null;
  }
}

export async function publishOnboardingBondingPublic(
  parentId: string,
  record: Omit<OnboardingBondingPublicRecord, 'updatedAt'>
): Promise<void> {
  const db = await getDatabaseInstance();
  const payload = {
    ...record,
    updatedAt: new Date().toISOString(),
  };
  await set(ref(db, publicPathFor(parentId)), payload);
  await set(ref(db, metaPathFor(parentId)), {
    childName: record.childName,
    childGender: record.childGender,
    parentName: record.parentName,
    parentGender: record.parentGender,
    updatedAt: payload.updatedAt,
  });
  logger.log('publish', { parentId, roomId: record.roomId });
}

/** Drop bonding public + meta snapshots after onboarding completes. */
export async function clearOnboardingBondingSnapshots(parentId: string): Promise<void> {
  const db = await getDatabaseInstance();
  await Promise.all([
    remove(ref(db, publicPathFor(parentId))),
    remove(ref(db, metaPathFor(parentId))),
  ]);
  logger.log('clearSnapshots', { parentId });
}

export async function readOnboardingBondingPublic(
  parentId: string
): Promise<OnboardingBondingPublicRecord | null> {
  const db = await getDatabaseInstance();
  const snap = await get(ref(db, publicPathFor(parentId)));
  if (!snap.exists()) return null;
  const raw = snap.val() as OnboardingBondingPublicRecord;
  if (!raw?.roomId || !raw?.joinCode) return null;
  return raw;
}

/** Live public room pointer — child follows if the parent republishes a new room. */
export function subscribeOnboardingBondingPublic(
  parentId: string,
  onChange: (record: OnboardingBondingPublicRecord | null) => void
): Unsubscribe {
  let unsub: Unsubscribe | null = null;
  let cancelled = false;

  void getDatabaseInstance().then((db) => {
    if (cancelled) return;
    const publicRef = ref(db, publicPathFor(parentId));
    unsub = onValue(publicRef, (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      const raw = snap.val() as OnboardingBondingPublicRecord;
      if (!raw?.roomId || !raw?.joinCode) {
        onChange(null);
        return;
      }
      onChange(raw);
    });
  });

  return () => {
    cancelled = true;
    if (unsub) unsub();
  };
}
