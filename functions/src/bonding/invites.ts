import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { buildWhatsAppShareUrl } from './whatsapp';
import type { FirestoreBondingInvite } from './types';

const baseUrlSecret = defineSecret('SERVICE_FUNCTION_BASE_URL');
const COLLECTION = 'bonding_invites';
/** Default if parent picks "remind me later" without a time (same evening). */
const DEFAULT_REMIND_LATER_HOURS = 4;

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
  return `${getBaseUrl()}/child?token=${encoded}`;
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
    const { childId, challengeId, childName, parentName, shareMode, remindAt } =
      request.data as {
        childId?: string;
        challengeId?: string;
        childName?: string;
        parentName?: string;
        /** together_now = share via WhatsApp while with child; remind_later = nudge parent only */
        shareMode?: 'together_now' | 'remind_later';
        /** ISO datetime when parent wants the reminder (remind_later) */
        remindAt?: string;
      };

    const mode = shareMode === 'remind_later' ? 'remind_later' : 'together_now';

    const childUrl = buildChildPathUrl(parentId, childId, challengeId);
    const whatsappShareUrl = buildWhatsAppShareUrl({
      childUrl,
      childName,
      parentName,
    });

    const now = new Date();
    let shareReminderAt: string | undefined;
    let status: FirestoreBondingInvite['status'] =
      mode === 'together_now' ? 'pending_share' : 'remind_scheduled';

    if (mode === 'remind_later') {
      const parsed = remindAt ? new Date(remindAt) : null;
      const reminderAt =
        parsed && !Number.isNaN(parsed.getTime())
          ? parsed
          : new Date(now.getTime() + DEFAULT_REMIND_LATER_HOURS * 60 * 60 * 1000);
      if (reminderAt.getTime() <= now.getTime()) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'remindAt must be in the future'
        );
      }
      shareReminderAt = reminderAt.toISOString();
    }

    const doc: Omit<FirestoreBondingInvite, 'id'> = {
      parentId,
      childId,
      challengeId,
      childUrl,
      whatsappShareUrl,
      shareMode: mode,
      status,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...(shareReminderAt ? { shareReminderAt } : {}),
    };

    const ref = await getDb().collection(COLLECTION).add(doc);
    return {
      inviteId: ref.id,
      childUrl,
      whatsappShareUrl,
      shareReminderAt: doc.shareReminderAt,
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
      shareReminderSentAt: now,
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
