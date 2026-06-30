import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/** Figma 13656:7722 / Frame 1430108694 — score ring on 375px ball-game court. */
export const BALL_GAME_SCORE_RING_DISC = {
  size: 312.075,
  /** Figma frame — white @ 10%. */
  fill: 'rgba(255, 255, 255, 0.1)',
  textColor: 'rgba(255, 255, 255, 0.34)',
} as const;

export const BALL_GAME_SCORE_RING_PROGRESS = {
  /** Outermost progress pixels — inset from screen left/right. */
  screenInsetX: 7.45,
  /** Outermost progress pixels — offset outside disc edge. */
  discGap: 23.5,
  stroke: 14.2,
  color: '#1A8F6D',
} as const;

/** Progress ring outer diameter (7.45px gutters on 375px canvas). */
export const BALL_GAME_SCORE_RING_OUTER_SIZE =
  V03_SCREEN_WIDTH - BALL_GAME_SCORE_RING_PROGRESS.screenInsetX * 2;

export const BALL_GAME_SCORE_RING_DISC_OFFSET =
  (BALL_GAME_SCORE_RING_OUTER_SIZE - BALL_GAME_SCORE_RING_DISC.size) / 2;

const DISC_RADIUS = BALL_GAME_SCORE_RING_DISC.size / 2;

/** SVG stroke centerline — outer edge sits discGap outside the disc. */
export const BALL_GAME_SCORE_RING_ARC_RADIUS =
  DISC_RADIUS +
  BALL_GAME_SCORE_RING_PROGRESS.discGap -
  BALL_GAME_SCORE_RING_PROGRESS.stroke / 2;

export const BALL_GAME_SCORE_RING_ARC_CIRCUMFERENCE =
  2 * Math.PI * BALL_GAME_SCORE_RING_ARC_RADIUS;

/** Typography — relative to disc diameter. */
export const BALL_GAME_SCORE_RING_TEXT = {
  scoreFontRatio: 0.34,
  labelFontRatio: 0.105,
  labelGapRatio: 0.012,
} as const;

/** Canvas placement — progress outer edge at screenInsetX from sides. */
export const BALL_GAME_SCORE_RING_COURT = {
  left: BALL_GAME_SCORE_RING_PROGRESS.screenInsetX,
  /** Keeps prior vertical center (~406px) with the new outer size. */
  top: 225.95,
  size: BALL_GAME_SCORE_RING_OUTER_SIZE,
} as const;
