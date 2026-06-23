import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/** Center a fixed-width layer on the 375 canvas. */
function centerX(width: number): number {
  return (V03_SCREEN_WIDTH - width) / 2;
}

/** Shared Dori hero — inset from Figma 324 so bubble + CTA fit on 812. */
export const CHILD_DORI_HERO_SIZE = 296;

/** Joystie logo — child screens 3–4 (161×78 SVG, centered on 375 canvas). */
export const CHILD_ONBOARDING_LOGO = {
  top: 120,
  width: 161,
  height: 78,
} as const;

/** Figma 13367:4097 — screen 4 content frame (327×540 @ left 24, top 253). */
export const CHILD_COMPANION_PICK_FRAME = {
  left: 24,
  top: 253,
  width: 327,
  height: 540,
  contentGap: 86,
  headlineGap: 3,
  headline: {
    line1FontSize: 24,
    line1LineHeight: 30,
    line2FontSize: 30,
    line2LineHeight: 33,
    line2Height: 34,
    textShadow: '0 0 20px rgba(255, 255, 255, 0.50)',
  },
  speechBubble: {
    width: 265,
    left: 55,
    top: 97,
    paddingTop: 16.7,
    paddingBottom: 12.99,
    paddingLeft: 20.89,
    paddingRight: 20.89,
    gap: 20.89,
    borderRadius: 16,
    outline: '2px solid #FFF',
    background: 'rgba(255, 255, 255, 0.10)',
    backdropBlur: 11.41,
    boxShadow:
      '0 5.493237495422363px 5.493237495422363px rgba(0, 0, 0, 0.25)',
    tailLeft: 34.22,
    tailTop: 62,
    fontSize: 24,
    lineHeight: 30,
  },
  companion: {
    size: 269,
    imageSize: 238.9,
    imageOffset: 15.05,
    outerRadius: 300,
    outerBackground: 'rgba(255, 255, 255, 0.60)',
    outerInsetShadow:
      '6.760794639587402px 6.760794639587402px 16.901987075805664px rgba(39, 11, 83, 0.20) inset',
    outerBackdropBlur: 16.9,
    ringSize: 313.52,
    ringLeft: -22.56,
    ringTop: -22.26,
    ringRadius: 217.06,
    ringBorder: '5.57px solid #00FFB3',
    badgeSize: 52.87,
    badgeLeft: 188.93,
    badgeTop: 0,
  },
  cta: {
    width: 327,
    height: 55,
    paddingX: 15,
    paddingY: 8,
    borderRadius: 22,
    fontSize: 18,
    color: '#031D15',
  },
} as const;

/** @deprecated Use CHILD_COMPANION_PICK_FRAME */
export const CHILD_DORI_OVERLAY = CHILD_COMPANION_PICK_FRAME;

/** Screen 5 — egg intro copy (Figma 13147:5625). */
export const CHILD_EGG_INTRO_FRAME = {
  top: 170,
  width: 323,
  left: 26,
  contentGap: 11,
  titleGap: 2,
  /** «תלחץ על הביצה!» — Figma center y ≈ 747 on 812 canvas. */
  hintTop: 747,
  arrow: { left: 180, top: 661, width: 13, height: 36 },
  /** Ellipse 482 — covers upper canvas (status-bar zone omitted in app). */
  glow: { left: -116, top: 0, width: 602, height: 124 },
} as const;

/** Screen 5 — egg video (Figma 12945:12023). */
export const CHILD_EGG_VIDEO_FRAME = {
  top: 338,
  left: 26,
  width: 323,
  height: 305,
} as const;

/** Screen 6 — Dori hero + continue (Figma 13147:5622). */
export const CHILD_DORI_REVEALED = {
  hero: {
    left: centerX(CHILD_DORI_HERO_SIZE),
    top: 284,
    size: CHILD_DORI_HERO_SIZE,
  },
  bubble: { top: 132, width: 265, left: centerX(265) },
  continue: { top: 668, width: 217 },
} as const;

/** Screen 8 — mission intro (Figma 13147:5624). */
export const CHILD_DORI_MISSION_INTRO = {
  hero: {
    left: centerX(CHILD_DORI_HERO_SIZE),
    top: 308,
    size: CHILD_DORI_HERO_SIZE,
  },
  bubble: { top: 84, width: 327, left: centerX(327) },
  continue: { top: 668, width: 217 },
} as const;

/** Screen 9 — mission 1 (Figma 13147:5631). */
export const CHILD_MISSION_ONE = {
  hero: { left: centerX(200), top: 48, width: 200, height: 200 },
  fireball: { width: 130, height: 155 },
  content: { top: 268, width: 333, left: centerX(333), gap: 40 },
} as const;

/** Screens 10–11 — ball game (Figma 13147:5635 / 5632). */
export const CHILD_BALL_GAME = {
  bg: { left: centerX(375), top: 0, width: 375, height: 812 },
  parentLabel: { top: 32, left: centerX(92), width: 92 },
  childLabel: { top: 748 },
  centerLine: { top: 396, width: 365 },
  childPaddle: { top: 728, left: centerX(92), width: 92, height: 11 },
  status: { top: 308, width: 332 },
} as const;
