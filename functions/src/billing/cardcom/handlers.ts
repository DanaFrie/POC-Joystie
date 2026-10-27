import { createHash } from 'crypto';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { createLowProfileDeal, getLowProfileResult } from './client';
import {
  CARDCOM_CONSULTANT_PAY_FAILED_PATH,
  CARDCOM_CONSULTANT_PAY_SUCCESS_PATH,
  CARDCOM_PAY_FAILED_PATH,
  CARDCOM_PAY_SUCCESS_PATH,
} from './paths';
import { extractTokenFromLpResult, saveBillingToken } from './tokenStore';
import { sendConsultantMeetingConfirmedEmail } from '../../mail/sendLifecycle';
import { getServiceAccount } from '../../serviceAccount';
import type { CardcomWebhookPayload, SubscriptionPlan } from './types';

type ConsultantOfferId = 'private' | 'group';

const CONSULTANT_OFFERS: Record<
  ConsultantOfferId,
  { amount: number; productName: string }
> = {
  private: { amount: 260, productName: 'Joystie - פגישה אישית' },
  group: { amount: 100, productName: 'Joystie - סדנת הורים' },
};

function parsePayerName(raw: unknown): string | undefined {
  const value = String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!value || value.length > 80) return undefined;
  if (/[<>]/.test(value)) return undefined;
  return value;
}

function parsePayerEmail(raw: unknown): string | undefined {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!value || value.length > 150) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return undefined;
  return value;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function parseConsultantOffer(raw: unknown): ConsultantOfferId | undefined {
  return raw === 'private' || raw === 'group' ? raw : undefined;
}

/** Order ids we mint: consultant_{offer}_{payerKey}_{timestamp}. */
const CONSULTANT_ORDER_ID = /^consultant_(private|group)_[A-Za-z0-9_-]{1,80}_\d{10,16}$/;

function isConsultantOrderId(raw: string): boolean {
  return raw.length <= 120 && CONSULTANT_ORDER_ID.test(raw);
}

function offerFromOrderId(orderId: string): ConsultantOfferId | undefined {
  return parseConsultantOffer(orderId.split('_')[1]);
}

function chargedShekels(verified: Record<string, unknown>): number | undefined {
  const trx = asRecord(verified.TranzactionInfo);
  const doc = asRecord(verified.DocumentInfo);
  const raw = trx?.Amount ?? verified.Amount ?? doc?.Amount;
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return Math.round(num);
}

function callerIp(request: {
  rawRequest?: { ip?: string; headers?: Record<string, string | string[] | undefined> };
}): string {
  const forwarded = request.rawRequest?.headers?.['x-forwarded-for'];
  const header = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof header === 'string' && header.trim()) {
    const parts = header
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  return request.rawRequest?.ip || 'unknown';
}

function limitDocId(kind: string, value: string, hour: string): string {
  return createHash('sha256').update(`${kind}|${hour}|${value}`).digest('hex').slice(0, 32);
}

/** Caps CardCom session creation. Email and IP are counted separately per hour. */
async function assertCheckoutRateLimit(email: string, ip: string): Promise<void> {
  const hour = new Date().toISOString().slice(0, 13);
  const checks: { id: string; limit: number }[] = [
    { id: limitDocId('email', email, hour), limit: 4 },
    { id: limitDocId('ip', ip, hour), limit: 10 },
  ];
  for (const check of checks) {
    const allowed = await getDb().runTransaction(async (tx) => {
      const ref = getDb().collection('consultant_checkout_limits').doc(check.id);
      const snap = await tx.get(ref);
      const count = Number(snap.data()?.count || 0);
      if (count >= check.limit) return false;
      tx.set(
        ref,
        { count: count + 1, hour, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      return true;
    });
    if (!allowed) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'יותר מדי ניסיונות תשלום. נסו שוב מאוחר יותר.'
      );
    }
  }
}

const cardcomTerminal = defineSecret('CARDCOM_TERMINAL_NUMBER');
const cardcomApiName = defineSecret('CARDCOM_API_NAME');
const cardcomApiPassword = defineSecret('CARDCOM_API_PASSWORD');
const baseUrlSecret = defineSecret('SERVICE_FUNCTION_BASE_URL');
const emailUser = defineSecret('SERVICE_FUNCTION_EMAIL_USER');
const emailPassword = defineSecret('SERVICE_FUNCTION_EMAIL_PASSWORD');
const emailFrom = defineSecret('SERVICE_FUNCTION_EMAIL_FROM');

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
  let raw = (baseUrlSecret.value() || 'https://joystie.com').trim().replace(/\/$/, '');
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }
  return raw;
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
 * ChargeOnly for a private session (₪260) or a group workshop (₪100).
 * Group is not a site button. The link is sent to each participant.
 * Auth optional.
 */
export const createCardcomConsultantCheckout = functions.https.onCall(
  {
    region: 'us-central1',
    invoker: 'public',
    serviceAccount: getServiceAccount(),
    secrets: [cardcomTerminal, cardcomApiName, cardcomApiPassword, baseUrlSecret],
  },
  async (request) => {
    const offerId = parseConsultantOffer(request.data?.offerId);
    if (!offerId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'offerId must be private or group'
      );
    }
    const payerEmail = parsePayerEmail(request.data?.email);
    const payerName = parsePayerName(request.data?.name);
    if (!payerName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'נדרש שם לאישור המפגש'
      );
    }
    if (!payerEmail) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'נדרשת כתובת מייל תקינה לאישור המפגש'
      );
    }
    await assertCheckoutRateLimit(payerEmail, callerIp(request));
    const offer = CONSULTANT_OFFERS[offerId];
    const uid = request.auth?.uid || null;
    const guestKey = String(request.data?.guestKey || '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 40);
    const payerKey = uid || guestKey || `g${Date.now()}`;

    try {
      const base = getBaseUrl();
      const returnValue = `consultant_${offerId}_${payerKey}_${Date.now()}`;

      const result = await createLowProfileDeal(getCreds(), {
        Operation: 'ChargeOnly',
        ReturnValue: returnValue,
        Amount: offer.amount,
        ProductName: offer.productName,
        SuccessRedirectUrl: `${base}${CARDCOM_CONSULTANT_PAY_SUCCESS_PATH}/${encodeURIComponent(returnValue)}`,
        FailedRedirectUrl: `${base}${CARDCOM_CONSULTANT_PAY_FAILED_PATH}/${offerId}`,
        WebHookUrl: getCardcomWebhookUrl(),
        Language: 'he',
        ISOCoinId: 1,
      });

      const now = new Date().toISOString();
      await getDb()
        .collection('consultant_orders')
        .doc(returnValue)
        .set({
          offerId,
          amountShekels: offer.amount,
          status: 'checkout_pending',
          uid,
          payerKey,
          payerName,
          payerEmail,
          lowProfileId: result.LowProfileId,
          returnValue,
          createdAt: now,
          updatedAt: now,
        });

      return {
        checkoutUrl: result.Url,
        lowProfileId: result.LowProfileId,
        amountShekels: offer.amount,
        offerId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[createCardcomConsultantCheckout]', err);
      if (message.includes('Cardcom')) {
        throw new functions.https.HttpsError('failed-precondition', message);
      }
      throw new functions.https.HttpsError('internal', message || 'Checkout failed');
    }
  }
);

export type ConsultantCheckoutStatus = 'paid' | 'pending' | 'failed' | 'unknown';

/** Public read of a consultant order. Returns status only, never payer details. */
export const getConsultantCheckoutStatus = functions.https.onCall(
  {
    region: 'us-central1',
    invoker: 'public',
    serviceAccount: getServiceAccount(),
  },
  async (request): Promise<{ status: ConsultantCheckoutStatus }> => {
    const orderId = String(request.data?.orderId || '').trim();
    if (!isConsultantOrderId(orderId)) return { status: 'unknown' };
    const snap = await getDb().collection('consultant_orders').doc(orderId).get();
    if (!snap.exists) return { status: 'unknown' };
    const status = String(snap.data()?.status || '');
    if (status === 'paid') return { status: 'paid' };
    if (status === 'payment_failed' || status === 'amount_mismatch') return { status: 'failed' };
    return { status: 'pending' };
  }
);

async function sendMeetingConfirmation(
  orderRef: admin.firestore.DocumentReference,
  email: string,
  name: string
): Promise<void> {
  const claimed = await getDb().runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    const data = snap.data() || {};
    if (data.confirmationEmailSentAt) return 'sent' as const;
    const claimedAt = Date.parse(String(data.confirmationEmailClaimedAt || ''));
    if (Number.isFinite(claimedAt) && Date.now() - claimedAt < 2 * 60 * 1000) {
      return 'inflight' as const;
    }
    tx.set(
      orderRef,
      { confirmationEmailClaimedAt: new Date().toISOString(), payerEmail: email },
      { merge: true }
    );
    return 'claim' as const;
  });
  if (claimed === 'inflight') {
    throw new Error('confirmation email still in progress');
  }
  if (claimed !== 'claim') return;

  try {
    await sendConsultantMeetingConfirmedEmail({ to: email, name });
    await orderRef.set(
      {
        confirmationEmailSentAt: new Date().toISOString(),
        payerEmail: email,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    await orderRef.set(
      { confirmationEmailClaimedAt: null, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    throw err;
  }
}

async function handleConsultantWebhook(
  returnValue: string,
  lowProfileId: string,
  responseCode: number,
  description: string,
  verified: Record<string, unknown>
): Promise<number> {
  const offerId = offerFromOrderId(returnValue);
  const now = new Date().toISOString();
  const orderRef = getDb().collection('consultant_orders').doc(returnValue);
  const existing = await orderRef.get();
  if (!existing.exists || !offerId) {
    console.error('[cardcomWebhook] consultant order missing', { returnValue, lowProfileId });
    return 400;
  }
  const base = existing.data() || {};
  const verifiedLp = String(verified.LowProfileId || '');
  if (verifiedLp && verifiedLp !== lowProfileId) {
    console.error('[cardcomWebhook] LowProfileId mismatch', { returnValue, lowProfileId });
    return 400;
  }

  const trxCode = asRecord(verified.TranzactionInfo)?.ResponseCode;
  const chargeFailed =
    responseCode !== 0 ||
    (trxCode !== undefined && trxCode !== null && trxCode !== '' && Number(trxCode) !== 0);

  if (!chargeFailed) {
    const paidAmount = chargedShekels(verified);
    const expected = CONSULTANT_OFFERS[offerId].amount;
    if (paidAmount == null || paidAmount !== expected) {
      console.error('[cardcomWebhook] consultant amount mismatch', {
        returnValue,
        lowProfileId,
        paidAmount: paidAmount ?? null,
        expected,
      });
      await orderRef.set(
        {
          status: 'amount_mismatch',
          lowProfileId,
          chargedShekels: paidAmount ?? null,
          updatedAt: now,
        },
        { merge: true }
      );
      return 200;
    }

    await orderRef.set(
      {
        offerId,
        amountShekels: paidAmount,
        status: 'paid',
        lowProfileId,
        cardcomVerifiedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    const email = parsePayerEmail(base.payerEmail);
    const name = parsePayerName(base.payerName);
    if (!email || !name) {
      console.error('[cardcomWebhook] consultant paid but missing mail greeting', {
        returnValue,
        lowProfileId,
        hasEmail: Boolean(email),
        hasName: Boolean(name),
      });
    } else {
      await sendMeetingConfirmation(orderRef, email, name);
    }
  } else {
    await orderRef.set(
      {
        ...base,
        status: 'payment_failed',
        lowProfileId,
        lastError: description,
        updatedAt: now,
      },
      { merge: true }
    );
  }
  return 200;
}

/**
 * Cardcom server-to-server webhook — verify with GetLpResult before trusting.
 */
export const cardcomWebhook = functions.https.onRequest(
  {
    region: 'us-central1',
    // Cardcom server POST — no Firebase auth; verified via GetLpResult.
    invoker: 'public',
    serviceAccount: getServiceAccount(),
    secrets: [
      cardcomTerminal,
      cardcomApiName,
      cardcomApiPassword,
      emailUser,
      emailPassword,
      emailFrom,
    ],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const payload = req.body as CardcomWebhookPayload;
      const lowProfileId = String(payload.LowProfileId || '');

      if (!lowProfileId) {
        res.status(400).send('Invalid payload');
        return;
      }

      const verified = await getLowProfileResult(getCreds(), lowProfileId);
      if (verified.ResponseCode === undefined || verified.ResponseCode === null || verified.ResponseCode === '') {
        res.status(400).send('Unverified result');
        return;
      }
      const responseCode = Number(verified.ResponseCode);
      if (!Number.isFinite(responseCode)) {
        res.status(400).send('Unverified result');
        return;
      }
      const verifiedReturn = String(verified.ReturnValue ?? '').trim();
      if (!verifiedReturn) {
        res.status(400).send('Unverified result');
        return;
      }
      const bodyReturn = String(payload.ReturnValue || '').trim();
      if (bodyReturn && bodyReturn !== verifiedReturn) {
        res.status(400).send('ReturnValue mismatch');
        return;
      }
      const returnValue = verifiedReturn;
      const description = String(verified.Description || '');

      const isTrial = returnValue.startsWith('trial_');
      const isConsultant = returnValue.startsWith('consultant_');
      if (!isTrial && !isConsultant) {
        res.status(400).send('Invalid payload');
        return;
      }

      if (isConsultant) {
        const status = await handleConsultantWebhook(
          returnValue,
          lowProfileId,
          responseCode,
          description,
          verified
        );
        res.status(status).send(status === 200 ? 'OK' : 'Invalid payload');
        return;
      }

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
        // Trial starts when the card is stored, not when checkout was opened.
        const trialEndsAt = new Date(
          Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000
        ).toISOString();

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
                lastError: description,
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
