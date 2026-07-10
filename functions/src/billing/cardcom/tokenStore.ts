import type * as admin from 'firebase-admin';
import type { CardcomWebhookPayload } from './types';

/** Parsed card token from GetLpResult — used for post-trial charges (Cardcom Step 3). */
export interface CardcomStoredToken {
  token: string;
  tokenExDate?: string;
  cardMonth?: number;
  cardYear?: number;
  tokenApprovalNumber?: string;
  last4?: string;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const str = String(value).trim();
    if (str) return str;
  }
  return undefined;
}

function pickInt(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

/** Extract TokenInfo from LowProfile GetLpResult (and webhook payload fallbacks). */
export function extractTokenFromLpResult(
  verified: Record<string, unknown>,
  payload?: CardcomWebhookPayload
): CardcomStoredToken | null {
  const tokenInfo = asRecord(verified.TokenInfo);
  const tranzactionInfo = asRecord(verified.TranzactionInfo);

  const token = pickString(tokenInfo?.Token, payload?.Token, verified.Token);
  if (!token) return null;

  const last4 = pickString(
    tranzactionInfo?.Last4CardDigitsString,
    tranzactionInfo?.Last4CardDigits
  );

  return {
    token,
    tokenExDate: pickString(tokenInfo?.TokenExDate),
    cardMonth: pickInt(tokenInfo?.CardMonth),
    cardYear: pickInt(tokenInfo?.CardYear),
    tokenApprovalNumber: pickString(tokenInfo?.TokenApprovalNumber),
    ...(last4 ? { last4 } : {}),
  };
}

/** Server-only storage — clients cannot read `billing_tokens` (see firestore.rules). */
export async function saveBillingToken(
  db: admin.firestore.Firestore,
  uid: string,
  lowProfileId: string,
  stored: CardcomStoredToken,
  now: string
): Promise<void> {
  const ref = db.collection('billing_tokens').doc(uid);
  const existing = await ref.get();

  await ref.set(
    {
      provider: 'cardcom',
      token: stored.token,
      ...(stored.tokenExDate ? { tokenExDate: stored.tokenExDate } : {}),
      ...(stored.cardMonth !== undefined ? { cardMonth: stored.cardMonth } : {}),
      ...(stored.cardYear !== undefined ? { cardYear: stored.cardYear } : {}),
      ...(stored.tokenApprovalNumber
        ? { tokenApprovalNumber: stored.tokenApprovalNumber }
        : {}),
      ...(stored.last4 ? { last4: stored.last4 } : {}),
      lowProfileId,
      updatedAt: now,
      ...(!existing.exists ? { createdAt: now } : {}),
    },
    { merge: true }
  );
}
