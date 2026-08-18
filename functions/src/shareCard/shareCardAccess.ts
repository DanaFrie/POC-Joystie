import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import type { File as GcsFile } from '@google-cloud/storage';

const SIGNED_URL_TTL_MS = 15 * 60 * 1000; // 15 minutes

export type GetChildShareCardAccessRequest = {
  parentId?: string;
  childId?: string | null;
  /** `/dashboard/child?token=` — when child is not signed in as parent. */
  dashboardToken?: string | null;
};

export type GetChildShareCardAccessResponse = {
  success: boolean;
  /** Short-lived signed URL — not a permanent public token link. */
  url: string;
  expiresAt: string;
  source: 'ai' | 'default';
};

/** Same compact token as client `decodeParentToken` (base64url parentId|childId|expiresAt). */
function decodeDashboardToken(token: string): {
  parentId: string;
  childId: string | null;
  isExpired: boolean;
} | null {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    if (!decoded.includes('|')) return null;
    const parts = decoded.split('|');
    let parentId: string;
    let childId: string | null;
    let expiresAt: number;
    if (parts.length === 3) {
      parentId = parts[0]!;
      childId = parts[1] || null;
      expiresAt = parseInt(parts[2]!, 10);
    } else if (parts.length === 4) {
      parentId = parts[0]!;
      childId = parts[1] || null;
      expiresAt = parseInt(parts[3]!, 10);
    } else {
      return null;
    }
    if (!parentId || !expiresAt || Number.isNaN(expiresAt)) return null;
    return { parentId, childId, isExpired: Date.now() > expiresAt };
  } catch {
    return null;
  }
}

async function assertCanAccessParent(
  authUid: string | undefined,
  parentId: string,
  dashboardToken?: string | null
): Promise<void> {
  if (authUid === parentId) return;

  const token = dashboardToken?.trim() || '';
  if (token) {
    const decoded = decodeDashboardToken(token);
    if (!decoded || decoded.isExpired) {
      throw new functions.https.HttpsError('permission-denied', 'Dashboard token invalid or expired');
    }
    if (decoded.parentId !== parentId) {
      throw new functions.https.HttpsError('permission-denied', 'Token does not match parent');
    }
    return;
  }

  throw new functions.https.HttpsError(
    'unauthenticated',
    'Sign in as parent or pass dashboardToken'
  );
}

async function resolveBucketAndFile(storagePath: string): Promise<{
  file: GcsFile;
  bucketName: string;
}> {
  const projectId =
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    admin.app().options.projectId ||
    'joystie-poc';
  const configured =
    process.env.FIREBASE_STORAGE_BUCKET ||
    (admin.app().options.storageBucket as string | undefined);
  const bucketCandidates = [
    configured,
    `${projectId}.firebasestorage.app`,
    `${projectId}.appspot.com`,
  ].filter((name, index, arr): name is string => Boolean(name) && arr.indexOf(name) === index);

  let lastError = '';
  for (const candidate of bucketCandidates) {
    try {
      const file = admin.storage().bucket(candidate).file(storagePath);
      const [exists] = await file.exists();
      if (exists) {
        return { file, bucketName: candidate };
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new functions.https.HttpsError(
    'not-found',
    `Share card file not found${lastError ? `: ${lastError}` : ''}`
  );
}

/** Revoke permanent Firebase download tokens so old ?token= URLs stop working. */
async function revokePublicDownloadTokens(file: GcsFile): Promise<void> {
  try {
    const [meta] = await file.getMetadata();
    const custom = { ...(meta.metadata || {}) } as Record<string, string>;
    if (!custom.firebaseStorageDownloadTokens) return;
    delete custom.firebaseStorageDownloadTokens;
    await file.setMetadata({ metadata: custom });
  } catch (error) {
    console.warn('[getChildShareCardAccess] Failed to revoke download tokens', error);
  }
}

/**
 * Core access logic — also reachable via `saveChildShareCard` with `op: 'getAccess'`
 * because that Cloud Run service already has public invoker (CORS works from localhost).
 */
export async function handleGetChildShareCardAccess(
  authUid: string | undefined,
  data: GetChildShareCardAccessRequest
): Promise<GetChildShareCardAccessResponse> {
  const parentId = data.parentId?.trim();
  if (!parentId) {
    throw new functions.https.HttpsError('invalid-argument', 'parentId required');
  }

  await assertCanAccessParent(authUid, parentId, data.dashboardToken);

  let childId = data.childId?.trim() || '';
  if (!childId || childId.startsWith('draft-')) {
    const userSnap = await admin.firestore().collection('users').doc(parentId).get();
    childId = (userSnap.data() as { primaryChildId?: string } | undefined)?.primaryChildId || '';
  }
  if (!childId) {
    throw new functions.https.HttpsError('not-found', 'Child not found');
  }

  const childRef = admin.firestore().collection('children').doc(childId);
  const childSnap = await childRef.get();
  if (!childSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Child not found');
  }
  const child = childSnap.data() as {
    parentId?: string;
    shareCard?: {
      source?: 'ai' | 'default';
      storagePath?: string | null;
      downloadUrl?: string | null;
    };
  };
  if (child.parentId !== parentId) {
    throw new functions.https.HttpsError('permission-denied', 'Child does not belong to parent');
  }

  const storagePath = child.shareCard?.storagePath?.trim() || '';
  if (!storagePath) {
    if (child.shareCard?.source === 'default') {
      return {
        success: true,
        url: '',
        expiresAt: new Date().toISOString(),
        source: 'default' as const,
      };
    }
    throw new functions.https.HttpsError('not-found', 'No stored share card');
  }
  if (!storagePath.startsWith(`families/${parentId}/children/${childId}/share-cards/`)) {
    throw new functions.https.HttpsError('internal', 'Invalid share card path');
  }

  const { file } = await resolveBucketAndFile(storagePath);
  await revokePublicDownloadTokens(file);

  if (child.shareCard?.downloadUrl) {
    await childRef.set(
      {
        shareCard: {
          ...child.shareCard,
          downloadUrl: null,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  const expiresAtMs = Date.now() + SIGNED_URL_TTL_MS;
  try {
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: expiresAtMs,
    });
    return {
      success: true,
      url,
      expiresAt: new Date(expiresAtMs).toISOString(),
      source: child.shareCard?.source === 'default' ? 'default' : 'ai',
    };
  } catch (signError) {
    console.warn('[getChildShareCardAccess] getSignedUrl failed, using data URL', signError);
    const [buf] = await file.download();
    const [meta] = await file.getMetadata();
    const contentType = (meta.contentType as string) || 'image/jpeg';
    const url = `data:${contentType};base64,${buf.toString('base64')}`;
    return {
      success: true,
      url,
      expiresAt: new Date(expiresAtMs).toISOString(),
      source: child.shareCard?.source === 'default' ? 'default' : 'ai',
    };
  }
}
