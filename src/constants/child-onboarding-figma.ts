import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';
import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';

const FILE =
  'https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform';

export const childOnboardingFigmaLinks = {
  welcome: `${FILE}?node-id=13147-5620&m=dev`,
  companionPick: `${FILE}?node-id=13367-4097&m=dev`,
} as const;

/** Placeholder child name until parent token is wired. */
export const CHILD_ONBOARDING_PLACEHOLDER_NAME = 'יואב' as const;

export const CHILD_ONBOARDING_HERO_VIDEO = '/phone_hover_power.mp4' as const;

/** Auto-advance timings (ms) — screens 2→3 and 3→4, 10% faster than 2500. */
export const CHILD_ONBOARDING_MINT_GLOW_AUTO_MS = 2250;
export const CHILD_ONBOARDING_KINGDOM_AUTO_MS = 2250;

/** Companion enter animations on screen 4 — 10% faster than default funnel tokens. */
export const CHILD_ONBOARDING_ENTER_VARS = {
  '--v03-funnel-enter-duration': '378ms',
  '--v03-funnel-enter-stagger': '81ms',
  '--v03-funnel-enter-fast-stagger': '47ms',
} as const;

/** Screen 1 headline — Figma 13147:5620 @ top 108, 327px centered. */
export const CHILD_WELCOME_HEADLINE = {
  top: 108,
  width: 327,
  fontSize: 40,
  lineHeight: 1.1,
  letterSpacing: -0.8,
  textShadow: '0 0 20px rgba(49, 49, 49, 0.5)',
} as const;

/** Welcome glow ellipses — Figma 13147:5620 (389 behind copy, 391 left bleed). */
export const CHILD_WELCOME_ELLIPSE_389 = {
  top: 120,
  left: 25.68,
  width: 366,
  height: 116,
  fill: '#092523',
  blurPx: 60,
} as const;

export const CHILD_WELCOME_ELLIPSE_391 = {
  top: 145.42,
  left: -80.68,
  width: 257.516,
  height: 159.714,
  fill: '#092523',
  blurPx: 72,
} as const;

/** Frame 1597882462 — «עוד כמה רגעים מתחילים…» (482×~50; corners bleed off 375 canvas). */
export const CHILD_WELCOME_STATUS_BUBBLE = {
  top: 674,
  width: 482,
  /** Centered on 375 — (375 − 482) / 2; Figma left 256 is vs ~1015 video parent. */
  left: (V03_SCREEN_WIDTH - 482) / 2,
  paddingTop: 16.7,
  paddingBottom: 12.99,
  paddingLeft: 20.89,
  paddingRight: 20.89,
  gap: 20.89,
  borderRadius: 16,
  outline: '2px solid #FFF',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropBlur: 11.41,
  boxShadow:
    '0 5.493237495422363px 5.493237495422363px rgba(0, 0, 0, 0.25)',
  fontSize: 20,
  lineHeight: 20,
} as const;

export const CHILD_ONBOARDING_COMPANION_HERO_IMAGE = SIGNUP_COMPANION_IMAGES[0];
