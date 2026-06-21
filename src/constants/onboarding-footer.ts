import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

/** Stacked footer shell — matches `OnboardingFooterCta` layout="stacked" (phone count step). */
export const ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX = 690;
export const ONBOARDING_STACKED_FOOTER_PAD_TOP_PX = 20;
export const ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX =
  ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX + ONBOARDING_STACKED_FOOTER_PAD_TOP_PX;
export const ONBOARDING_STACKED_FOOTER_BUTTON_H_PX = 55;
export const ONBOARDING_STACKED_FOOTER_CONTENT_W_PX = 327;
export const ONBOARDING_STACKED_FOOTER_GUTTER_PX = 24;

/** Canvas space reserved above footer button (scroll clip). */
export const ONBOARDING_STACKED_FOOTER_RESERVE_PX =
  V03_SCREEN_HEIGHT - ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX;
