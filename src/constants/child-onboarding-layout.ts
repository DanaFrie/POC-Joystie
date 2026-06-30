import { BALL_GAME_SCORE_RING_COURT } from '@/constants/ball-game-score-ring-layout';
import { CHILD_CONTINUE_GLOW } from '@/constants/child-continue-glow';
import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/** Center a fixed-width layer on the 375 canvas. */
function centerX(width: number): number {
  return (V03_SCREEN_WIDTH - width) / 2;
}

/** Shared Dori video frame — Figma 13147:5622 / 5624. */
export const CHILD_DORI_MEDIA_FRAME = {
  left: 27,
  top: 271,
  width: 324,
  height: 324,
  edgeTop: 29,
  edgeBottom: 41,
  edgeSide: 27,
} as const;

/** Bottom continue column — Figma @ left 79 top 678. */
export const CHILD_DORI_CONTINUE_FOOTER = {
  left: 79,
  top: 678,
  width: 217,
  gap: CHILD_CONTINUE_GLOW.labelGap,
} as const;

/** @deprecated Use CHILD_DORI_MEDIA_FRAME */
export const CHILD_DORI_HERO_SIZE = 324;

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
  height: 304.919,
  aspectRatio: '125 / 118',
} as const;

/** Shared speech-bubble tail — Figma polygon @ left 32, 2px on border. */
export const CHILD_DORI_SPEECH_TAIL = {
  left: 32,
  borderOverlap: 0,
} as const;

/** Screen 6 — Dori hero + continue (Figma 13656:6594). */
export const CHILD_DORI_REVEALED = {
  media: CHILD_DORI_MEDIA_FRAME,
  bubble: {
    top: 132,
    width: 265,
    left: centerX(265),
    tailLeft: CHILD_DORI_SPEECH_TAIL.left,
    tailBorderOverlap: CHILD_DORI_SPEECH_TAIL.borderOverlap,
    paddingTop: 16,
    paddingBottom: 14,
  },
  continue: CHILD_DORI_CONTINUE_FOOTER,
} as const;

/** Screen 8 — mission intro (Figma 13656:6740). */
export const CHILD_DORI_MISSION_INTRO = {
  media: CHILD_DORI_MEDIA_FRAME,
  bubble: {
    top: 84,
    width: 327,
    left: centerX(327),
    tailLeft: CHILD_DORI_SPEECH_TAIL.left,
    tailBorderOverlap: CHILD_DORI_SPEECH_TAIL.borderOverlap,
    paddingTop: 16,
    paddingBottom: 14,
  },
  continue: CHILD_DORI_CONTINUE_FOOTER,
} as const;

/** Shared fireball hero — Figma 59:71 (155.676×187.325). */
export const CHILD_FIREBALL_HERO = {
  width: 155.676,
  height: 187.325,
} as const;

/** Screen 9 fireball frame — Figma 13147:5631 @ left 43 top 52, −60°. */
export const CHILD_MISSION_ONE_FIREBALL_FRAME = {
  left: 43,
  top: 51.9999,
  rotationDeg: -60,
  paddingBottom: 10.5,
  paddingLeft: 18.186,
  image: {
    width: CHILD_FIREBALL_HERO.width,
    height: CHILD_FIREBALL_HERO.height,
    aspectRatio: 59 / 71,
    backgroundPositionX: -20.529,
    backgroundPositionY: -57.444,
    backgroundSizeWidthPct: 120.33,
    backgroundSizeHeightPct: 175.029,
  },
} as const;

/** Screen 9 — mission 1 (Figma 13147:5631). */
export const CHILD_MISSION_ONE = {
  fireballFrame: CHILD_MISSION_ONE_FIREBALL_FRAME,
  content: { top: 268, width: 333, left: centerX(333), gap: 40 },
} as const;

/** Screens 10–11 — ball game (Figma 13147:5635 / 5632). */
export const CHILD_BALL_GAME = {
  bg: { left: centerX(375), top: 0, width: 375, height: 812 },
  parentLabel: { top: 32, left: centerX(92), width: 92 },
  childLabel: { top: 748 },
  centerLine: { top: 396, width: 365 },
  childPaddle: { top: 728, left: centerX(92), width: 92, height: 11 },
  parentPaddle: { top: 73, left: centerX(92), width: 92, height: 11 },
  status: { top: 308, width: 332 },
  /** Touch court — maps physics 0..1 across full width, rival paddle bottom → self paddle top. */
  court: { top: 84, left: 24, width: 327, height: 644 },
  fireball: { width: 104, height: 124 },
  /** Score ring — Figma 13656:7722 / Frame 1430108694. */
  scoreRing: {
    top: BALL_GAME_SCORE_RING_COURT.top,
    left: BALL_GAME_SCORE_RING_COURT.left,
    size: BALL_GAME_SCORE_RING_COURT.size,
  },
  score: { top: 356, width: 200 },
} as const;

/** Parent ball game — flipped vs child (Figma 13245:21258). */
export const PARENT_BALL_GAME = {
  ...CHILD_BALL_GAME,
  parentLabel: { top: 748, left: centerX(92), width: 92 },
  childLabel: { top: 32 },
  childPaddle: { top: 73, left: centerX(92), width: 92, height: 11 },
  parentPaddle: { top: 728, left: centerX(92), width: 92, height: 11 },
} as const;
