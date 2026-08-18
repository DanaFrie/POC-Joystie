import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';

const cloudRunSelfieServiceUrl = defineSecret('CLOUD_RUN_SELFIE_SERVICE_URL');

export interface GenerateSelfieRequest {
  parentGender: string;
  childGender: string;
  parentImageData: string;
  childImageData: string;
}

export interface GenerateSelfieResponse {
  success: boolean;
  imageData?: string;
  error?: string;
}

/**
 * Callable proxy → Cloud Run `generate-selfie` service.
 * Returns base64 PNG in memory — nothing persisted.
 */
export const generateSelfie = functions.https.onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '1GiB',
    invoker: 'public',
    secrets: [cloudRunSelfieServiceUrl],
  },
  async (request): Promise<GenerateSelfieResponse> => {
    const data = request.data as GenerateSelfieRequest;
    const { parentGender, childGender, parentImageData, childImageData } = data;

    if (!parentGender || !childGender || !parentImageData || !childImageData) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing parentGender, childGender, parentImageData, or childImageData'
      );
    }

    const cloudRunUrl = cloudRunSelfieServiceUrl.value();
    if (!cloudRunUrl) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Set CLOUD_RUN_SELFIE_SERVICE_URL via firebase functions:secrets:set'
      );
    }

    const endpoint = `${cloudRunUrl.replace(/\/$/, '')}/generate-selfie-json`;

    try {
      console.log('[generateSelfie] Calling Cloud Run:', endpoint);

      const response = await fetch(endpoint, {
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
        console.error('[generateSelfie] Cloud Run error:', response.status, errorText);
        return { success: false, error: `Cloud Run error: ${response.status}` };
      }

      const result = (await response.json()) as { success?: boolean; imageData?: string; detail?: string };
      if (!result.imageData) {
        return { success: false, error: result.detail ?? 'No image returned' };
      }

      return { success: true, imageData: result.imageData };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'generateSelfie failed';
      console.error('[generateSelfie] Error:', error);
      return { success: false, error: message };
    }
  }
);
