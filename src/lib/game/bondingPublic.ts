/**
 * RTDB public bonding snapshot — lets child device discover parent's game room
 * without a deployed Firestore callable (local dev + fallback).
 */
import { ref, set, get } from 'firebase/database';
import { getDatabaseInstance } from '@/lib/firebase';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('BondingPublic');

export type OnboardingBondingMetaRecord = {
  childName: string;
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
    parentName: record.parentName,
    parentGender: record.parentGender,
    updatedAt: payload.updatedAt,
  });
  logger.log('publish', { parentId, roomId: record.roomId });
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
