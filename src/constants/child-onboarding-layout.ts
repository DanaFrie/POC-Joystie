import { BALL_GAME_SCORE_RING_COURT } from '@/constants/ball-game-score-ring-layout';
import { CHILD_CONTINUE_GLOW } from '@/constants/child-continue-glow';
import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/** Center a fixed-width layer on the 375 canvas. */
function centerX(width: number): number {
  return (V03_SCREEN_WIDTH - width) / 2;
}

/** Shared Dori video frame — Figma 13147:5622 / 5624; runtime X via `calc(50% - size/2)`. */
export const CHILD_DORI_MEDIA_FRAME = {
  /** @deprecated Figma @ 375 only — use `calc(50% - width/2)` in components. */
  left: centerX(324),
  top: 271,
  width: 324,
  height: 324,
  edgeTop: 29,
  edgeBottom: 41,
  edgeSide: 27,
} as const;

/** Shared continue footer top @ 812 — fixed; media derives from this on screens 6, 8+. */
export const CHILD_DORI_CONTINUE_TOP_PX = 678;

/** Bottom continue column — Figma @ top 678; X via `calc(50% - width/2)` in component. */
export const CHILD_DORI_CONTINUE_FOOTER = {
  top: CHILD_DORI_CONTINUE_TOP_PX,
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

/** Shared speech-bubble tail — Figma polygon @ left 32, width 34, flush on bottom border. */
export const CHILD_DORI_SPEECH_TAIL = {
  left: 32,
  width: 34,
  borderOverlap: 0,
} as const;

/** Figma 13367:4097 — screen 4 content frame (327×540 @ left 24, top 253). */
export const CHILD_COMPANION_PICK_FRAME = {
  left: 24,
  top: 253,
  width: 327,
  height: 540,
  contentGap: 65,
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
    /** Figma — 7px from right edge of 327px content column. */
    right: 7,
    top: 87,
    paddingTop: 16.697,
    paddingBottom: 12.986,
    paddingLeft: 20.888,
    paddingRight: 20.888,
    gap: 20.888,
    borderRadius: 16,
    border: '2px solid #FFF',
    background: 'rgba(255, 255, 255, 0.10)',
    backdropBlur: 11.409310340881348,
    boxShadow: '0 5.493px 5.493px 0 rgba(0, 0, 0, 0.25)',
    fontSize: 24,
    /** 24px/Regular — line-height 135% */
    lineHeightRegular: 1.35,
    /** 24px/Bold — line-height 110% */
    lineHeightBold: 1.1,
    letterSpacing: -0.72,
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
    lineHeight: 1.2,
    letterSpacing: -0.36,
    color: '#031D15',
    label: 'לחץ כאן כדי להמשיך',
  },
} as const;

/** @deprecated Use CHILD_COMPANION_PICK_FRAME */
export const CHILD_DORI_OVERLAY = CHILD_COMPANION_PICK_FRAME;

/** Screen 5 — egg intro copy (Figma 13147:5625). @ 812 canvas. */
export const CHILD_EGG_VIDEO_TOP_PX = 295;

/** Intro block height budget — eyebrow + gaps + title lines (~134px rendered). */
export const CHILD_EGG_INTRO_BLOCK_H_PX = 134;

/** Gap between intro block bottom and egg video top. */
export const CHILD_EGG_INTRO_TO_EGG_GAP_PX = 34;

/** Gap between egg video bottom and arrow tip (top of arrow SVG). */
export const CHILD_EGG_EGG_TO_ARROW_GAP_PX = 18.08;

/** Gap between arrow bottom and tap-hint center Y. */
export const CHILD_EGG_ARROW_TO_HINT_GAP_PX = 50;

/** Rendered egg video height from frame width + Figma aspect (125×118). */
export function getChildEggVideoRenderedHeightPx(
  width: number = CHILD_EGG_VIDEO_FRAME.width
): number {
  return width * (118 / 125);
}

export function getChildEggVideoBottomPx(): number {
  return CHILD_EGG_VIDEO_TOP_PX + CHILD_EGG_VIDEO_FRAME.height;
}

export const CHILD_EGG_INTRO_FRAME = {
  top: CHILD_EGG_VIDEO_TOP_PX - CHILD_EGG_INTRO_TO_EGG_GAP_PX - CHILD_EGG_INTRO_BLOCK_H_PX,
  width: 323,
  left: 26,
  contentGap: 11,
  titleGap: 2,
  hintWidth: 161,
  arrow: { left: 180, width: 13, height: 36 },
  /** Ellipse 482 — covers upper canvas (status-bar zone omitted in app). */
  glow: { left: -116, top: 0, width: 602, height: 124 },
} as const;

/** Screen 5 — egg video (Figma 12945:12023). */
export const CHILD_EGG_VIDEO_FRAME = {
  top: CHILD_EGG_VIDEO_TOP_PX,
  left: 26,
  width: 323,
  height: 304.919,
  aspectRatio: '125 / 118',
} as const;

/** Derived @ 812 — hint center Y and arrow top from egg frame (no overlap). */
export function getChildEggHatchBelowEggLayout() {
  const eggBottom = getChildEggVideoBottomPx();
  const arrowTop = eggBottom + CHILD_EGG_EGG_TO_ARROW_GAP_PX;
  const hintTop =
    arrowTop +
    CHILD_EGG_INTRO_FRAME.arrow.height +
    CHILD_EGG_ARROW_TO_HINT_GAP_PX;
  return { arrowTop, hintTop, eggBottom };
}

/** Shared Dori shell — bubble top @ 812 (screens 6 & 8). */
export const CHILD_DORI_SHELL_BUBBLE_TOP_PX = 84;

/** Screen 6 — Dori revealed (Figma 13656:6594). */
export const CHILD_DORI_REVEALED_BUBBLE_TOP_PX = CHILD_DORI_SHELL_BUBBLE_TOP_PX;

/**
 * Gap media bottom → continue footer top @ 812.
 * Anchors media from the fixed footer so spacing stays proportional on every screen.
 */
export const CHILD_DORI_MEDIA_TO_CONTINUE_GAP_PX =
  CHILD_DORI_CONTINUE_TOP_PX -
  CHILD_DORI_MEDIA_FRAME.top -
  CHILD_DORI_MEDIA_FRAME.height;

/** Media top @ 812 — derived from fixed continue footer (screens 6, 8+). */
export function getChildDoriMediaTopPx(): number {
  return (
    CHILD_DORI_CONTINUE_TOP_PX -
    CHILD_DORI_MEDIA_TO_CONTINUE_GAP_PX -
    CHILD_DORI_MEDIA_FRAME.height
  );
}

/** Post–egg hatch — Dori hero + thank-you / 3-missions bubble (merged former screens 6+8). */
export const CHILD_DORI_REVEALED = {
  media: CHILD_DORI_MEDIA_FRAME,
  mediaTop: getChildDoriMediaTopPx(),
  bubble: {
    top: CHILD_DORI_REVEALED_BUBBLE_TOP_PX,
    width: 327,
    left: centerX(327),
    tailLeft: CHILD_DORI_SPEECH_TAIL.left,
    tailBorderOverlap: CHILD_DORI_SPEECH_TAIL.borderOverlap,
    paddingTop: 16,
    paddingBottom: 14,
    contentGap: 8,
  },
  continue: CHILD_DORI_CONTINUE_FOOTER,
} as const;

/** Screen 8 — mission intro (Figma 13656:6740). */
export const CHILD_DORI_MISSION_INTRO = {
  media: CHILD_DORI_MEDIA_FRAME,
  mediaTop: getChildDoriMediaTopPx(),
  bubble: {
    top: CHILD_DORI_SHELL_BUBBLE_TOP_PX,
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
  parentPaddle: { top: 85, left: centerX(92), width: 92, height: 11 },
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

/** Ball game — Ellipse 385 mint glow, bottom-left bleed (Figma @ 812). */
export const BALL_GAME_MINT_ELLIPSE = {
  left: -98,
  /** Visible disc top @ full 812 canvas. */
  top: 757,
  size: 272,
  /** Extends below canvas bottom @ 812. */
  bleedBelow: 217,
  blur: 150,
} as const;

/** Parent ball game — flipped vs child (Figma 13245:21258). */
export const PARENT_BALL_GAME = {
  ...CHILD_BALL_GAME,
  parentLabel: { top: 748, left: centerX(92), width: 92 },
  childLabel: { top: 32 },
  childPaddle: { top: 85, left: centerX(92), width: 92, height: 11 },
  parentPaddle: { top: 728, left: centerX(92), width: 92, height: 11 },
} as const;
