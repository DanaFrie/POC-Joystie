import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/** Figma canvas width — full-bleed funnel artboard. */
export const LOGIN_CANVAS_W_PX = V03_SCREEN_WIDTH;

/**
 * Scroll frame top @ 812 — banner path (`existing=1` or `method=password`).
 */
export const LOGIN_SCROLL_TOP_WITH_RESUME_BANNER_PX = 90;

/** Scroll frame top @ 812 — default login (no top banner). */
export const LOGIN_SCROLL_TOP_PX = 187;

export const LOGIN_RESUME_BANNER_H_PX = 72;

export function getLoginScrollTopPx(showTopBanner: boolean): number {
  return showTopBanner
    ? LOGIN_SCROLL_TOP_WITH_RESUME_BANNER_PX
    : LOGIN_SCROLL_TOP_PX;
}
