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
      ...(childName ? { childName: String(childName) } : {}),
      ...(parentName ? { parentName: String(parentName) } : {}),
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

/** Child device — names + active game room for onboarding bonding. */
export const resolveBondingGameRoom = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const { parentId, inviteId } = request.data as {
      parentId?: string;
      inviteId?: string;
    };
    if (!parentId) {
      throw new functions.https.HttpsError('invalid-argument', 'parentId required');
    }

    let invite: FirebaseFirestore.DocumentSnapshot | null = null;
    if (inviteId) {
      const ref = getDb().collection(COLLECTION).doc(inviteId);
      invite = await ref.get();
      if (!invite.exists || invite.data()?.parentId !== parentId) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid invite');
      }
    } else {
      const snap = await getDb()
        .collection(COLLECTION)
        .where('parentId', '==', parentId)
        .limit(1)
        .get();
      invite = snap.docs[0] ?? null;
    }

    if (!invite?.exists) {
      return {
        parentId,
        childName: null,
        parentName: null,
        roomId: null,
        joinCode: null,
      };
    }

    const data = invite.data() as FirestoreBondingInvite;
    return {
      parentId,
      inviteId: invite.id,
      childName: data.childName ?? null,
      parentName: data.parentName ?? null,
      roomId: data.gameRoomId ?? null,
      joinCode: data.gameJoinCode ?? null,
    };
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

async function findLatestInviteForParent(parentId: string) {
  const snap = await getDb()
    .collection(COLLECTION)
    .where('parentId', '==', parentId)
    .limit(1)
    .get();
  return snap.docs[0] ?? null;
}

/** Child device — link opened / egg complete (Firestore bonding_invites). */
export const reportChildOnboardingMilestone = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const { parentId, milestone } = request.data as {
      parentId?: string;
      milestone?: 'link_opened' | 'egg_complete' | 'welcome_reached' | 'dori_revealed' | 'mission_ready';
    };
    if (!parentId || !milestone) {
      throw new functions.https.HttpsError('invalid-argument', 'parentId and milestone required');
    }

    const invite = await findLatestInviteForParent(parentId);
    if (!invite) {
      return { ok: false, reason: 'no_invite' as const };
    }

    const now = new Date().toISOString();
    if (milestone === 'link_opened') {
      await invite.ref.update({
        status: 'child_opened',
        childLinkOpenedAt: now,
        updatedAt: now,
      });
    } else if (milestone === 'welcome_reached') {
      await invite.ref.update({
        welcomeReachedAt: now,
        updatedAt: now,
      });
    } else if (milestone === 'dori_revealed') {
      await invite.ref.update({
        doriRevealedAt: now,
        updatedAt: now,
      });
    } else if (milestone === 'mission_ready') {
      await invite.ref.update({
        missionReadyAt: now,
        updatedAt: now,
      });
    } else {
      await invite.ref.update({
        eggCompletedAt: now,
        updatedAt: now,
      });
    }
    return { ok: true };
  }
);

/** Parent — poll child funnel milestones while on waiting screens. */
export const getChildOnboardingProgress = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const parentId = request.auth.uid;
    const invite = await findLatestInviteForParent(parentId);
    if (!invite) {
      return { linkOpened: false, eggComplete: false };
    }
    const data = invite.data() as FirestoreBondingInvite;
    return {
      linkOpened: data.status === 'child_opened' || Boolean(data.childLinkOpenedAt),
      eggComplete: Boolean(data.eggCompletedAt),
    };
  }
);
