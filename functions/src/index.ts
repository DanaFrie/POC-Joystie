import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { 
  processScheduledNotifications, 
  processUploadNotification,
  sendFirstDayNotification,
  sendFirstUploadSuccessNotification,
  sendFirstUploadFailureNotification,
  sendTwoPendingApprovalsNotification,
  sendMissingUploadNotification,
  generateUploadUrl
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
 * Test Firebase Function to send all notification types
 * This function sends all 8 notification types in a single request for testing:
 * 1. First day of challenge
 * 2. First upload - success
 * 3. First upload - failure
 * 4. Two pending approvals
 * 5. Missing upload (day 3)
 * 6. Missing upload (day 4)
 * 7. Missing upload (day 6) - includes button "להעלאת דיווח"
 * 8. Missing upload (day 7) - includes link to consultation
 * 
 * Usage: Call this function via HTTP GET or POST request
 * Example: curl https://us-central1-joystie-poc.cloudfunctions.net/testAllNotifications?challengeId=xxx
 * 
 * Query Parameters:
 * - challengeId (required): The challenge ID to use for testing
 * 
 * Prerequisites:
 * 1. Set up email secrets:
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_SERVICE=workspace
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_USER=info@joystie.com
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_PASSWORD=<app-password>
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_FROM=info@joystie.com
 *    firebase functions:secrets:set SERVICE_FUNCTION_BASE_URL=https://joystie.com
 */
export const testAllNotifications = functions.https.onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 120,
    memory: '512MiB',
    cors: true, // Enable CORS
    // Use Firebase Admin SDK service account which has Firestore permissions
    serviceAccount: 'firebase-adminsdk-fbsvc@joystie-poc.iam.gserviceaccount.com',
    secrets: [
      'SERVICE_FUNCTION_EMAIL_SERVICE',
      'SERVICE_FUNCTION_EMAIL_USER',
      'SERVICE_FUNCTION_EMAIL_PASSWORD',
      'SERVICE_FUNCTION_EMAIL_FROM',
      'SERVICE_FUNCTION_BASE_URL',
      // Note: SERVICE_FUNCTION_SENDGRID_API_KEY is optional - only add if using SendGrid
    ],
  },
  async (req, res) => {
    try {
      const challengeId = req.query.challengeId as string;
      
      if (!challengeId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: challengeId',
        });
        return;
      }

      const baseUrl = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
      console.log('[TestAllNotifications] Starting test for challenge:', challengeId);
      console.log('[TestAllNotifications] Base URL:', baseUrl);

      // Get challenge data
      const challengeRef = admin.firestore().collection('challenges').doc(challengeId);
      const challengeDoc = await challengeRef.get();
      
      if (!challengeDoc.exists) {
        res.status(404).json({
          success: false,
          error: `Challenge ${challengeId} not found`,
        });
        return;
      }

      const challenge = {
        id: challengeDoc.id,
        ...challengeDoc.data()
      } as any;

      // Get parent and child data
      const parentRef = admin.firestore().collection('users').doc(challenge.parentId);
      const parentDoc = await parentRef.get();
      
      if (!parentDoc.exists) {
        res.status(404).json({
          success: false,
          error: `Parent ${challenge.parentId} not found`,
        });
        return;
      }

      const parent = {
        id: parentDoc.id,
        ...parentDoc.data()
      } as any;

      const childRef = admin.firestore().collection('children').doc(challenge.childId);
      const childDoc = await childRef.get();
      
      if (!childDoc.exists) {
        res.status(404).json({
          success: false,
          error: `Child ${challenge.childId} not found`,
        });
        return;
      }

      const child = {
        id: childDoc.id,
        ...childDoc.data()
      } as any;

      // Get uploads for challenge (for testing first upload failure notification)
      const uploadsRef = admin.firestore().collection('daily_uploads');
      const uploadsQuery = await uploadsRef
        .where('challengeId', '==', challengeId)
        .limit(1)
        .get();
      
      let testUpload: any = null;
      if (!uploadsQuery.empty) {
        const uploadDoc = uploadsQuery.docs[0];
        testUpload = {
          id: uploadDoc.id,
          ...uploadDoc.data(),
          uploadedAt: uploadDoc.data().uploadedAt || new Date().toISOString()
        };
      } else {
        // Create a mock upload for testing
        testUpload = {
          id: 'test-upload-id',
          challengeId: challengeId,
          parentId: challenge.parentId,
          childId: challenge.childId,
          uploadedAt: new Date().toISOString(),
          success: false
        };
      }

      const results: string[] = [];

      // Send all 8 notification types
      try {
        console.log('[TestAllNotifications] Sending notification 1: First day of challenge');
        await sendFirstDayNotification(challenge, parent, child, baseUrl);
        results.push('1. First day notification - sent');
      } catch (error: any) {
        results.push(`1. First day notification - error: ${error.message}`);
      }

      try {
        console.log('[TestAllNotifications] Sending notification 2: First upload - success');
        await sendFirstUploadSuccessNotification(challenge, parent, child, baseUrl);
        results.push('2. First upload success notification - sent');
      } catch (error: any) {
        results.push(`2. First upload success notification - error: ${error.message}`);
      }

      try {
        console.log('[TestAllNotifications] Sending notification 3: First upload - failure');
        await sendFirstUploadFailureNotification(challenge, parent, child, testUpload, baseUrl);
        results.push('3. First upload failure notification - sent');
      } catch (error: any) {
        results.push(`3. First upload failure notification - error: ${error.message}`);
      }

      try {
        console.log('[TestAllNotifications] Sending notification 4: Two pending approvals');
        await sendTwoPendingApprovalsNotification(challenge, parent, child, baseUrl);
        results.push('4. Two pending approvals notification - sent');
      } catch (error: any) {
        results.push(`4. Two pending approvals notification - error: ${error.message}`);
      }

      // Send all missing upload notifications (days 3, 4, 6, 7)
      try {
        console.log('[TestAllNotifications] Sending notification 5: Missing upload (day 3)');
        const uploadUrl = generateUploadUrl(challenge.parentId, challenge.childId, challenge.id, baseUrl);
        await sendMissingUploadNotification(challenge, parent, child, 3, baseUrl, uploadUrl);
        results.push('5. Missing upload notification (day 3) - sent');
      } catch (error: any) {
        results.push(`5. Missing upload notification (day 3) - error: ${error.message}`);
      }

      try {
        console.log('[TestAllNotifications] Sending notification 6: Missing upload (day 4)');
        const uploadUrl = generateUploadUrl(challenge.parentId, challenge.childId, challenge.id, baseUrl);
        await sendMissingUploadNotification(challenge, parent, child, 4, baseUrl, uploadUrl);
        results.push('6. Missing upload notification (day 4) - sent');
      } catch (error: any) {
        results.push(`6. Missing upload notification (day 4) - error: ${error.message}`);
      }

      try {
        console.log('[TestAllNotifications] Sending notification 7: Missing upload (day 6)');
        const uploadUrl = generateUploadUrl(challenge.parentId, challenge.childId, challenge.id, baseUrl);
        await sendMissingUploadNotification(challenge, parent, child, 6, baseUrl, uploadUrl);
        results.push('7. Missing upload notification (day 6) - sent');
      } catch (error: any) {
        results.push(`7. Missing upload notification (day 6) - error: ${error.message}`);
      }

      try {
        console.log('[TestAllNotifications] Sending notification 8: Missing upload (day 7)');
        const uploadUrl = generateUploadUrl(challenge.parentId, challenge.childId, challenge.id, baseUrl);
        await sendMissingUploadNotification(challenge, parent, child, 7, baseUrl, uploadUrl);
        results.push('8. Missing upload notification (day 7) - sent');
      } catch (error: any) {
        results.push(`8. Missing upload notification (day 7) - error: ${error.message}`);
      }

      console.log('[TestAllNotifications] All notifications sent');

      res.status(200).json({
        success: true,
        message: 'All notification tests completed',
        results: results,
        challengeId: challengeId,
        parentEmail: parent.email,
        childName: child.name,
      });
    } catch (error: any) {
      console.error('[TestAllNotifications] Error:', error);
      res.status(500).json({
        success: false,
        error: `Failed to send test notifications: ${error.message}`,
      });
    }
  }
);

/**
 * Scheduled function for automated email notifications
 * Runs every 5 minutes to check for notification triggers at specific times:
 * - 7:08 AM: First day of challenge notification
 * - 7:07 AM: Missing upload notifications (continues until first upload - success or failure)
 * - 20:48 PM: Two pending approvals notification
 */
export const scheduledNotifications = functions.scheduler.onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'Asia/Jerusalem',
    region: 'us-central1',
    secrets: [
      'SERVICE_FUNCTION_EMAIL_SERVICE',
      'SERVICE_FUNCTION_EMAIL_USER',
      'SERVICE_FUNCTION_EMAIL_PASSWORD',
      'SERVICE_FUNCTION_EMAIL_FROM',
      'SERVICE_FUNCTION_BASE_URL',
    ],
  },
  async (event) => {
    try {
      const baseUrl = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
      console.log('[ScheduledNotifications] Running scheduled notifications check');
      await processScheduledNotifications(baseUrl);
      console.log('[ScheduledNotifications] Completed successfully');
    } catch (error) {
      console.error('[ScheduledNotifications] Error:', error);
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
    secrets: [
      'SERVICE_FUNCTION_EMAIL_SERVICE',
      'SERVICE_FUNCTION_EMAIL_USER',
      'SERVICE_FUNCTION_EMAIL_PASSWORD',
      'SERVICE_FUNCTION_EMAIL_FROM',
      'SERVICE_FUNCTION_BASE_URL',
    ],
  },
  async (event) => {
    try {
      if (!event.data) {
        console.warn('[OnUploadCreated] No data in event');
        return;
      }
      
      const upload = {
        id: event.data.id,
        ...event.data.data()
      } as any; // Type assertion needed for Firestore data
      
      const baseUrl = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
      console.log('[OnUploadCreated] Processing upload notification for:', upload.id);
      await processUploadNotification(upload, baseUrl);
      console.log('[OnUploadCreated] Completed successfully');
    } catch (error) {
      console.error('[OnUploadCreated] Error:', error);
      // Don't throw - we don't want to fail the upload creation
    }
  }
);
