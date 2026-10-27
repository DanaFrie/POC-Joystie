/**
 * Cardcom trial checkout (S2 payment gate) + consultant ChargeOnly.
 */
import { getFunctionsInstance } from '@/lib/firebase';
import type { OnboardingSubscriptionPlan } from '@/constants/onboarding-subscription-layout';
import type { ConsultantOfferId } from '@/constants/consultant-marketing';
import { httpsCallable } from 'firebase/functions';
import { billingCallableErrorMessage } from '@/lib/api/billingErrors';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('BillingAPI');

export interface CardcomTrialCheckoutResult {
  checkoutUrl: string;
  lowProfileId: string;
  trialEndsAt: string;
}

export interface CardcomTrialCheckoutInput {
  plan: OnboardingSubscriptionPlan;
}

/** Start 30-day trial — redirects parent to Cardcom hosted page. */
export async function createCardcomTrialCheckout(
  input: CardcomTrialCheckoutInput
): Promise<CardcomTrialCheckoutResult> {
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<CardcomTrialCheckoutInput, CardcomTrialCheckoutResult>(
    functions,
    'createCardcomTrialCheckout'
  );
  logger.log('createCardcomTrialCheckout', { plan: input.plan });
  try {
    const { data } = await fn(input);
    return data;
  } catch (err) {
    logger.error('createCardcomTrialCheckout failed', err);
    throw new Error(billingCallableErrorMessage(err));
  }
}

export interface CardcomConsultantCheckoutInput {
  /** `group` is the manual participant link, not a button on the consultant page. */
  offerId: ConsultantOfferId;
  /** Greeting name in the meeting-confirmed mail. */
  name: string;
  /** Where to send the meeting-confirmed mail. */
  email: string;
  guestKey?: string;
}

export interface CardcomConsultantCheckoutResult {
  checkoutUrl: string;
  lowProfileId: string;
  amountShekels: number;
  offerId: ConsultantOfferId;
}

function getOrCreateConsultantGuestKey(): string {
  if (typeof window === 'undefined') return `g${Date.now()}`;
  const key = 'joystie_consultant_guest';
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const next = `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return `g${Date.now()}`;
  }
}

/** Cardcom hosted charge for a private session (₪260) or group workshop (₪100). */
export async function createCardcomConsultantCheckout(
  input: CardcomConsultantCheckoutInput
): Promise<CardcomConsultantCheckoutResult> {
  const functions = await getFunctionsInstance();
  const payload: CardcomConsultantCheckoutInput = {
    offerId: input.offerId,
    name: input.name.trim(),
    email: input.email.trim(),
    guestKey: input.guestKey || getOrCreateConsultantGuestKey(),
  };
  const fn = httpsCallable<
    CardcomConsultantCheckoutInput,
    CardcomConsultantCheckoutResult
  >(functions, 'createCardcomConsultantCheckout');
  logger.log('createCardcomConsultantCheckout', { offerId: payload.offerId });
  try {
    const { data } = await fn(payload);
    return data;
  } catch (err) {
    logger.error('createCardcomConsultantCheckout failed', err);
    throw new Error(billingCallableErrorMessage(err));
  }
}

export type ConsultantCheckoutStatus = 'paid' | 'pending' | 'failed' | 'unknown';

/** Status only. The callable never returns the payer name or email. */
export async function getConsultantCheckoutStatus(
  orderId: string
): Promise<ConsultantCheckoutStatus> {
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<{ orderId: string }, { status: ConsultantCheckoutStatus }>(
    functions,
    'getConsultantCheckoutStatus'
  );
  try {
    const { data } = await fn({ orderId });
    return data.status;
  } catch (err) {
    logger.error('getConsultantCheckoutStatus failed', err);
    throw new Error(billingCallableErrorMessage(err));
  }
}
