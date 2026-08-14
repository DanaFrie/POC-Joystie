import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';

function centerX(width: number): number {
  return (V03_SCREEN_WIDTH - width) / 2;
}

export const CHILD_POST_GAME_WIN_FADE_MS = 1_000;
export const CHILD_HAPPY_TRANSITION_MS = 1_800;

/** Mission 1 win — light celebration (parent completion pattern). */
export const CHILD_MISSION_ONE_WIN = {
  content: { top: 117, width: 327, gap: 17 },
  header: { gap: 24 },
  check: { size: 49 },
  headline: {
    fontSize: 30,
    lineHeight: 1.1,
    letterSpacing: -0.6,
    color: '#3E3E3E',
  },
  body: {
    fontSize: 24,
    lineHeight: 1.25,
    letterSpacing: -0.36,
    color: '#092125',
  },
  hero: { width: 321, height: 321 },
  /** dori-happy — centered on confetti video center. */
  happyHero: { width: 267, height: 267, aspectRatio: '1 / 1' as const },
  happyFadeMs: 1_200,
  /** Circle top when headline + body are shown (mission-1 win video). */
  heroTop: 251,
} as const;

/** Happy transition — headline only; hero stays at mission-1 win video position. */
export const CHILD_HAPPY_TRANSITION = {
  headlineTop: 117,
  headlineWidth: 327,
  heroTop: CHILD_MISSION_ONE_WIN.heroTop,
  hero: CHILD_MISSION_ONE_WIN.hero,
} as const;

/** Mission 2 intro — Figma frame @ left 21 top 31. */
export const CHILD_MISSION_TWO_INTRO = {
  frame: { left: 21, top: 31, gap: 39 },
  image: { width: 319, height: 319 },
  badge: { paddingX: 19, paddingY: 10 },
  textBlockGap: 19,
  titleBlockGap: 40,
  titleGap: 35,
  headlineGap: 4,
} as const;

/** Dark Dori shell — notebook surprise (post mission 2 intro). */
export const CHILD_MISSION_TWO_NOTEBOOK = {
  media: {
    left: 27,
    top: 271,
    width: 324,
    height: 324,
    edgeTop: 29,
    edgeBottom: 41,
    edgeSide: 27,
  },
  bubble: {
    top: 84,
    width: 327,
    left: centerX(327),
    tailLeft: 32,
    tailBorderOverlap: 0,
    paddingTop: 16,
    paddingBottom: 14,
  },
  continue: { left: 79, top: 678, width: 217, gap: 17 },
} as const;

/** Dark Dori shell — first change intro. */
export const CHILD_MISSION_TWO_CHANGE = {
  bubble: {
    top: 84,
    width: 327,
    left: centerX(327),
    tailLeft: 32,
    tailBorderOverlap: 0,
    paddingTop: 16,
    paddingBottom: 14,
  },
  media: { left: 20, top: 304, width: 335, height: 335 },
  continue: { left: 79, top: 678, width: 217, gap: 17 },
} as const;

/** Castle interior layout shift — aligns UI with repositioned castle art. */
const CHILD_RUN_TO_CASTLE_SHIFT_X = 45;
const CHILD_RUN_TO_CASTLE_SHIFT_Y = 43;
/** Extra nudge for tilt cards only (left 30px from prior placement). */
const CHILD_CASTLE_CARD_EXTRA_SHIFT_X = -30;

/** Run to castle — Dori video + compact tooltip + glow tap. */
export const CHILD_RUN_TO_CASTLE = {
  video: {
    top: 0,
    left: 0,
    width: 510.251,
    height: 900,
    aspectRatio: '55 / 97',
  },
  bubble: {
    top: 356,
    left: 45,
    width: 235,
    tailLeft: 181,
    tailBorderOverlap: -1.5,
    paddingTop: 16.697,
    paddingBottom: 12.986,
    paddingLeft: 12,
    paddingRight: 12,
    gap: 20.888,
    borderRadius: 16,
    border: '2px solid #FFF',
    background: 'rgba(0, 0, 0, 0.20)',
    backdropBlur: 11.409310340881348,
    boxShadow: '0 5.493px 5.493px rgba(0, 0, 0, 0.25)',
  },
  glowButton: { left: 255, top: 256 },
  uiFadeMs: 500,
  castleDissolveMs: 2_400,
  headerFadeMs: 500,
  cardRevealMs: 800,
  cardRevealStaggerMs: 280,
  castle: {
    top: 0,
    left: 0,
    width: 375,
    height: 812,
    aspectRatio: '375 / 812',
  },
  header: {
    top: 0,
    width: 375,
    height: 100,
    padding: 10,
    gap: 10,
    background: '#092125',
    textWidth: 275,
    fontSize: 20,
    lineHeight: 1.25,
    letterSpacing: -0.3,
  },
  cards: {
    /** Absolute placement layer — cards use `placeTop` / `placeLeft` on the funnel canvas. */
    zIndex: 16,
  },
} as const;

/** Shared slider card chrome — Figma Frame 1597882555. */
export const CHILD_CASTLE_SLIDER_CARD_STYLE = {
  width: 229,
  height: 94,
  rotateDeg: -1.632,
  paddingTop: 16,
  paddingBottom: 16,
  paddingLeft: 12,
  paddingRight: 12,
  borderRadius: 16,
  border: '1px solid #FFF',
  background: 'rgba(0, 0, 0, 0.05)',
  boxShadow: '0 5.493px 5.493px 0 rgba(0, 0, 0, 0.25)',
  backdropBlur: 11.409310340881348,
  contentGap: 0,
  textPaddingX: 0,
  textGap: 0,
  glow: {
    width: 77.671,
    height: 77.671,
    left: 75.637,
    bottom: -57.84,
    color: '#00D978',
    blur: 42.83347702026367,
  },
} as const;

/** Castle interior tilt cards — Figma Components 508–512 on funnel canvas. */
export const CHILD_CASTLE_INTERIOR_CARDS = [
  {
    id: 'friends-less-screen',
    title: 'להיות יותר זמן עם חברים, ופחות זמן במסך',
    placeTop: 142,
    placeLeft: 119 + CHILD_RUN_TO_CASTLE_SHIFT_X + CHILD_CASTLE_CARD_EXTRA_SHIFT_X,
    placeRotateDeg: 0,
    width: CHILD_CASTLE_SLIDER_CARD_STYLE.width,
    height: CHILD_CASTLE_SLIDER_CARD_STYLE.height,
    rotateDeg: CHILD_CASTLE_SLIDER_CARD_STYLE.rotateDeg,
    titleStyle: { fontSize: 16, lineHeight: 20, minHeight: 0 },
  },
  {
    id: 'save-money',
    title: 'לחסוך יותר כסף כדי לקנות משהו שאני רוצה',
    placeTop: 239.1729,
    placeLeft: 18.2168 + CHILD_RUN_TO_CASTLE_SHIFT_X + CHILD_CASTLE_CARD_EXTRA_SHIFT_X,
    placeRotateDeg: -1.06,
    width: CHILD_CASTLE_SLIDER_CARD_STYLE.width,
    height: CHILD_CASTLE_SLIDER_CARD_STYLE.height,
    rotateDeg: CHILD_CASTLE_SLIDER_CARD_STYLE.rotateDeg,
    titleStyle: { fontSize: 16, lineHeight: 20, minHeight: 0 },
  },
  {
    id: 'quality-time',
    title: 'לבלות יותר זמן איכות עם אמא ואבא ופחות במסך',
    placeTop: 339.9998,
    placeLeft: 107 + CHILD_RUN_TO_CASTLE_SHIFT_X + CHILD_CASTLE_CARD_EXTRA_SHIFT_X,
    placeRotateDeg: 2.29,
    width: CHILD_CASTLE_SLIDER_CARD_STYLE.width,
    height: CHILD_CASTLE_SLIDER_CARD_STYLE.height,
    rotateDeg: CHILD_CASTLE_SLIDER_CARD_STYLE.rotateDeg,
    titleStyle: { fontSize: 16, lineHeight: 20, minHeight: 0 },
  },
  {
    id: 'no-phone-bedroom',
    title: 'לנסות לא להכניס את הפלאפון לחדר השינה',
    placeTop: 475,
    placeLeft: 17 + CHILD_RUN_TO_CASTLE_SHIFT_X + CHILD_CASTLE_CARD_EXTRA_SHIFT_X,
    placeRotateDeg: -7.36,
    width: CHILD_CASTLE_SLIDER_CARD_STYLE.width,
    height: CHILD_CASTLE_SLIDER_CARD_STYLE.height,
    rotateDeg: CHILD_CASTLE_SLIDER_CARD_STYLE.rotateDeg,
    titleStyle: { fontSize: 16, lineHeight: 20, minHeight: 0 },
  },
] as const;

/** @deprecated Use CHILD_CASTLE_INTERIOR_CARDS */
export const CHILD_CASTLE_SLIDER_CARDS = CHILD_CASTLE_INTERIOR_CARDS;

/** @deprecated Use CHILD_CASTLE_INTERIOR_CARDS[1] */
export const CHILD_CASTLE_FIRST_CARD = {
  id: CHILD_CASTLE_INTERIOR_CARDS[1].id,
  title: CHILD_CASTLE_INTERIOR_CARDS[1].title,
  left: 0,
  top: 0,
  width: CHILD_CASTLE_INTERIOR_CARDS[1].width,
  height: CHILD_CASTLE_INTERIOR_CARDS[1].height,
  rotateDeg: CHILD_CASTLE_INTERIOR_CARDS[1].rotateDeg,
  paddingTop: CHILD_CASTLE_SLIDER_CARD_STYLE.paddingTop,
  paddingBottom: CHILD_CASTLE_SLIDER_CARD_STYLE.paddingBottom,
  paddingX: CHILD_CASTLE_SLIDER_CARD_STYLE.paddingLeft,
  borderRadius: CHILD_CASTLE_SLIDER_CARD_STYLE.borderRadius,
  outlineWidth: 1,
  boxShadow: CHILD_CASTLE_SLIDER_CARD_STYLE.boxShadow,
  backdropBlur: CHILD_CASTLE_SLIDER_CARD_STYLE.backdropBlur,
  contentGap: CHILD_CASTLE_SLIDER_CARD_STYLE.contentGap,
  textPaddingX: CHILD_CASTLE_SLIDER_CARD_STYLE.textPaddingX,
  textGap: CHILD_CASTLE_SLIDER_CARD_STYLE.textGap,
  titleStyle: CHILD_CASTLE_INTERIOR_CARDS[1].titleStyle,
  glow: {
    width: CHILD_CASTLE_SLIDER_CARD_STYLE.glow.width,
    height: CHILD_CASTLE_SLIDER_CARD_STYLE.glow.height,
    left: CHILD_CASTLE_SLIDER_CARD_STYLE.glow.left,
    top: 71.37,
    color: CHILD_CASTLE_SLIDER_CARD_STYLE.glow.color,
    blur: CHILD_CASTLE_SLIDER_CARD_STYLE.glow.blur,
  },
} as const;

export type ChildCastleInteriorCard = (typeof CHILD_CASTLE_INTERIOR_CARDS)[number];

/** @deprecated Use ChildCastleInteriorCard */
export type ChildCastleSliderCard = ChildCastleInteriorCard;

export type ChildCastleTiltCardLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  rotateDeg: number;
  wrapperRotateDeg?: number;
  paddingTop: number;
  paddingBottom: number;
  paddingX: number;
  borderRadius: number;
  outlineWidth: number;
  boxShadow: string;
  backdropBlur: number;
  contentGap: number;
  textPaddingX: number;
  textGap: number;
  titleStyle: {
    fontSize: number;
    lineHeight: number;
    minHeight: number;
  };
  glow: {
    width: number;
    height: number;
    left: number;
    top?: number;
    bottom?: number;
    color: string;
    blur: number;
  };
};

/** Map interior card entry → tilt card layout (slider variant supplies chrome). */
export function childCastleInteriorCardLayout(
  card: ChildCastleInteriorCard
): ChildCastleTiltCardLayout {
  return {
    left: 0,
    top: 0,
    width: card.width,
    height: card.height,
    rotateDeg: card.rotateDeg,
    paddingTop: 0,
    paddingBottom: 0,
    paddingX: 0,
    borderRadius: 16,
    outlineWidth: 1,
    boxShadow: '',
    backdropBlur: 0,
    contentGap: 0,
    textPaddingX: 0,
    textGap: 0,
    titleStyle: card.titleStyle,
    glow: { width: 0, height: 0, left: 0, color: '#00D978', blur: 0 },
  };
}

/** @deprecated Use childCastleInteriorCardLayout */
export const childCastleSliderCardLayout = childCastleInteriorCardLayout;

/** @deprecated Use CHILD_CASTLE_FIRST_CARD — additional cards TBD. */
export const CHILD_CASTLE_CHANGE_OPTIONS = [
  {
    id: 'evening-screen',
    title: 'לנסות לא להיות מול המסך בשעות הערב',
    description: 'מומלץ כדי לשפר את איכות השינה',
  },
  {
    id: 'tasks-first',
    title: 'להתמקד במשימות ובסיומן, לפני זמן מסך',
    description: 'מסייע בפיתוח דחיית סיפוקים ואחריות אישית',
  },
  {
    id: 'quality-content',
    title: 'לצפות בפחות סרטונים קצרים ויותר בתוכן איכותי',
    description: 'מסייע בשיפור הקשב והריכוז',
  },
  {
    id: 'hobbies',
    title: 'למצוא יותר זמן לתחביבים',
    description: 'תורם לפיתוח Soft-skills ולהרחבת האופקים',
  },
] as const;

/** Castle change confirm / celebration — shared card stack (Figma 13702:10060). */
export const CHILD_CASTLE_CHANGE_CARD_STACK = {
  width: 327,
  height: 202,
  backLayers: [
    {
      wrapperWidth: 277,
      left: 25,
      top: 0,
      gap: 1.77,
      cardWidth: 283,
      paddingX: 15.94,
      paddingY: 26.56,
      borderRadius: 15.94,
      outlineWidth: 0.89,
      boxShadow: '1.77px 1.77px 13.28px rgba(0, 0, 0, 0.08)',
      contentGap: 13.28,
      textPaddingX: 13.28,
      textGap: 3.54,
      label: { text: 'הצעה 1 מתוך 8', fontSize: 14.17, lineHeight: 19.13 },
      title: {
        text: 'להיות יותר זמן עם חברים, ופחות זמן במסך',
        fontSize: 21.25,
        lineHeight: 26.56,
      },
    },
    {
      wrapperWidth: 310,
      left: 6,
      top: 7,
      gap: 1.92,
      cardWidth: 310,
      paddingX: 17.31,
      paddingY: 28.85,
      borderRadius: 17.31,
      outlineWidth: 0.96,
      boxShadow: '1.92px 1.92px 14.43px rgba(0, 0, 0, 0.08)',
      contentGap: 14.43,
      textPaddingX: 14.43,
      textGap: 3.85,
      label: { text: 'הצעה 1 מתוך 8', fontSize: 15.39, lineHeight: 20.77 },
      title: {
        text: 'להיות יותר זמן עם חברים, ופחות זמן במסך',
        fontSize: 23.08,
        lineHeight: 28.85,
      },
    },
  ],
  front: {
    left: 0,
    top: 16,
    width: 327,
    height: 186,
    paddingX: 18,
    paddingY: 30,
    borderRadius: 18,
    outlineWidth: 1,
    boxShadow: '2px 2px 15px rgba(0, 0, 0, 0.08)',
    gap: 15,
    glow: {
      width: 112.87,
      height: 112.87,
      left: 107,
      top: 166,
      color: '#00D978',
      blur: 62.24,
    },
  },
} as const;

export const CHILD_CASTLE_CHANGE_REACTION = {
  gap: 22,
  labelGap: 6,
  tilePadding: 20,
  dimmedOpacity: 0.2,
  reactionIconSize: 100,
  label: {
    fontSize: 20,
    lineHeight: 24,
  },
} as const;

/** Shared confetti — Figma 490×490 @ top 91. */
export const CHILD_CASTLE_CHANGE_CONFETTI = {
  top: 91,
  left: -57.4258 + CHILD_RUN_TO_CASTLE_SHIFT_X,
  size: 490,
} as const;

/** Confirm / celebration content — aligned to runToCastle interior (header + cards). */
export const CHILD_CASTLE_CHANGE_OVERLAY_CONTENT = {
  left: centerX(327),
  cardStackTop: 238,
  sectionGap: 33,
  confetti: CHILD_CASTLE_CHANGE_CONFETTI,
} as const;

/** Castle change confirm overlay — Figma 13702:10060. */
export const CHILD_CASTLE_CHANGE_CONFIRM = {
  ...CHILD_CASTLE_CHANGE_OVERLAY_CONTENT,
  overlayEnterMs: 520,
} as const;

/** Castle change celebration — Figma 13702:9497 + confetti overlay. */
export const CHILD_CASTLE_CHANGE_CELEBRATION = {
  ...CHILD_CASTLE_CHANGE_OVERLAY_CONTENT,
  overlayEnterMs: 480,
  /** Hide looping GIF after one visual pass. */
  confettiMs: 2_200,
  autoAdvanceMs: 2_800,
  confetti: CHILD_CASTLE_CHANGE_CONFETTI,
  celebrationTitle: {
    fontSize: 40,
    lineHeight: 44,
  },
  celebrationBody: {
    fontSize: 20,
    lineHeight: 24,
    width: 259,
  },
} as const;

/** Footer glow clip — keeps blur inside bottom frame. */
export const CHILD_CONTINUE_FOOTER_CLIP_HEIGHT = 108;

export const CHILD_WAIT_PARENT_APPROVAL_MS = 6_000;
/** Confetti GIF on king screen — advance when playback ends (tune to asset). */
export const CHILD_KING_CONFETTI_LOOP_MS = 3_010;
export const CHILD_KING_CONFETTI_LOOPS = 3;
/** Wait for three purple-confetti GIF loops before leaving king screen. */
export const CHILD_KING_CONFETTI_MS =
  CHILD_KING_CONFETTI_LOOP_MS * CHILD_KING_CONFETTI_LOOPS;

export type ChildPostGameEllipseVariant = 'upper' | 'lowerLeft' | 'none';

export const CHILD_POST_GAME_ELLIPSE = {
  upper: {
    top: 136,
    left: 97,
    size: 174,
    fill: 'rgba(0, 255, 179, 0.70)',
    blur: 150,
  },
} as const;

/** King celebration — Figma 13466:18573 */
export const CHILD_CHANGE_KING = {
  contentTop: 72,
  contentGap: 52,
  textGap: 15,
  titleGap: 4,
  heroSize: 236.78,
  confetti: {
    top: 28.4502,
    left: -90.6094,
    width: 556.609,
    height: 742.145,
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  body: {
    fontSize: 20,
    lineHeight: 24,
    width: 269,
  },
} as const;

/** Parent suggested change — Figma 13674:16154 / 13674:16155 */
export const CHILD_PARENT_SUGGESTED_CHANGE = {
  contentTop: 72,
  contentGap: 25,
  textBlockGap: 20,
  titleGap: 4,
  heroSize: 164.11,
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  card: {
    width: 327,
    height: 186,
    paddingX: 18,
    paddingY: 30,
    borderRadius: 18,
    gap: 15,
    glow: {
      width: 112.87,
      height: 112.87,
      left: 107,
      top: 166,
      color: '#00D978',
      blur: 62.24,
    },
    label: {
      fontSize: 16,
      lineHeight: 21.6,
    },
    text: {
      fontSize: 24,
      lineHeight: 27.6,
      height: 60,
    },
  },
  actions: {
    top: 53,
    framePaddingTop: 20,
    frameGap: 15,
    buttonGap: 5,
    buttonHeight: 55,
    buttonWidth: 327,
    borderRadius: 22,
    dimmedOpacity: 0.3,
    primaryClass:
      'inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-v03-green-900 shadow-v03-button transition hover:brightness-95',
    secondaryClass:
      'inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-transparent px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-white transition hover:bg-white/5',
  },
  acceptCelebration: {
    confettiSize: 374.43,
    fadeMs: 400,
  },
} as const;

/** Demo until parent funnel writes the suggested change. */
export const CHILD_DEMO_PARENT_SUGGESTED_CHANGE =
  'להשתפר בחוג כדורגל וללכת כל שבוע פעמיים';

/** Shared photo prep — same layout as parent screen-time calculating. */
export const CHILD_SHARED_PHOTO_PREPARING_MS = 3_500;

/** Contract celebration — light screen after parent-change accept confetti. */
export const CHILD_CONTRACT_CELEBRATION = {
  contentTop: 117,
  outerGap: 17,
  heroGap: 24,
  textBlockGap: 19,
  headlineGap: 35,
  heroSize: 214,
  confettiWidth: 460,
  confettiHeight: 613,
  confettiMs: 2_800,
  title: {
    fontSize: 40,
    lineHeight: 44,
    color: '#3E3E3E',
  },
  footer: {
    paddingTop: 20,
    gap: 15,
  },
} as const;

/** Mission 3 selfie intro — content frame (independent of Screen 66 card layout). */
export const CHILD_MISSION_THREE_SELFIE = {
  content: { top: 117, width: 327, gap: 17 },
  header: { gap: 24 },
  badge: { paddingX: 19, paddingY: 10 },
  title: {
    fontSize: 40,
    lineHeight: 44,
  },
  hero: {
    width: 321.919,
    height: 346,
    imageSize: 321.919,
    glowSize: 263.619,
  },
  footer: {
    gap: 15,
    columnWidth: 332,
    columnGap: 10,
  },
} as const;

/** Selfie pattern — castle background + camera frame + circular face holes + name badges. */
export const CHILD_SELFIE_PATTERN = {
  cameraFrame: {
    width: 425.26,
    height: 274.221,
    top: 324,
    left: -25,
  },
  ellipseSize: 212.587,
  ellipseStroke: 1.207,
  ellipseBlur: 26.978,
  childEllipse: {
    left: 180,
  },
  parentEllipse: {
    right: 213,
    top: 15.2,
  },
  mask: {
    blur: 26.978,
    overlay: 'rgba(255, 255, 255, 0.20)',
    ringStroke: 1.207,
    ringOpacity: 1,
  },
  /** Computed @ 375×812 from Figma frame — child hole center. */
  childHole: { cx: 261.16, cy: 479.11, r: 106.29 },
  /** Computed @ 375×812 — parent hole center. */
  parentHole: { cx: 80.84, cy: 463.49, r: 106.29 },
  childBadge: {
    bottom: 215,
    left: 68,
    paddingX: 20.5,
    paddingY: 10.79,
    borderRadius: 17.27,
    fontSize: 19.42,
  },
  parentBadge: {
    bottom: 227,
    left: 259,
    paddingX: 23.65,
    paddingY: 12.45,
    borderRadius: 19.92,
    fontSize: 22.41,
  },
  captureButton: {
    left: 21,
    top: 729,
    width: 332,
    height: 55,
    paddingX: 15,
    paddingY: 8,
    borderRadius: 22,
    gap: 8,
  },
} as const;

/** Selfie capture — still preview on holes before loader. */
export const CHILD_SELFIE_CAPTURE_PREVIEW = {
  holdMs: 3_000,
  fadeMs: 400,
} as const;

/** Shared photo result / share — footer pinned to bottom via flex (100vh). */
export const CHILD_SHARED_PHOTO_FOOTER = {
  frameWidth: 386.543,
  frameGap: 17,
  paddingTop: 29.284,
  paddingX: 42.67,
  gap: 12.55,
  blur: 4.18,
  columnGap: 17,
  buttonGap: 12,
  buttonWidth: 301.2,
  buttonHeight: 46.02,
  buttonPaddingX: 12.55,
  buttonPaddingY: 6.69,
  buttonRadius: 18.41,
  buttonShadow: '1.67px 1.67px 16.73px rgba(109, 109, 109, 0.15)',
  buttonFontSize: 15.06,
  buttonLineHeight: 18.07,
  iconGap: 6.69,
  iconSize: 15.06,
} as const;

/**
 * Share / printed agreement — Figma 13674:16159 (UI) + 14283:17885 (stored image).
 * Dark change panel sits above side-by-side Share / Wallet CTAs.
 */
export const CHILD_SHARED_PHOTO_SHARE_FOOTER = {
  paddingTop: 10,
  paddingX: 42.67,
  paddingBottom: 16,
  gap: 12.55,
  blur: 4.18,
  changeBlock: {
    padding: 10,
    gap: 6,
    checkSize: 30.754,
    textGap: 4,
    textWidth: 275,
    labelFontSize: 18,
    labelLineHeight: 1.25,
    labelLetterSpacing: -0.36,
    labelColor: '#BCC8CB',
    changeFontSize: 30,
    changeLineHeight: 1.15,
    changeLetterSpacing: -0.9,
  },
  buttonRow: {
    gap: 8,
    height: 46.017,
    radius: 22,
    paddingX: 12.55,
    paddingY: 6.693,
    fontSize: 15.06,
    shadow: '1.673px 1.673px 16.733px rgba(109, 109, 109, 0.15)',
    iconSize: 15.06,
    iconGap: 6.693,
  },
} as const;

export const CHILD_SHARED_PHOTO_REVIEW = {
  logo: { left: 19, top: 19, width: 90 },
} as const;

export const CHILD_SHARED_PHOTO_SHARE = {
  logo: CHILD_SHARED_PHOTO_REVIEW.logo,
  headline: {
    left: 44,
    top: 86,
    width: 299,
    /** Room for 2 text lines + mint scribble (vector SVG). */
    height: 150,
    textWidth: 299,
    textHeight: 88,
    fontSize: 40,
    lineHeight: 1.1,
    letterSpacing: -0.8,
    textShadow: '0 0 10px rgba(0, 0, 0, 0.30)',
    underline: {
      top: 95,
      gapBelowText: 5,
      left: 7,
      width: 254.171,
      height: 13.231,
      strokeWidth: 16,
    },
  },
  /** Bottom dark band baked into stored agreement image (no CTAs). */
  agreementPanel: CHILD_SHARED_PHOTO_SHARE_FOOTER,
} as const;
