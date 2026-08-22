import { ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE } from '@/constants/onboarding-figma';

let started = false;

/** Kick off hero fetch early — CSS backgrounds are low-priority and the asset used to be ~2.6MB. */
export function preloadSubscriptionHero(): void {
  if (typeof window === 'undefined' || started) return;
  started = true;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE;
  link.type = 'image/webp';
  document.head.appendChild(link);

  const img = new Image();
  img.decoding = 'async';
  img.src = ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE;
}
