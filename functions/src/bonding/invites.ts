import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { buildWhatsAppShareUrl } from './whatsapp';
import type { FirestoreBondingInvite } from './types';

const baseUrlSecret = defineSecret('SERVICE_FUNCTION_BASE_URL');
const COLLECTION = 'bonding_invites';
const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function getDb() {
  return admin.firestore();
}

function getBaseUrl(): string {
  return baseUrlSecret.value() || 'https://joystie.com';
}

function buildChildInviteUrl(inviteId: string): string {
  return `${getBaseUrl()}/onboarding/child?invite=${encodeURIComponent(inviteId)}`;
}

function getInviteExpiresAtMs(data: FirestoreBondingInvite): number {
  if (data.expiresAt) {
    const parsed = Date.parse(data.expiresAt);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const created = Date.parse(data.createdAt);
  return (Number.isNaN(created) ? Date.now() : created) + INVITE_TTL_MS;
}

function isInviteExpired(data: FirestoreBondingInvite): boolean {
  return Date.now() > getInviteExpiresAtMs(data);
}

function isInviteCompleted(data: FirestoreBondingInvite): boolean {
  return data.status === 'completed';
}

async function assertInviteStillOpen(data: FirestoreBondingInvite): Promise<void> {
  // Only this invite's status/TTL — a newer live invite for the same parent must still resolve.
  if (isInviteCompleted(data)) {
    throw new functions.https.HttpsError('failed-precondition', 'Invite completed');
  }
  if (isInviteExpired(data)) {
    throw new functions.https.HttpsError('failed-precondition', 'Invite expired');
  }
}

async function clearParentOnboardingRtdb(parentId: string, roomIds: string[]): Promise<void> {
  const rtdb = admin.database();
  const uniqueRoomIds = [...new Set(roomIds.filter(Boolean))];
  await Promise.all([
    rtdb.ref(`onboardingBondingPublic/${parentId}`).remove(),
    rtdb.ref(`onboardingBondingMeta/${parentId}`).remove(),
    rtdb.ref(`onboardingChildProgress/${parentId}`).remove(),
    rtdb.ref(`onboardingParentProgress/${parentId}`).remove(),
    ...uniqueRoomIds.map((roomId) => rtdb.ref(`gameRooms/${roomId}`).remove()),
  ]);
}

async function tombstoneRtdbInvite(inviteId: string, now: string): Promise<void> {
  const inviteRef = admin.database().ref(`onboardingBondingInvites/${inviteId}`);
  const snap = await inviteRef.get();
  if (!snap.exists()) return;
  await inviteRef.update({
    status: 'completed',
    completedAt: now,
    expiresAt: now,
  });
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

    const now = new Date();
    const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);
    const ref = getDb().collection(COLLECTION).doc();
    const childUrl = buildChildInviteUrl(ref.id);
    const whatsappShareUrl = buildWhatsAppShareUrl({
      childUrl,
      childName,
      parentName,
      parentGender,
    });

    const doc: Omit<FirestoreBondingInvite, 'id'> = {
      parentId,
      childId,
      challengeId,
      ...(childName ? { childName: String(childName) } : {}),
      ...(parentName ? { parentName: String(parentName) } : {}),
      expiresAt: expiresAt.toISOString(),
      childUrl,
      whatsappShareUrl,
      status: 'pending_share',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await ref.set(doc);
    return {
      inviteId: ref.id,
      childUrl,
      whatsappShareUrl,
    };
  }
);

/** Child device — resolve short `?invite=` link (no auth; invite id is the secret). */
export const resolveBondingInvite = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    const { inviteId } = request.data as { inviteId?: string };
    if (!inviteId?.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'inviteId required');
    }

    const snap = await getDb().collection(COLLECTION).doc(inviteId.trim()).get();
    if (!snap.exists) {
      throw new functions.https.HttpsError('not-found', 'Invite not found');
    }

    const data = snap.data() as FirestoreBondingInvite;
    await assertInviteStillOpen(data);

    return {
      inviteId: snap.id,
      parentId: data.parentId,
      childId: data.childId ?? null,
      challengeId: data.challengeId ?? null,
      childName: data.childName ?? null,
      parentName: data.parentName ?? null,
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
    const data = snap.data() as FirestoreBondingInvite;
    if (isInviteCompleted(data)) {
      return { ok: true };
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
    await assertInviteStillOpen(data);
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
    const data = snap.data() as FirestoreBondingInvite;
    await assertInviteStillOpen(data);
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
    const inviteData = invite.data() as FirestoreBondingInvite;
    if (isInviteCompleted(inviteData)) {
      return { ok: false, reason: 'completed' as const };
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

/** Parent — consume invite links + drop live RTDB funnel records after onboarding. */
export const consumeBondingInvite = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const parentId = request.auth.uid;
    const { inviteId } = request.data as { inviteId?: string };
    const now = new Date().toISOString();

    const invitesSnap = await getDb()
      .collection(COLLECTION)
      .where('parentId', '==', parentId)
      .get();

    const roomIds: string[] = [];
    if (!invitesSnap.empty) {
      const batch = getDb().batch();
      for (const docSnap of invitesSnap.docs) {
        const data = docSnap.data() as FirestoreBondingInvite;
        if (data.gameRoomId) roomIds.push(data.gameRoomId);
        batch.update(docSnap.ref, {
          status: 'completed',
          completedAt: now,
          expiresAt: now,
          updatedAt: now,
        });
      }
      await batch.commit();
    }

    const publicSnap = await admin.database().ref(`onboardingBondingPublic/${parentId}`).get();
    const publicRoomId = publicSnap.val()?.roomId as string | undefined;
    if (publicRoomId) roomIds.push(publicRoomId);

    await clearParentOnboardingRtdb(parentId, roomIds);

    const rtdbInviteIds = new Set(
      invitesSnap.docs.map((docSnap) => docSnap.id).concat(inviteId?.trim() ? [inviteId.trim()] : [])
    );
    await Promise.all([...rtdbInviteIds].map((id) => tombstoneRtdbInvite(id, now)));

    return { ok: true };
  }
);
