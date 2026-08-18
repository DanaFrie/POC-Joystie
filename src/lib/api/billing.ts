/**
 * Cardcom trial checkout (S2 payment gate).
 */
import { getFunctionsInstance } from '@/lib/firebase';
import type { OnboardingSubscriptionPlan } from '@/constants/onboarding-subscription-layout';
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
