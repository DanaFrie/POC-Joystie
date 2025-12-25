import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { sendNotificationEmail } from './email';
import { processScheduledNotifications, processUploadNotification } from './notifications';

// Initialize Firebase Admin
admin.initializeApp();

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
 * Test Firebase Function to send email notification
 * This function sends a test email to verify email configuration
 * 
 * Usage: Call this function via HTTP GET or POST request
 * Example: curl https://us-central1-joystie-poc.cloudfunctions.net/testEmailNotification
 * 
 * Prerequisites:
 * 1. Set up email secrets:
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_SERVICE=workspace
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_USER=info@joystie.com
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_PASSWORD=<app-password>
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_FROM=info@joystie.com
 */
export const testEmailNotification = functions.https.onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '256MiB',
    cors: true, // Enable CORS
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
      const baseUrl = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
      const testEmail = 'frododana@gmail.com';
      const title = 'בדיקת התראות אימייל - Joystie';
      const content = `
        <p>שלום!</p>
        <p>זוהי הודעת בדיקה להתראות אימייל מ-Joystie.</p>
        <p>אם קיבלת את המייל הזה, זה אומר שההגדרה עובדת בהצלחה! ✅</p>
        <p>המייל נשלח מ-<strong>info@joystie.com</strong> באמצעות Google Workspace.</p>
        <p>תאריך ושעה: ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}</p>
      `;

      console.log('[TestEmail] Sending test email to:', testEmail);
      console.log('[TestEmail] From: info@joystie.com');
      console.log('[TestEmail] Base URL:', baseUrl);

      await sendNotificationEmail(
        testEmail,
        title,
        content,
        'ללוח הבקרה',
        `${baseUrl}/dashboard`,
        baseUrl
      );

      console.log('[TestEmail] Email sent successfully');

      res.status(200).json({
        success: true,
        message: `Email sent successfully to ${testEmail}`,
      });
    } catch (error: any) {
      console.error('[TestEmail] Error sending email:', error);
      res.status(500).json({
        success: false,
        error: `Failed to send test email: ${error.message}`,
      });
    }
  }
);

/**
 * Scheduled function for automated email notifications
 * Runs every 5 minutes to check for notification triggers at specific times:
 * - 7:08 AM: First day of challenge notification
 * - 7:07 AM: Missing upload notifications
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
