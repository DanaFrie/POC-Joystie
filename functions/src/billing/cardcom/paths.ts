/** Cardcom redirect targets — must match Next.js routes under `src/app/dashboard/subscription/pay/`. */
export const CARDCOM_PAY_SUCCESS_PATH = '/dashboard/subscription/pay/success';
export const CARDCOM_PAY_FAILED_PATH = '/dashboard/subscription/pay/failed';

/** Consultant ChargeOnly. Private ₪260, group workshop ₪100.
 * Success appends `/{orderId}`. Failed appends `/{private|group}`. */
export const CARDCOM_CONSULTANT_PAY_SUCCESS_PATH = '/consultant/pay/success';
export const CARDCOM_CONSULTANT_PAY_FAILED_PATH = '/consultant/pay/failed';
