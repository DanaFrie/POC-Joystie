/** Signup hero — Figma Frame 1430108703 */
export const SIGNUP_HERO_HEIGHT_PX = 533;
export const SIGNUP_HERO_FRAME_TOP_PX = -3;

/** Figma mountain art inside frame 1430108703 */
export const SIGNUP_HERO_IMAGE_HEIGHT_PX = 366;
export const SIGNUP_HERO_IMAGE_WIDTH_PX = 487;

/** Ellipse 391 — top glow above mountain */
export const SIGNUP_ELLIPSE_391_TOP_PX = 74;
export const SIGNUP_ELLIPSE_391_WIDTH_PX = 145;
export const SIGNUP_ELLIPSE_391_HEIGHT_PX = 89.93;

/** Intro copy starts on the lower line of ellipse 391 */
export const SIGNUP_INTRO_TOP_PX =
  SIGNUP_ELLIPSE_391_TOP_PX + SIGNUP_ELLIPSE_391_HEIGHT_PX;

export const SIGNUP_CONTENT_PULL_UP_PX =
  SIGNUP_INTRO_TOP_PX - SIGNUP_HERO_HEIGHT_PX;

/** Frame 1597882406 — lift account block 20% toward screen top */
export const SIGNUP_ACCOUNT_FORM_LIFT_PX = Math.round(SIGNUP_INTRO_TOP_PX * 0.2);

export const SIGNUP_FORM_CONTENT_MARGIN_TOP_PX =
  SIGNUP_CONTENT_PULL_UP_PX - SIGNUP_ACCOUNT_FORM_LIFT_PX;

/** Frame 1597882421 — companion picker carousel */
export const SIGNUP_COMPANION_SIZE_PX = 161.82;
export const SIGNUP_COMPANION_ACTIVE_SIZE_PX = 178;
export const SIGNUP_COMPANION_GAP_PX = 11;

/**
 * Signup intro שלב 1 — Figma Screen 22 (12703:42217).
 * Absolute Y within 375×812; status bar omitted in app.
 */
export const SIGNUP_HOW_IT_WORKS_PILL_TOP_PX = 92;
export const SIGNUP_INTRO_COPY_TOP_PX = 182;
export const SIGNUP_INTRO_COPY_WIDTH_PX = 328;
export const SIGNUP_JOURNEY_COPY_VISUAL_GAP_PX = 40;
export const SIGNUP_INTRO_DOTS_TOP_PX = 673;

export const SIGNUP_INTRO_COPY_INNER_GAP_PX = 15;
export const SIGNUP_INTRO_EYEBROW_TITLE_GAP_PX = 4;

/** «איך זה עובד?» — 12697:36221 */
export const SIGNUP_HOW_IT_WORKS_PILL_PX = 19;
export const SIGNUP_HOW_IT_WORKS_PILL_PY = 10;

/** שלב 2 visual — Figma 12703:42218; `public/signup/journey/ball-game.webp` */
export const SIGNUP_JOURNEY_STEP2_FRAME_H_PX = 254;
export const SIGNUP_JOURNEY_STEP2_IMAGE_W_PX = 200;

/** שלב 3 visual — Figma 12703:42219; backdrop circle smaller than scroll art */
export const SIGNUP_JOURNEY_STEP3_FRAME_W_PX = 212;
export const SIGNUP_JOURNEY_STEP3_FRAME_H_PX = 216;
export const SIGNUP_JOURNEY_STEP3_BACKDROP_SIZE_PX = 148;
export const SIGNUP_JOURNEY_STEP3_IMAGE_W_PX = 234.12;
export const SIGNUP_JOURNEY_STEP3_IMAGE_H_PX = 247.03;
