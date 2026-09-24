import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { authOnUserCreated } from './auth/onUserCreate';
import { checkAuthEmailExists } from './auth/checkEmailExists';
import {
  recordBondingInvite,
  markBondingWhatsAppShared,
  markBondingChildLinkOpened,
  resolveBondingInvite,
  resolveBondingGameRoom,
  reportChildOnboardingMilestone,
  getChildOnboardingProgress,
  consumeBondingInvite,
} from './bonding/invites';
import {
  createGameRoom,
  joinGameRoom,
  getGameOnboardingStatus,
  completeGameOnboarding,
  endOnboardingGameRoom,
} from './game/rooms';
import { generateSelfie } from './selfie/generateSelfie';
import { saveChildShareCard } from './shareCard/saveChildShareCard';
import { getChildShareCardAccess } from './shareCard/getChildShareCardAccess';
import { createCardcomTrialCheckout, cardcomWebhook } from './billing/cardcom/handlers';

// Initialize Firebase Admin
// In Firebase Functions Gen 2, this automatically uses the default service account
// which has permissions to access Firestore
if (!admin.apps.length) {
  admin.initializeApp();
}

export {
  authOnUserCreated,
  checkAuthEmailExists,
  recordBondingInvite,
  markBondingWhatsAppShared,
  markBondingChildLinkOpened,
  resolveBondingInvite,
  resolveBondingGameRoom,
  reportChildOnboardingMilestone,
  getChildOnboardingProgress,
  consumeBondingInvite,
  createGameRoom,
  joinGameRoom,
  getGameOnboardingStatus,
  completeGameOnboarding,
  endOnboardingGameRoom,
  generateSelfie,
  saveChildShareCard,
  getChildShareCardAccess,
  createCardcomTrialCheckout,
  cardcomWebhook,
};

// Define secret for Cloud Run service URL
// This secret must be set using: firebase functions:secrets:set CLOUD_RUN_SERVICE_URL
const cloudRunServiceUrl = defineSecret('CLOUD_RUN_SERVICE_URL');

interface ProcessScreenshotRequest {
  imageData: string; // Base64 encoded image
  targetDay?: string; // Ignored – always "weekly"
}

interface ProcessScreenshotResponse {
  success: boolean;
  day?: string;
  minutes?: number;
  found?: boolean;
  /** When targetDay is "weekly", minutes per Hebrew day name */
  minutes_per_day?: Record<string, number>;
  /** When true, front should show that manual review is required */
  manual_review_required?: boolean;
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

    const { imageData } = request.data as ProcessScreenshotRequest;

    if (!imageData) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameter: imageData'
      );
    }
    // Always weekly – deploy one mode only
    const effectiveTargetDay = 'weekly';

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
      console.log('[Function] Processing screenshot, targetDay:', effectiveTargetDay);
      
      const response = await fetch(cloudRunUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            imageData,
            targetDay: effectiveTargetDay
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
        day: effectiveTargetDay,
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

export { getServiceAccount } from './serviceAccount';

