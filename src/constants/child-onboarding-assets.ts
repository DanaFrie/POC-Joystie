/**
 * Child onboarding screens 5–11 — drop files under `public/onboarding/child/`.
 *
 * | Screen | Figma node   | File |
 * |--------|--------------|------|
 * | 5–5b   | 13147:5625/6 | egg-hatch.mp4 |
 * | 6      | 13147:5622   | dori-wave-hello.webp |
 * | 7      | 13147:5623   | dori-reveal-transition.mp4 (optional) |
 * | 8      | 13147:5624   | dori-phone.mp4 |
 * | 9      | 13147:5631   | fireball.webp |
 * | 10–11  | 13147:5635/2 | ball-game-bg.webp |
 */
export const CHILD_ONBOARDING_ASSETS = {
  /** Screen 5 — full egg→Dori hatch clip; each tap plays 1/50 of duration. */
  eggHatchVideo: '/onboarding/child/egg-hatch.mp4',
  /** Screen 6 — Dori wave hello (324×324). */
  doriWaveHello: '/onboarding/child/dori-wave-hello.webp',
  /** Screen 7 — brief dark transition; auto-timer if missing. */
  doriRevealTransitionVideo: '/onboarding/child/dori-reveal-transition.mp4',
  /** Screen 8 — Dori holding phone (324×324). */
  doriPhone: '/onboarding/child/dori-phone.mp4',
  /** Screen 9 — fireball hero (~156×187, rotated −60° in layout). */
  fireball: '/onboarding/child/fireball.webp',
  /** Screens 10–11 — ball-game grid background (~453×792). */
  ballGameBg: '/onboarding/child/ball-game-bg.webp',
} as const;

/** Tap segments for egg-hatch video (Figma prototype). */
export const CHILD_EGG_HATCH_SEGMENT_COUNT = 50;

/** First N taps + last N taps play at elevated rate. */
export const CHILD_EGG_HATCH_FAST_HEAD_TAPS = 2;
export const CHILD_EGG_HATCH_FAST_TAIL_TAPS = 5;
export const CHILD_EGG_HATCH_FAST_PLAYBACK_RATE = 2.75;
export const CHILD_EGG_HATCH_NORMAL_PLAYBACK_RATE = 1;

/** Auto-advance screen 7 when transition video is missing (ms). */
export const CHILD_DORI_TRANSITION_AUTO_MS = 1800;

/** Demo auto-advance ball-game waiting → ready until parent RTDB is wired (ms). */
export const CHILD_BALL_GAME_WAITING_DEMO_MS = 4000;
