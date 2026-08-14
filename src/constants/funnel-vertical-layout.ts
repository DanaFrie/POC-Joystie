/**
 * Shared vertical layout tokens for funnel foreground stacks (100% height + auto gaps).
 * Figma values @ 812px canvas = max; flex distributes below that on short viewports.
 */

/** Top inset for foreground column (below safe area — applied via CSS + optional override). */
export const FUNNEL_FOREGROUND_PAD_TOP_PX = 72;

/** Bottom inset above home indicator (paired with env(safe-area-inset-bottom) in components). */
export const FUNNEL_FOREGROUND_PAD_BOTTOM_PX = 34;

/** Minimum gap between foreground sections — never collapse below this. */
export const FUNNEL_SECTION_GAP_MIN_PX = 12;

/** Reference gap @ 812px (Figma); use in layout constants as max. */
export const FUNNEL_SECTION_GAP_MAX_PX = 42;

/** Primary CTA height — matches stacked footer buttons. */
export const FUNNEL_CTA_HEIGHT_PX = 55;

/**
 * Figma CTA label — 18px/Bold (התחלה et al.).
 * Pair accent/mint fills with `text-v03-green-900`.
 */
export const V03_CTA_LABEL_CLASS =
  'font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right';

/** Accent CTA text on mint / turquoise fills — Green-900. */
export const V03_CTA_ACCENT_LABEL_CLASS = `${V03_CTA_LABEL_CLASS} text-v03-green-900`;

/** Footer shell padding above button (Figma stacked footer). */
export const FUNNEL_FOOTER_SHELL_PAD_TOP_PX = 20;

/** Gap between CTA and optional login link row (or home-indicator spacer). */
export const FUNNEL_FOOTER_INNER_GAP_PX = 15;

/** Empty row below CTA — Figma home-indicator reserve (no content). */
export const FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX = 32;

/** Login link row approximate height. */
export const FUNNEL_FOOTER_LOGIN_ROW_H_PX = 22;

/** Stacked footer shell height — pad + CTA + gaps + home-indicator spacer (+ optional login row). */
export function getFunnelStackedFooterShellHeightPx(options?: {
  showLoginLink?: boolean;
  showSignupLink?: boolean;
  showSecondaryLink?: boolean;
  /** Status text only — no CTA button (e.g. «בודק קישור…»). */
  statusOnly?: boolean;
}): number {
  const {
    showLoginLink = false,
    showSignupLink = false,
    showSecondaryLink = false,
    statusOnly = false,
  } = options ?? {};

  if (statusOnly) {
    return (
      FUNNEL_FOOTER_SHELL_PAD_TOP_PX +
      FUNNEL_FOOTER_LOGIN_ROW_H_PX +
      FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX
    );
  }

  let height =
    FUNNEL_FOOTER_SHELL_PAD_TOP_PX +
    FUNNEL_CTA_HEIGHT_PX +
    FUNNEL_FOOTER_INNER_GAP_PX +
    FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX;

  if (showLoginLink || showSignupLink || showSecondaryLink) {
    height += FUNNEL_FOOTER_LOGIN_ROW_H_PX + FUNNEL_FOOTER_INNER_GAP_PX;
  }

  return height;
}

/** Extra tail pad inside scroll content only — not the scroll viewport inset. */
export const FUNNEL_FOOTER_SCROLL_END_PAD_PX = 24;

/**
 * Scroll frame bottom inset — 0px gap above stacked footer shell top.
 * Shortens the scroll viewport in place; do not duplicate this as scroll `paddingBottom`.
 */
export function getFunnelScrollFrameBottomInsetPx(options?: {
  showLoginLink?: boolean;
  showSignupLink?: boolean;
  showSecondaryLink?: boolean;
  statusOnly?: boolean;
}): number {
  return getFunnelStackedFooterShellHeightPx(options);
}

/**
 * Optional tail pad inside scroll content when the last row needs a few px above the
 * frosted footer. Foreground `padBottomPx` already ends the viewport at footer top —
 * never use full shell height here (causes scrolling through empty space).
 */
export function getFunnelScrollContentEndPadPx(): number {
  return FUNNEL_FOOTER_SCROLL_END_PAD_PX;
}

export type FunnelForegroundDistribution = 'between' | 'start' | 'center';

/**
 * Set on `[data-v03-funnel]`:
 * - `fitViewport` may set below 812 (shrink to visible height)
 * - grow-for-scroll (legal/help) may set above 812 so FunnelViewport page-scrolls
 */
export const V03_ACTIVE_CANVAS_HEIGHT_VAR = '--v03-active-canvas-height';

/** Screen layout template — guides migration batches. */
export type FunnelStepTemplate = 'fixed-stack' | 'stack-scroll-main' | 'bleed-cinematic' | 'special';
