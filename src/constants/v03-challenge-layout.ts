import { ONBOARDING_NEWS_HERO_IMAGE, SIGNUP_JOURNEY_STEP3_IMAGE } from '@/constants/onboarding-figma';
import {
  SIGNUP_JOURNEY_STEP3_FRAME_H_PX,
  SIGNUP_JOURNEY_STEP3_FRAME_W_PX,
} from '@/constants/signup-layout';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { PARENT_DASHBOARD_ASSETS } from '@/constants/parent-dashboard-layout';

/** Challenge setup / accept — card overlay heroes (dashboard blur cards). */
export const V03_CHALLENGE_SETUP_ASSETS = {
  /** Parent intro — contract / agreements (signup journey step 3). */
  parentHero: SIGNUP_JOURNEY_STEP3_IMAGE,
  /** Parent sent step — reveal news (small). */
  parentSentHero: ONBOARDING_NEWS_HERO_IMAGE,
  /** Child goals — Dori with notebook (mission 2 intro). */
  childHero: CHILD_ONBOARDING_ASSETS.doriNotebookClose,
  confetti: CHILD_ONBOARDING_ASSETS.confettiPurple,
  completionCheck: PARENT_DASHBOARD_ASSETS.completionCheck,
  agreementThumb: PARENT_DASHBOARD_ASSETS.agreementThumb,
} as const;

/** Hero frame sizes from onboarding Figma — used for object-contain in card. */
export const V03_CHALLENGE_SETUP_LAYOUT = {
  parentHero: {
    width: Math.round(SIGNUP_JOURNEY_STEP3_FRAME_W_PX / 2),
    height: Math.round(SIGNUP_JOURNEY_STEP3_FRAME_H_PX / 2),
  },
  parentSentHero: {
    width: Math.round(SIGNUP_JOURNEY_STEP3_FRAME_W_PX / 2),
    height: Math.round(SIGNUP_JOURNEY_STEP3_FRAME_H_PX / 2),
  },
  childHero: {
    width: 140,
    height: 140,
  },
  confettiSize: 200,
  fadeOutMs: 700,
  celebrationMs: 2400,
  redemptionCelebrateVideo: {
    width: 200,
    height: 200,
  },
} as const;

/** Child redemption — screenshot capture guide + celebrate hero. */
export const V03_REDEMPTION_SCREENSHOT_GUIDE = {
  examples: [
    { id: 'ios', label: 'iPhone', src: '/screenshot-tutorial-ios.mp4' },
    { id: 'android', label: 'Android', src: '/screenshot-tutorial-android.mp4' },
  ],
} as const;

export const V03_REDEMPTION_CELEBRATE_VIDEO = '/onboarding/child/dori-phone.mp4' as const;
