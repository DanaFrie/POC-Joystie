/**
 * RTDB bonding invites — localhost + intgr App Hosting (callable-free).
 * Production uses Firestore via `recordBondingInvite` / `resolveBondingInvite`.
 */
import { get, ref, set, update } from 'firebase/database';
import { FirebaseError } from 'firebase/app';
import { getDatabaseInstance } from '@/lib/firebase';
import { getBondingShareBaseUrl } from '@/lib/share/bondingBaseUrl';
import { getUser } from '@/lib/api/users';
import { ONBOARDING_CHILD_PATH } from '@/utils/url-encoding';
import { getCurrentUserId } from '@/utils/auth';
import {
  INVITE_COMPLETED_ERROR_MESSAGE,
  INVITE_EXPIRED_ERROR_MESSAGE,
} from '@/lib/onboarding/inviteAccessErrors';

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type LocalRecordBondingInviteInput = {
  childId?: string;
  challengeId?: string;
  childName?: string;
  parentName?: string;
  baseUrl?: string;
};

export type LocalRecordBondingInviteResult = {
  inviteId: string;
  childUrl: string;
  whatsappShareUrl: string;
};

export type LocalResolveBondingInviteResult = {
  inviteId: string;
  parentId: string;
  childId: string | null;
  challengeId: string | null;
  childName: string | null;
  parentName: string | null;
};

export type LocalBondingInviteRecord = {
  parentId: string;
  childId?: string;
  challengeId?: string;
  childName?: string;
  parentName?: string;
  status?: 'pending_share' | 'shared' | 'child_opened' | 'completed';
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
};

function invitePath(inviteId: string): string {
  return `onboardingBondingInvites/${inviteId}`;
}

/** RTDB rejects `undefined` — omit optional fields when absent. */
function buildInviteRecord(
  parentId: string,
  input: LocalRecordBondingInviteInput,
  expiresAt: Date,
  createdAt: Date
): LocalBondingInviteRecord {
  const record: LocalBondingInviteRecord = {
    parentId,
    status: 'pending_share',
    expiresAt: expiresAt.toISOString(),
    createdAt: createdAt.toISOString(),
  };
  if (input.childId) record.childId = input.childId;
  if (input.challengeId) record.challengeId = input.challengeId;
  if (input.childName) record.childName = input.childName;
  if (input.parentName) record.parentName = input.parentName;
  return record;
}

function newInviteId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  }
  return `local${Date.now().toString(36)}`;
}

export async function recordLocalBondingInvite(
  input: LocalRecordBondingInviteInput
): Promise<LocalRecordBondingInviteResult> {
  const parentId = await getCurrentUserId();
  if (!parentId) {
    throw new Error('יש להירשם לפני שיתוף ההזמנה');
  }

  const inviteId = newInviteId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);
  const record = buildInviteRecord(parentId, input, expiresAt, now);

  const db = await getDatabaseInstance();
  await set(ref(db, invitePath(inviteId)), record);

  const base = input.baseUrl?.replace(/\/$/, '') || getBondingShareBaseUrl();
  const childUrl = `${base}${ONBOARDING_CHILD_PATH}?invite=${encodeURIComponent(inviteId)}`;

  return {
    inviteId,
    childUrl,
    whatsappShareUrl: '',
  };
}

export async function resolveLocalBondingInvite(
  inviteId: string
): Promise<LocalResolveBondingInviteResult> {
  const db = await getDatabaseInstance();
  const snap = await get(ref(db, invitePath(inviteId.trim())));
  if (!snap.exists()) {
    throw new FirebaseError('functions/not-found', 'Invite not found');
  }

  const data = snap.val() as LocalBondingInviteRecord;
  if (data.status === 'completed') {
    throw new FirebaseError(
      'functions/failed-precondition',
      INVITE_COMPLETED_ERROR_MESSAGE
    );
  }

  const expiresMs = Date.parse(data.expiresAt);
  if (Number.isNaN(expiresMs) || Date.now() > expiresMs) {
    throw new FirebaseError('functions/failed-precondition', INVITE_EXPIRED_ERROR_MESSAGE);
  }

  try {
    const parent = await getUser(data.parentId, false);
    if (parent?.onboarding === true) {
      throw new FirebaseError(
        'functions/failed-precondition',
        INVITE_COMPLETED_ERROR_MESSAGE
      );
    }
  } catch (error) {
    if (error instanceof FirebaseError && error.message === INVITE_COMPLETED_ERROR_MESSAGE) {
      throw error;
    }
  }

  return {
    inviteId: inviteId.trim(),
    parentId: data.parentId,
    childId: data.childId ?? null,
    challengeId: data.challengeId ?? null,
    childName: data.childName ?? null,
    parentName: data.parentName ?? null,
  };
}

/** Mark RTDB invite consumed so `?invite=` can no longer start child onboarding. */
export async function consumeLocalBondingInvite(inviteId: string): Promise<void> {
  const trimmed = inviteId.trim();
  if (!trimmed) return;

  const db = await getDatabaseInstance();
  const inviteRef = ref(db, invitePath(trimmed));
  const snap = await get(inviteRef);
  if (!snap.exists()) return;

  const now = new Date().toISOString();
  await update(inviteRef, {
    status: 'completed',
    completedAt: now,
    expiresAt: now,
  });
}
