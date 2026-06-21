import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { buildWhatsAppShareUrl } from './whatsapp';
import type { FirestoreBondingInvite } from './types';

const baseUrlSecret = defineSecret('SERVICE_FUNCTION_BASE_URL');
const COLLECTION = 'bonding_invites';

function getDb() {
  return admin.firestore();
}

function getBaseUrl(): string {
  return baseUrlSecret.value() || 'https://joystie.com';
}

function buildChildPathUrl(
  parentId: string,
  childId?: string,
  challengeId?: string
): string {
  const expiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000;
  const parts = [parentId, childId || '', challengeId || '', expiresAt.toString()];
  const compact = parts.join('|');
  const encoded = Buffer.from(compact, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${getBaseUrl()}/onboarding/child?token=${encoded}`;
}

export const recordBondingInvite = functions.https.onCall(
  {
    region: 'us-central1',
    secrets: [baseUrlSecret],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const parentId = request.auth.uid;
    const { childId, challengeId, childName, parentName, parentGender } = request.data as {
      childId?: string;
      challengeId?: string;
      childName?: string;
      parentName?: string;
      parentGender?: 'female' | 'male';
    };

    const childUrl = buildChildPathUrl(parentId, childId, challengeId);
    const whatsappShareUrl = buildWhatsAppShareUrl({
      childUrl,
      childName,
      parentName,
      parentGender,
    });

    const now = new Date();
    const doc: Omit<FirestoreBondingInvite, 'id'> = {
      parentId,
      childId,
      challengeId,
      childUrl,
      whatsappShareUrl,
      status: 'pending_share',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const ref = await getDb().collection(COLLECTION).add(doc);
    return {
      inviteId: ref.id,
      childUrl,
      whatsappShareUrl,
    };
  }
);

export const markBondingWhatsAppShared = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const { inviteId } = request.data as { inviteId: string };
    const ref = getDb().collection(COLLECTION).doc(inviteId);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.parentId !== request.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid invite');
    }
    const now = new Date().toISOString();
    await ref.update({
      status: 'shared',
      whatsappSharedAt: now,
      updatedAt: now,
    });
    return { ok: true };
  }
);

export const markBondingChildLinkOpened = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    const { inviteId } = request.data as { inviteId: string };
    const ref = getDb().collection(COLLECTION).doc(inviteId);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new functions.https.HttpsError('not-found', 'Invite not found');
    }
    const now = new Date().toISOString();
    await ref.update({
      status: 'child_opened',
      childLinkOpenedAt: now,
      updatedAt: now,
    });
    return { ok: true };
  }
);
