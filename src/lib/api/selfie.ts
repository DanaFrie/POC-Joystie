/**
 * Client API — AI selfie generation.
 * Default: Firebase Callable → Cloud Run.
 * Local loop: set NEXT_PUBLIC_SELFIE_SERVICE_URL → browser hits the service directly.
 * Output is an in-memory PNG blob (not stored).
 */

import { getFunctionsInstance } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('SelfieAPI');

export type SelfieGenderInput = string;

export type GenerateSelfieInput = {
  childFace: Blob;
  parentFace: Blob;
  childGender: SelfieGenderInput;
  parentGender: SelfieGenderInput;
  onProgress?: (percent: number) => void;
};

export type SelfieTransport = 'local' | 'firebase';

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

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/** Map bonding gender values to Cloud Run expected female | male. */
export function normalizeSelfieGender(gender: SelfieGenderInput): 'female' | 'male' {
  const value = gender.toLowerCase();
  if (['female', 'woman', 'mother', 'girl', 'f'].includes(value)) return 'female';
  return 'male';
}

/** Local selfie service base URL (no trailing slash), or null → Firebase callable. */
export function getLocalSelfieServiceUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SELFIE_SERVICE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

export function getSelfieTransport(): SelfieTransport {
  return getLocalSelfieServiceUrl() ? 'local' : 'firebase';
}

function summarizeSelfieRequest(
  transport: SelfieTransport,
  input: GenerateSelfieInput,
  childImageBase64Len: number,
  parentImageBase64Len: number,
) {
  return {
    transport,
    endpoint: transport === 'local' ? 'generate-selfie-json' : 'generateSelfie',
    localServiceUrl: getLocalSelfieServiceUrl(),
    childGender: normalizeSelfieGender(input.childGender),
    parentGender: normalizeSelfieGender(input.parentGender),
    childFaceBytes: input.childFace.size,
    parentFaceBytes: input.parentFace.size,
    childFaceType: input.childFace.type || 'unknown',
    parentFaceType: input.parentFace.type || 'unknown',
    childImageBase64Len,
    parentImageBase64Len,
  };
}

async function generateViaLocalService(
  baseUrl: string,
  childGender: 'female' | 'male',
  parentGender: 'female' | 'male',
  childImageData: string,
  parentImageData: string,
): Promise<string> {
  const response = await fetch(`${baseUrl}/generate-selfie-json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parent_gender: parentGender,
      child_gender: childGender,
      parent_image_base64: parentImageData,
      child_image_base64: childImageData,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Selfie service error ${response.status}: ${errorText.slice(0, 240)}`);
  }

  const result = (await response.json()) as {
    success?: boolean;
    imageData?: string;
    detail?: string;
    error?: string;
  };

  if (!result.imageData) {
    throw new Error(result.detail ?? result.error ?? 'No image returned from local selfie service');
  }

  return result.imageData;
}

async function generateViaFirebase(
  childGender: 'female' | 'male',
  parentGender: 'female' | 'male',
  childImageData: string,
  parentImageData: string,
): Promise<string> {
  const functions = await getFunctionsInstance();
  const generateSelfieFn = httpsCallable<
    {
      childGender: string;
      parentGender: string;
      childImageData: string;
      parentImageData: string;
    },
    { success: boolean; imageData?: string; error?: string }
  >(functions, 'generateSelfie');

  const result = await generateSelfieFn({
    childGender,
    parentGender,
    childImageData,
    parentImageData,
  });

  if (!result.data.success || !result.data.imageData) {
    throw new Error(result.data.error ?? 'יצירת התמונה נכשלה');
  }

  return result.data.imageData;
}

/**
 * Generate composed selfie PNG — tracks coarse progress for the preparing ring.
 * Nothing is persisted client-side except the returned Blob.
 */
export async function generateSelfieImage(input: GenerateSelfieInput): Promise<Blob> {
  const startTime = Date.now();
  const report = (pct: number) => input.onProgress?.(Math.min(100, Math.max(0, Math.round(pct))));
  const transport = getSelfieTransport();
  const localBase = getLocalSelfieServiceUrl();

  logger.log('Starting selfie generation', {
    transport,
    localServiceUrl: localBase,
    childFaceBytes: input.childFace.size,
    parentFaceBytes: input.parentFace.size,
    childGender: input.childGender,
    parentGender: input.parentGender,
  });

  report(5);
  const [childImageData, parentImageData] = await Promise.all([
    blobToBase64(input.childFace),
    blobToBase64(input.parentFace),
  ]);
  report(20);

  let tick = 22;
  const interval = window.setInterval(() => {
    tick = Math.min(92, tick + 2);
    report(tick);
  }, 900);

  try {
    const childGender = normalizeSelfieGender(input.childGender);
    const parentGender = normalizeSelfieGender(input.parentGender);

    logger.log(`Request → ${transport === 'local' ? 'local selfie service' : 'Firebase generateSelfie'}`, {
      ...summarizeSelfieRequest(transport, input, childImageData.length, parentImageData.length),
    });

    const imageData =
      transport === 'local' && localBase
        ? await generateViaLocalService(
            localBase,
            childGender,
            parentGender,
            childImageData,
            parentImageData,
          )
        : await generateViaFirebase(childGender, parentGender, childImageData, parentImageData);

    logger.log(`Response ← ${transport}`, {
      imageDataBase64Len: imageData.length,
      elapsedMs: Date.now() - startTime,
    });

    report(100);
    const blob = base64ToBlob(imageData, 'image/png');
    logger.log('Selfie blob ready', {
      transport,
      outputBytes: blob.size,
      outputType: blob.type || 'image/png',
      elapsedMs: Date.now() - startTime,
    });
    return blob;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Selfie generation failed', {
      transport,
      message,
      elapsedMs: Date.now() - startTime,
    });
    throw error;
  } finally {
    window.clearInterval(interval);
  }
}
