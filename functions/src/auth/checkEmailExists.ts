import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pre-signup check — whether Firebase Auth already has this email.
 */
export const checkAuthEmailExists = functions.https.onCall(
  {
    region: 'us-central1',
    invoker: 'public',
  },
  async (request) => {
    const email = String(request.data?.email ?? '')
      .trim()
      .toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email');
    }

    try {
      await admin.auth().getUserByEmail(email);
      return { exists: true };
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/user-not-found') {
        return { exists: false };
      }
      console.error('[checkAuthEmailExists] failed', error);
      throw new functions.https.HttpsError('internal', 'Email check failed');
    }
  }
);
