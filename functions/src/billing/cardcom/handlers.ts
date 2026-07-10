import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { createLowProfileDeal, getLowProfileResult } from './client';
import { CARDCOM_PAY_FAILED_PATH, CARDCOM_PAY_SUCCESS_PATH } from './paths';
import { extractTokenFromLpResult, saveBillingToken } from './tokenStore';
import { getServiceAccount } from '../../serviceAccount';
import type { CardcomWebhookPayload, SubscriptionPlan } from './types';

const cardcomTerminal = defineSecret('CARDCOM_TERMINAL_NUMBER');
const cardcomApiName = defineSecret('CARDCOM_API_NAME');
const cardcomApiPassword = defineSecret('CARDCOM_API_PASSWORD');
const baseUrlSecret = defineSecret('SERVICE_FUNCTION_BASE_URL');

const TRIAL_DAYS = 30;

function getDb() {
  return admin.firestore();
}

function getCreds() {
  return {
    terminalNumber: Number(cardcomTerminal.value()),
    apiName: cardcomApiName.value(),
    apiPassword: cardcomApiPassword.value() || undefined,
  };
}

function getBaseUrl(): string {
  return baseUrlSecret.value() || 'https://joystie.com';
}

/** Cardcom must POST to a stable HTTPS endpoint (Cloud Function URL). */
function getCardcomWebhookUrl(): string {
  const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  if (project) {
    return `https://us-central1-${project}.cloudfunctions.net/cardcomWebhook`;
  }
  return `${getBaseUrl()}/api/cardcom/webhook`;
}

function parsePlan(raw: unknown): SubscriptionPlan | undefined {
  return raw === 'annual' || raw === 'monthly' ? raw : undefined;
}

/**
 * Start 30-day trial — hosted Cardcom page (card tokenization).
 */
export const createCardcomTrialCheckout = functions.https.onCall(
  {
    region: 'us-central1',
    // Browser callable + CORS preflight — auth enforced in handler via request.auth.
    invoker: 'public',
    serviceAccount: getServiceAccount(),
    secrets: [cardcomTerminal, cardcomApiName, cardcomApiPassword, baseUrlSecret],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const uid = request.auth.uid;
    const plan = parsePlan(request.data?.plan);

    try {
      const base = getBaseUrl();
      const returnValue = `trial_${uid}_${Date.now()}`;

      const result = await createLowProfileDeal(getCreds(), {
        Operation: 'CreateTokenOnly',
        ReturnValue: returnValue,
        Amount: 0,
        ProductName: 'Joystie 30-day trial',
        SuccessRedirectUrl: `${base}${CARDCOM_PAY_SUCCESS_PATH}`,
        FailedRedirectUrl: `${base}${CARDCOM_PAY_FAILED_PATH}`,
        WebHookUrl: getCardcomWebhookUrl(),
        Language: 'he',
        ISOCoinId: 1,
        AdvancedDefinition: {
          JValidateType: 2, // J2 — card validity only; no hold or charge
        },
      });

      const now = new Date();
      const trialEnds = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      await getDb()
        .collection('users')
        .doc(uid)
        .set(
          {
            subscription: {
              provider: 'cardcom',
              status: 'checkout_pending',
              ...(plan ? { plan } : {}),
              trialEndsAt: trialEnds.toISOString(),
              lowProfileId: result.LowProfileId,
              returnValue,
              updatedAt: now.toISOString(),
            },
            updatedAt: now.toISOString(),
          },
          { merge: true }
        );

      return {
        checkoutUrl: result.Url,
        lowProfileId: result.LowProfileId,
        trialEndsAt: trialEnds.toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[createCardcomTrialCheckout]', err);
      if (message.includes('invalid_grant')) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Firestore auth failed in emulator — run `npm run emulators:billing` (functions + firestore), not functions-only.'
        );
      }
      if (message.includes('Cardcom')) {
        throw new functions.https.HttpsError('failed-precondition', message);
      }
      throw new functions.https.HttpsError('internal', message || 'Checkout failed');
    }
  }
);

/**
 * Cardcom server-to-server webhook — verify with GetLpResult before trusting.
 */
export const cardcomWebhook = functions.https.onRequest(
  {
    region: 'us-central1',
    // Cardcom server POST — no Firebase auth; verified via GetLpResult.
    invoker: 'public',
    serviceAccount: getServiceAccount(),
    secrets: [cardcomTerminal, cardcomApiName, cardcomApiPassword],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const payload = req.body as CardcomWebhookPayload;
      const lowProfileId = String(payload.LowProfileId || '');
      const returnValue = String(payload.ReturnValue || '');

      if (!lowProfileId || !returnValue.startsWith('trial_')) {
        res.status(400).send('Invalid payload');
        return;
      }

      const verified = await getLowProfileResult(getCreds(), lowProfileId);
      const responseCode = Number(verified.ResponseCode ?? payload.ResponseCode ?? -1);

      const uid = returnValue.split('_')[1];
      if (!uid) {
        res.status(400).send('Invalid ReturnValue');
        return;
      }

      const now = new Date().toISOString();
      if (responseCode === 0) {
        const userRef = getDb().collection('users').doc(uid);
        const existing = await userRef.get();
        const existingSub = existing.data()?.subscription as
          | { trialEndsAt?: string; plan?: SubscriptionPlan }
          | undefined;
        const trialEndsAt =
          existingSub?.trialEndsAt ||
          new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();

        const storedToken = extractTokenFromLpResult(verified, payload);
        if (!storedToken) {
          console.error('[cardcomWebhook] success but no Token in GetLpResult', {
            uid,
            lowProfileId,
          });
        } else {
          await saveBillingToken(getDb(), uid, lowProfileId, storedToken, now);
        }

        await userRef.set(
          {
            subscription: {
              provider: 'cardcom',
              status: 'trialing',
              ...(existingSub?.plan ? { plan: existingSub.plan } : {}),
              trialEndsAt,
              lowProfileId,
              cardcomVerifiedAt: now,
              hasStoredToken: Boolean(storedToken),
              ...(storedToken?.last4 ? { cardLast4: storedToken.last4 } : {}),
              updatedAt: now,
            },
            challengeUnlocked: true,
            updatedAt: now,
          },
          { merge: true }
        );
      } else {
        await getDb()
          .collection('users')
          .doc(uid)
          .set(
            {
              subscription: {
                provider: 'cardcom',
                status: 'payment_failed',
                lastError: String(verified.Description || payload.Description || ''),
                updatedAt: now,
              },
              updatedAt: now,
            },
            { merge: true }
          );
      }

      res.status(200).send('OK');
    } catch (err) {
      console.error('[cardcomWebhook]', err);
      res.status(500).send('Error');
    }
  }
);
