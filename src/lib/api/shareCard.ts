/**
 * Client API — persist + auth-gated access for share selfie (Admin Storage).
 */

import { getFunctionsInstance } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ShareCardAPI');

export type ShareCardSource = 'ai' | 'default';

export type SaveChildShareCardResult = {
  success: boolean;
  childId: string;
  shareCard: {
    source: ShareCardSource;
    storagePath: string | null;
    downloadUrl: string | null;
    createdAt: string;
  };
};

export type GetChildShareCardAccessResult = {
  success: boolean;
  url: string;
  expiresAt: string;
  source: ShareCardSource;
};

export type EnsureBondingChildResult = {
  success: boolean;
  childId: string;
  gender: 'boy' | 'girl';
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.includes(',') ? result.split(',')[1]! : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Create/link Firestore `children/{id}` + `users.primaryChildId` before Storage.
 * Must run when the child accepts the selfie (wallet needs a real child doc).
 */
export async function ensureBondingChild(input: {
  parentId: string;
  childId?: string | null;
  inviteId?: string | null;
  childName?: string | null;
  childGender?: 'boy' | 'girl' | null;
}): Promise<EnsureBondingChildResult> {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, 'saveChildShareCard');
  const result = await callable({
    op: 'ensureChild',
    parentId: input.parentId,
    childId: input.childId ?? null,
    inviteId: input.inviteId ?? null,
    childName: input.childName ?? null,
    childGender: input.childGender ?? null,
  });
  const data = result.data as EnsureBondingChildResult;
  logger.log('ensureBondingChild', { parentId: input.parentId, childId: data.childId });
  return data;
}

export async function saveChildShareCard(input: {
  parentId: string;
  childId?: string | null;
  inviteId?: string | null;
  source: ShareCardSource;
  imageBlob?: Blob | null;
  childName?: string | null;
  childGender?: 'boy' | 'girl' | null;
}): Promise<SaveChildShareCardResult> {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, 'saveChildShareCard');

  const payload: Record<string, unknown> = {
    parentId: input.parentId,
    childId: input.childId ?? null,
    inviteId: input.inviteId ?? null,
    source: input.source,
    childName: input.childName ?? null,
    childGender: input.childGender ?? null,
  };

  if (!input.imageBlob) {
    if (input.source === 'ai') {
      throw new Error('חסרה תמונה לשמירה');
    }
  } else {
    payload.imageData = await blobToBase64(input.imageBlob);
    payload.contentType = input.imageBlob.type || 'image/jpeg';
  }

  logger.log('saveChildShareCard', {
    parentId: input.parentId,
    childId: input.childId,
    source: input.source,
    bytes: input.imageBlob?.size ?? 0,
  });

  const result = await callable(payload);
  return result.data as SaveChildShareCardResult;
}

/**
 * Short-lived signed URL (or data URL fallback). Requires parent Auth or child dashboard token.
 * Routed through `saveChildShareCard` (public invoker already works) until dedicated
 * getChildShareCardAccess Cloud Run IAM is granted.
 */
export async function getChildShareCardAccess(input: {
  parentId: string;
  childId?: string | null;
  dashboardToken?: string | null;
}): Promise<GetChildShareCardAccessResult> {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, 'saveChildShareCard');
  const result = await callable({
    op: 'getAccess',
    parentId: input.parentId,
    childId: input.childId ?? null,
    dashboardToken: input.dashboardToken ?? null,
  });
  return result.data as GetChildShareCardAccessResult;
}
