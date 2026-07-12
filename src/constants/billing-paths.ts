/** Cardcom pay return routes — keep in sync with `functions/src/billing/cardcom/paths.ts`. */
export const CARDCOM_PAY_SUCCESS_PATH = '/dashboard/subscription/pay/success';
export const CARDCOM_PAY_FAILED_PATH = '/dashboard/subscription/pay/failed';
export const SUBSCRIPTION_TEST_PATH = '/dashboard/subscription/test';

/** Freemium parent dashboard with subscription gate open. */
export const DASHBOARD_SUBSCRIPTION_PATH = '/dashboard?subscription=1';

/** Paid parent dashboard — open challenge setup after successful checkout. */
export const DASHBOARD_CHALLENGE_SETUP_PATH = '/dashboard?openChallenge=1';
