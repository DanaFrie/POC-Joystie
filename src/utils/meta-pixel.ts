/**
 * Meta Pixel — client-only conversion events (PROD only).
 * Pixel ID: `@/constants/meta-pixel` (root layout `fbq('init')`).
 */
import { isMetaPixelEnabled } from '@/constants/meta-pixel';
import { isLocalDevHost } from '@/utils/is-local-dev-host';

type MetaParamValue = string | number | boolean;
type MetaParams = Record<string, MetaParamValue>;

function getFbq(): ((...args: unknown[]) => void) | null {
  if (typeof window === 'undefined' || !isMetaPixelEnabled() || isLocalDevHost()) {
    return null;
  }
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  return typeof fbq === 'function' ? fbq : null;
}

function trackMetaCustom(eventName: string, params?: MetaParams): void {
  const fbq = getFbq();
  if (!fbq) return;
  fbq('trackCustom', eventName, params ?? {});
}

/** 1 — signup succeeded (password or OAuth). */
export function trackMetaSignupSuccess(
  params: MetaParams = { content_name: 'onboarding_signup' }
): void {
  trackMetaCustom('JoystieSignupSuccess', params);
}

/** 2 — CardCom trial payment confirmed; 30-day trial started. */
export function trackMetaTrialStarted(
  params: MetaParams = { content_name: 'cardcom_trial_30d' }
): void {
  trackMetaCustom('JoystieTrialStarted', params);
}

/** 3 — parent finished onboarding (`onboarding: true`). */
export function trackMetaOnboardingComplete(
  params: MetaParams = { content_name: 'parent_onboarding_complete' }
): void {
  trackMetaCustom('JoystieOnboardingComplete', params);
}
