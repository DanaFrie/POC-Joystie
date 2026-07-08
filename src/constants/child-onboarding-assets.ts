/**
 * Child onboarding screens 5–11 — drop files under `public/onboarding/child/`.
 *
 * | Screen | Figma node   | File |
 * |--------|--------------|------|
 * | 5–5b   | 13147:5625/6 | egg-hatch.mp4 |
 * | 6      | 13617:5403   | dori-reveal-transition.mp4 |
 * | 7      | —            | mint handoff (no asset) |
 * | 8      | 13147:5624   | dori-phone.mp4 |
 * | 9      | 13147:5631   | fireball.webp |
 * | 10–11  | 13147:5635/2 | ball-game-bg.webp |
 */
export const CHILD_ONBOARDING_ASSETS = {
  /** Screen 5 — full egg→Dori hatch clip; each tap plays 1/50 of duration. */
  eggHatchVideo: '/onboarding/child/egg-hatch.mp4',
  /** Screen 6 — Dori reveal hero (324×324). */
  doriRevealTransitionVideo: '/onboarding/child/dori-reveal-transition.mp4',
  /** Screen 8 — Dori holding phone (324×324). */
  doriPhone: '/onboarding/child/dori-phone.mp4',
  /** Screen 9 — fireball hero (~156×187, rotated −60° in layout). */
  fireball: '/onboarding/child/fireball.webp',
  /** Screens 10–11 — ball-game grid background (~453×792). */
  ballGameBg: '/onboarding/child/ball-game-bg.webp',
  /** Ball-game miss — Figma 13234:17844 */
  doriDisappointed: '/onboarding/child/dori-disappointed.webp',
  /** Post mission-1 win — confetti celebration. */
  doriConfettiCelebrate: '/onboarding/child/dori-confeti-celebrate.mp4',
  doriHappy: '/onboarding/child/dori-happy.webp',
  doriNotebookClose: '/onboarding/child/dori-notebook-close.webp',
  doriNotebookOpen: '/onboarding/child/dori-notebook-open.webp',
  doriMoneySit: '/onboarding/child/dori-money-sit.webp',
  doriRunToCastle: '/onboarding/child/dori-run-to-castle.mp4',
  doriCastle: '/onboarding/child/dori-castle.webp',
  /** Mission 3 — castle selfie camera frame background. */
  castleDoriSelfie: '/onboarding/child/castle-dori-selfie.webp',
  /** Mission 3 intro — mother + child with Dori. */
  motherChildDori: '/onboarding/child/mother-child-dori.webp',
  /** Mission 3 intro — father + child with Dori. */
  fatherChildDori: '/onboarding/child/father-child-dori.webp',
  /** Mission 3 — default share result when skipping selfie (boy). */
  defaultSelfieBoy: '/onboarding/child/default-selfie-boy.webp',
  /** Mission 3 — default share result when skipping selfie (girl). */
  defaultSelfieGirl: '/onboarding/child/default-selfie-girl.webp',
  /** Castle change celebration — Figma 13702:9497 + confetti overlay. */
  confettiPurple: '/onboarding/child/confeti-purple.gif',
  /** Castle change celebration — Figma 13702:9497 */
  confettiRed: '/onboarding/child/conffeti_red.gif',
  castleChangeConfirmIcon: '/onboarding/child/V-icon.png',
  castleChangeDeclineIcon: '/onboarding/child/X-icon.png',
} as const;

/** Tap segments for egg-hatch video (Figma prototype). */
export const CHILD_EGG_HATCH_SEGMENT_COUNT = 35;

/** First N taps + last N taps play at elevated rate. */
export const CHILD_EGG_HATCH_FAST_HEAD_TAPS = 2;
export const CHILD_EGG_HATCH_FAST_TAIL_TAPS = 5;
export const CHILD_EGG_HATCH_FAST_PLAYBACK_RATE = 2.75;
export const CHILD_EGG_HATCH_NORMAL_PLAYBACK_RATE = 1;

/** Grey egg→Dori bridge + mint handoff screens (ms). */
export const CHILD_EGG_TRANSITION_AUTO_MS = 1400;
export const CHILD_DORI_TRANSITION_AUTO_MS = 1800;

/** Demo auto-advance ball-game waiting → ready until parent RTDB is wired (ms). */
export const CHILD_BALL_GAME_WAITING_DEMO_MS = 4000;
