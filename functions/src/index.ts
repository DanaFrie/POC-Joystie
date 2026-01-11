import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { 
  processFirstDayNotification,
  processMissingUploadNotifications,
  processTwoPendingApprovalsNotification,
  processUploadNotification
} from './notifications';

// Initialize Firebase Admin
// In Firebase Functions Gen 2, this automatically uses the default service account
// which has permissions to access Firestore
if (!admin.apps.length) {
  admin.initializeApp();
}

// Define secret for Cloud Run service URL
// This secret must be set using: firebase functions:secrets:set CLOUD_RUN_SERVICE_URL
const cloudRunServiceUrl = defineSecret('CLOUD_RUN_SERVICE_URL');

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
    invoker: 'public', // Allow unauthenticated invocations (security via URL token validation)
    secrets: [cloudRunServiceUrl], // Declare secret dependency
  },
  async (request): Promise<ProcessScreenshotResponse> => {
    // Note: Authentication is optional - child upload pages use URL token validation
    // Security is handled by URL token validation in the app code
    // If authentication is present, we can use it for additional validation, but it's not required

    const { imageData, targetDay } = request.data as ProcessScreenshotRequest;

    if (!imageData || !targetDay) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: imageData and targetDay'
      );
    }

    try {
      // Get Cloud Run service URL from secret
      // Secret is defined using: firebase functions:secrets:set CLOUD_RUN_SERVICE_URL
      const cloudRunUrl = cloudRunServiceUrl.value();
      
      if (!cloudRunUrl) {
        throw new Error(
          'Cloud Run service URL not configured. ' +
          'Set CLOUD_RUN_SERVICE_URL secret using: ' +
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
      // Instead of throwing HttpsError, return a response with error and 0 values
      return {
        success: false,
        day: targetDay,
        minutes: 0,
        found: false,
        metadata: {
          scale_min_per_px: 0,
          max_val_y: 0,
        },
        error: error.message || 'Failed to process screenshot'
      };
    }
  }
);

/**
 * Scheduled function for first day notification
 * Runs daily at 7:08 AM (Asia/Jerusalem)
 */
export const scheduledFirstDayNotification = functions.scheduler.onSchedule(
  {
    schedule: '7 8 * * *', // Cron: 7:08 AM every day
    timeZone: 'Asia/Jerusalem',
    region: 'us-central1',
    // Use Firebase Admin SDK service account which has Firestore permissions
    serviceAccount: 'firebase-adminsdk-fbsvc@joystie-poc.iam.gserviceaccount.com',
    secrets: [
      'SERVICE_FUNCTION_EMAIL_USER',
      'SERVICE_FUNCTION_EMAIL_PASSWORD',
      'SERVICE_FUNCTION_EMAIL_FROM',
      'SERVICE_FUNCTION_BASE_URL',
    ],
  },
  async (event) => {
    try {
      const baseUrl = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
      console.log('[ScheduledFirstDayNotification] Running at 7:08 AM');
      await processFirstDayNotification(baseUrl);
      console.log('[ScheduledFirstDayNotification] Completed successfully');
    } catch (error) {
      console.error('[ScheduledFirstDayNotification] Error:', error);
      throw error;
    }
  }
);

/**
 * Scheduled function for missing upload notifications
 * Runs daily at 7:07 AM (Asia/Jerusalem)
 */
export const scheduledMissingUploadNotifications = functions.scheduler.onSchedule(
  {
    schedule: '7 7 * * *', // Cron: 7:07 AM every day
    timeZone: 'Asia/Jerusalem',
    region: 'us-central1',
    // Use Firebase Admin SDK service account which has Firestore permissions
    serviceAccount: 'firebase-adminsdk-fbsvc@joystie-poc.iam.gserviceaccount.com',
    secrets: [
      'SERVICE_FUNCTION_EMAIL_USER',
      'SERVICE_FUNCTION_EMAIL_PASSWORD',
      'SERVICE_FUNCTION_EMAIL_FROM',
      'SERVICE_FUNCTION_BASE_URL',
    ],
  },
  async (event) => {
    try {
      const baseUrl = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
      console.log('[ScheduledMissingUploadNotifications] Running at 7:07 AM');
      await processMissingUploadNotifications(baseUrl);
      console.log('[ScheduledMissingUploadNotifications] Completed successfully');
    } catch (error) {
      console.error('[ScheduledMissingUploadNotifications] Error:', error);
      throw error;
    }
  }
);

/**
 * Scheduled function for two pending approvals notification
 * Runs daily at 20:48 PM (Asia/Jerusalem)
 */
export const scheduledTwoPendingApprovalsNotification = functions.scheduler.onSchedule(
  {
    schedule: '48 20 * * *', // Cron: 20:48 PM every day
    timeZone: 'Asia/Jerusalem',
    region: 'us-central1',
    // Use Firebase Admin SDK service account which has Firestore permissions
    serviceAccount: 'firebase-adminsdk-fbsvc@joystie-poc.iam.gserviceaccount.com',
    secrets: [
      'SERVICE_FUNCTION_EMAIL_USER',
      'SERVICE_FUNCTION_EMAIL_PASSWORD',
      'SERVICE_FUNCTION_EMAIL_FROM',
      'SERVICE_FUNCTION_BASE_URL',
    ],
  },
  async (event) => {
    try {
      const baseUrl = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
      console.log('[ScheduledTwoPendingApprovalsNotification] Running at 20:48 PM');
      await processTwoPendingApprovalsNotification(baseUrl);
      console.log('[ScheduledTwoPendingApprovalsNotification] Completed successfully');
    } catch (error) {
      console.error('[ScheduledTwoPendingApprovalsNotification] Error:', error);
      throw error;
    }
  }
);

/**
 * Firestore trigger for upload notifications
 * Triggers when a new upload is created
 * Handles first upload success/failure notifications
 */
export const onUploadCreated = functions.firestore.onDocumentCreated(
  {
    document: 'daily_uploads/{uploadId}',
    region: 'us-central1',
    // Use Firebase Admin SDK service account which has Firestore permissions
    serviceAccount: 'firebase-adminsdk-fbsvc@joystie-poc.iam.gserviceaccount.com',
    secrets: [
      'SERVICE_FUNCTION_EMAIL_USER',
      'SERVICE_FUNCTION_EMAIL_PASSWORD',
      'SERVICE_FUNCTION_EMAIL_FROM',
      'SERVICE_FUNCTION_BASE_URL',
    ],
  },
  async (event) => {
    try {
      console.log('[OnUploadCreated] Trigger fired, event ID:', event.params.uploadId);
      if (!event.data) {
        console.warn('[OnUploadCreated] No data in event');
        return;
      }
      
      const upload = {
        id: event.data.id,
        ...event.data.data()
      } as any; // Type assertion needed for Firestore data
      
      console.log('[OnUploadCreated] Upload data extracted:', {
        id: upload.id,
        challengeId: upload.challengeId,
        success: upload.success,
        uploadedAt: upload.uploadedAt
      });
      
      const baseUrl = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
      console.log('[OnUploadCreated] Processing upload notification for:', upload.id, 'Base URL:', baseUrl);
      await processUploadNotification(upload, baseUrl);
      console.log('[OnUploadCreated] Completed successfully');
    } catch (error) {
      console.error('[OnUploadCreated] Error:', error);
      console.error('[OnUploadCreated] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // Don't throw - we don't want to fail the upload creation
    }
  }
);
