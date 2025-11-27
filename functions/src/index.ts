import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

interface ProcessScreenshotRequest {
  imageData: string; // Base64 encoded image
  targetDay: string; // Hebrew day name (e.g., "ראשון")
}

interface ProcessScreenshotResponse {
  success: boolean;
  day?: string;
  minutes?: number;
  found?: boolean;
  metadata?: {
    scale_min_per_px?: number;
    max_val_y?: number;
  };
  error?: string;
}

/**
 * Firebase Function (Gen 2) to process screenshot and extract screen time data
 * Calls Cloud Run service running Python
 */
export const processScreenshot = functions.https.onCall(
  {
    region: 'us-central1', // Change to your preferred region
    timeoutSeconds: 540, // 9 minutes max
    memory: '512MiB', // Reduced since we're just calling Cloud Run
  },
  async (request): Promise<ProcessScreenshotResponse> => {
    // Verify authentication
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { imageData, targetDay } = request.data as ProcessScreenshotRequest;

    if (!imageData || !targetDay) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: imageData and targetDay'
      );
    }

    try {
      // Get Cloud Run service URL from environment variable
      // For Gen 2, use environment variables or secrets
      const cloudRunUrl = process.env.CLOUD_RUN_SERVICE_URL || 
        'https://process-screenshot-506217601121.us-central1.run.app';
      
      if (!cloudRunUrl) {
        throw new Error(
          'Cloud Run service URL not configured. ' +
          'Set CLOUD_RUN_SERVICE_URL environment variable. ' +
          'You can set it when deploying: ' +
          'firebase functions:secrets:set CLOUD_RUN_SERVICE_URL'
        );
      }
      
      console.log('[Function] Calling Cloud Run service:', cloudRunUrl);
      console.log('[Function] Processing screenshot for day:', targetDay);
      
      // Call Cloud Run service
      const response = await fetch(cloudRunUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            imageData,
            targetDay
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Function] Cloud Run service error:', response.status, errorText);
        throw new Error(`Cloud Run service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as ProcessScreenshotResponse;
      console.log('[Function] Cloud Run service result:', result);
      
      return result;

    } catch (error: any) {
      console.error('[Function] Error calling Cloud Run service:', error);
      throw new functions.https.HttpsError(
        'internal',
        `Failed to process screenshot: ${error.message}`
      );
    }
  }
);
