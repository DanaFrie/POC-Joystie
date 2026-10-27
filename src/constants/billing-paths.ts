/** Cardcom pay return routes — keep in sync with `functions/src/billing/cardcom/paths.ts`. */
export const CARDCOM_PAY_SUCCESS_PATH = '/dashboard/subscription/pay/success';
export const CARDCOM_PAY_FAILED_PATH = '/dashboard/subscription/pay/failed';
export const CARDCOM_CONSULTANT_PAY_SUCCESS_PATH = '/consultant/pay/success';
export const CARDCOM_CONSULTANT_PAY_FAILED_PATH = '/consultant/pay/failed';
/** Stable pay links: `?offer=private` and `?offer=group` (group is sent manually).
 * CardCom returns to `/success/{orderId}` and `/failed/{offer}`. */
export const CARDCOM_CONSULTANT_PAY_START_PATH = '/consultant/pay/start';

/** Freemium parent dashboard with subscription gate open. */
export const DASHBOARD_SUBSCRIPTION_PATH = '/dashboard?subscription=1';

/** Paid parent dashboard — open challenge setup after successful checkout. */
export const DASHBOARD_CHALLENGE_SETUP_PATH = '/dashboard?openChallenge=1';
