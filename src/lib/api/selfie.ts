/**
 * Client API — AI selfie generation via Firebase Callable → Cloud Run.
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

function summarizeSelfieRequest(
  input: GenerateSelfieInput,
  childImageBase64Len: number,
  parentImageBase64Len: number,
) {
  return {
    transport: 'firebase' as const,
    endpoint: 'generateSelfie',
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

/**
 * Generate composed selfie PNG — tracks coarse progress for the preparing ring.
 * Nothing is persisted client-side except the returned Blob.
 */
export async function generateSelfieImage(input: GenerateSelfieInput): Promise<Blob> {
  const startTime = Date.now();
  const report = (pct: number) => input.onProgress?.(Math.min(100, Math.max(0, Math.round(pct))));

  logger.log('Starting selfie generation', {
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
    logger.log('Request → Firebase generateSelfie', {
      ...summarizeSelfieRequest(input, childImageData.length, parentImageData.length),
    });

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
      childGender: normalizeSelfieGender(input.childGender),
      parentGender: normalizeSelfieGender(input.parentGender),
      childImageData,
      parentImageData,
    });

    logger.log('Response ← Firebase generateSelfie', {
      success: result.data.success,
      imageDataBase64Len: result.data.imageData?.length ?? 0,
      error: result.data.error,
      elapsedMs: Date.now() - startTime,
    });

    if (!result.data.success || !result.data.imageData) {
      throw new Error(result.data.error ?? 'יצירת התמונה נכשלה');
    }

    report(100);
    const blob = base64ToBlob(result.data.imageData, 'image/png');
    logger.log('Selfie blob ready', {
      transport: 'firebase',
      outputBytes: blob.size,
      outputType: blob.type || 'image/png',
      elapsedMs: Date.now() - startTime,
    });
    return blob;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Selfie generation failed', {
      transport: 'firebase',
      message,
      elapsedMs: Date.now() - startTime,
    });
    throw error;
  } finally {
    window.clearInterval(interval);
  }
}
