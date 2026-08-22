import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { getServiceAccount } from '../serviceAccount';
import {
  handleGetChildShareCardAccess,
  type GetChildShareCardAccessResponse,
} from './shareCardAccess';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

export type ShareCardSource = 'ai' | 'default';

export type SaveChildShareCardRequest = {
  /**
   * `getAccess` — short-lived view URL (routed here because this Cloud Run
   * service already has public invoker; dedicated getChildShareCardAccess may not).
   * `ensureChild` — create/link Firestore child before Storage upload.
   */
  op?: 'save' | 'getAccess' | 'ensureChild';
  parentId?: string;
  childId?: string | null;
  inviteId?: string | null;
  dashboardToken?: string | null;
  /** Optional display hints when creating a new child doc. */
  childName?: string | null;
  childGender?: 'boy' | 'girl' | null;
  /** Raw base64 (no data: prefix) — required when source is `ai`. */
  imageData?: string;
  contentType?: string;
  source?: ShareCardSource;
};

export type SaveChildShareCardResponse = {
  success: boolean;
  childId: string;
  shareCard: {
    source: ShareCardSource;
    storagePath: string | null;
    downloadUrl: string | null;
    createdAt: string;
  };
};

export type EnsureBondingChildResponse = {
  success: boolean;
  childId: string;
  gender: 'boy' | 'girl';
};

function stripDataUrl(base64OrDataUrl: string): string {
  const i = base64OrDataUrl.indexOf(',');
  return i >= 0 ? base64OrDataUrl.slice(i + 1) : base64OrDataUrl;
}

/** Firestore invite (prod) or RTDB local/intgr invite. */
async function assertInviteBelongsToParent(
  inviteId: string,
  parentId: string
): Promise<void> {
  const firestoreSnap = await admin
    .firestore()
    .collection('bonding_invites')
    .doc(inviteId)
    .get();
  if (firestoreSnap.exists) {
    const data = firestoreSnap.data() as { parentId?: string };
    if (data.parentId !== parentId) {
      throw new functions.https.HttpsError('permission-denied', 'Invite does not match parent');
    }
    return;
  }

  const rtdbSnap = await admin
    .database()
    .ref(`onboardingBondingInvites/${inviteId}`)
    .get();
  if (rtdbSnap.exists()) {
    const data = rtdbSnap.val() as { parentId?: string };
    if (data.parentId !== parentId) {
      throw new functions.https.HttpsError('permission-denied', 'Invite does not match parent');
    }
    return;
  }

  throw new functions.https.HttpsError('not-found', 'Invite not found');
}

async function resolveChildId(
  parentId: string,
  childId?: string | null,
  hints?: { name?: string | null; gender?: 'boy' | 'girl' | null }
): Promise<{ childId: string; gender: 'boy' | 'girl' }> {
  const db = admin.firestore();
  const userSnap = await db.collection('users').doc(parentId).get();
  if (!userSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Parent not found');
  }
  const user = userSnap.data() as {
    primaryChildId?: string;
    kidsAges?: Array<{ name?: string; age?: string; gender?: string; dailyScreenTimeHours?: number }>;
  };

  const tryId = (childId && !childId.startsWith('draft-') ? childId : null) || user.primaryChildId || null;
  if (tryId) {
    const childSnap = await db.collection('children').doc(tryId).get();
    if (childSnap.exists) {
      const child = childSnap.data() as { parentId?: string; gender?: string };
      if (child.parentId !== parentId) {
        throw new functions.https.HttpsError('permission-denied', 'Child does not belong to parent');
      }
      return {
        childId: tryId,
        gender: child.gender === 'girl' ? 'girl' : 'boy',
      };
    }
  }

  const existing = await db.collection('children').where('parentId', '==', parentId).limit(1).get();
  if (!existing.empty) {
    const doc = existing.docs[0]!;
    const child = doc.data() as { gender?: string };
    if (!user.primaryChildId) {
      await db.collection('users').doc(parentId).set(
        { primaryChildId: doc.id, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    }
    return {
      childId: doc.id,
      gender: child.gender === 'girl' ? 'girl' : 'boy',
    };
  }

  const kid = user.kidsAges?.[0];
  const newRef = db.collection('children').doc();
  const now = new Date().toISOString();
  const gender: 'boy' | 'girl' =
    hints?.gender === 'girl' || hints?.gender === 'boy'
      ? hints.gender
      : kid?.gender === 'girl'
        ? 'girl'
        : 'boy';
  const name =
    hints?.name?.trim() || kid?.name?.trim() || 'ילד/ה';
  await newRef.set({
    id: newRef.id,
    parentId,
    name,
    age: kid?.age || '',
    gender,
    createdAt: now,
    updatedAt: now,
  });
  await db.collection('users').doc(parentId).set(
    { primaryChildId: newRef.id, updatedAt: now },
    { merge: true }
  );
  return { childId: newRef.id, gender };
}

/**
 * Persist final share selfie (AI) or mark default skip on `children/{childId}.shareCard`.
 * Client cannot write Storage — Admin SDK only.
 */
export const saveChildShareCard = functions.https.onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '512MiB',
    invoker: 'public',
    // Default Compute SA cannot read/write Firestore — same as Cardcom.
    serviceAccount: getServiceAccount(),
  },
  async (request): Promise<
    SaveChildShareCardResponse | GetChildShareCardAccessResponse | EnsureBondingChildResponse
  > => {
    const data = request.data as SaveChildShareCardRequest;

    // View/share access — same auth as getChildShareCardAccess (parent Auth or dashboard token).
    if (data.op === 'getAccess') {
      return handleGetChildShareCardAccess(request.auth?.uid, data);
    }

    const parentId = data.parentId?.trim();
    const source: ShareCardSource = data.source === 'default' ? 'default' : 'ai';

    if (!parentId) {
      throw new functions.https.HttpsError('invalid-argument', 'parentId required');
    }

    // Child invite flow: prefer invite proof (browser may still have a different Auth session).
    // Parent dashboard: Auth uid must match parentId.
    const inviteId = data.inviteId?.trim() || '';
    if (inviteId) {
      await assertInviteBelongsToParent(inviteId, parentId);
    } else if (request.auth?.uid) {
      if (request.auth.uid !== parentId) {
        throw new functions.https.HttpsError('permission-denied', 'Not the parent');
      }
    } else {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Sign in as parent or pass inviteId'
      );
    }

    const hints = {
      name: data.childName?.trim() || null,
      gender:
        data.childGender === 'girl' || data.childGender === 'boy'
          ? data.childGender
          : null,
    };

    // Create/link child doc only — before Storage upload on accept.
    if (data.op === 'ensureChild') {
      const resolved = await resolveChildId(parentId, data.childId, hints);
      return {
        success: true,
        childId: resolved.childId,
        gender: resolved.gender,
      };
    }

    const { childId } = await resolveChildId(parentId, data.childId, hints);
    const now = new Date().toISOString();
    const childRef = admin.firestore().collection('children').doc(childId);

    // Marker-only default (no bytes) — prefer client sending composed JPEG with headline.
    if (source === 'default' && !data.imageData?.trim()) {
      const shareCard = {
        source: 'default' as const,
        storagePath: null,
        downloadUrl: null,
        createdAt: now,
      };
      await childRef.set({ shareCard, updatedAt: now }, { merge: true });
      return { success: true, childId, shareCard };
    }

    if (!data.imageData?.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'imageData required');
    }

    const contentType =
      data.contentType === 'image/png' || data.contentType === 'image/webp'
        ? data.contentType
        : 'image/jpeg';
    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const raw = stripDataUrl(data.imageData);
    let buffer: Buffer;
    try {
      buffer = Buffer.from(raw, 'base64');
    } catch {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid imageData');
    }
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Image must be 1 byte–${MAX_IMAGE_BYTES} bytes`
      );
    }

    const fileId = randomUUID();
    const storagePath = `families/${parentId}/children/${childId}/share-cards/selfie-${fileId}.${ext}`;

    const projectId =
      process.env.GCLOUD_PROJECT ||
      process.env.GCP_PROJECT ||
      admin.app().options.projectId ||
      'joystie-poc';
    // Newer Firebase projects use *.firebasestorage.app; older use *.appspot.com.
    const configured =
      process.env.FIREBASE_STORAGE_BUCKET ||
      (admin.app().options.storageBucket as string | undefined);
    const bucketCandidates = [
      configured,
      `${projectId}.firebasestorage.app`,
      `${projectId}.appspot.com`,
    ].filter((name, index, arr): name is string => Boolean(name) && arr.indexOf(name) === index);

    let bucketName = bucketCandidates[0]!;
    let lastStorageError = '';

    // No firebaseStorageDownloadTokens — those make a permanent public URL.
    // Dashboard/view uses getChildShareCardAccess (short-lived signed URL).
    const savePayload = {
      resumable: false as const,
      contentType,
      metadata: {
        metadata: {
          parentId,
          childId,
          purpose: 'share-card-selfie',
        },
        cacheControl: 'private, max-age=3600',
      },
    };

    let saved = false;
    for (const candidate of bucketCandidates) {
      try {
        await admin.storage().bucket(candidate).file(storagePath).save(buffer, savePayload);
        bucketName = candidate;
        saved = true;
        break;
      } catch (error: unknown) {
        lastStorageError = error instanceof Error ? error.message : String(error);
        console.warn('[saveChildShareCard] Storage save failed for', candidate, lastStorageError);
      }
    }

    if (!saved) {
      throw new functions.https.HttpsError(
        'internal',
        `Storage upload failed (tried: ${bucketCandidates.join(', ')}). Enable Storage in Firebase Console. ${lastStorageError}`
      );
    }

    console.log('[saveChildShareCard] saved to', bucketName, storagePath);

    const shareCard = {
      source,
      storagePath,
      downloadUrl: null as string | null,
      createdAt: now,
    };

    await childRef.set({ shareCard, updatedAt: now }, { merge: true });

    return { success: true, childId, shareCard };
  }
);
