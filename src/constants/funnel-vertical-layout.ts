import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

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

/** Footer shell padding above button (Figma stacked footer). */
export const FUNNEL_FOOTER_SHELL_PAD_TOP_PX = 20;

/** Gap between CTA and optional login link row. */
export const FUNNEL_FOOTER_INNER_GAP_PX = 15;

/** Login link row approximate height. */
export const FUNNEL_FOOTER_LOGIN_ROW_H_PX = 22;

/** Legacy stacked footer shell top @ 812 — reference only during migration. */
export const FUNNEL_LEGACY_FOOTER_SHELL_TOP_PX = 690;

/** Canvas space from legacy footer button top to canvas bottom. */
export const FUNNEL_LEGACY_FOOTER_RESERVE_PX =
  V03_SCREEN_HEIGHT - (FUNNEL_LEGACY_FOOTER_SHELL_TOP_PX + FUNNEL_FOOTER_SHELL_PAD_TOP_PX);

export type FunnelForegroundDistribution = 'between' | 'start' | 'center';

/** Set on `[data-v03-funnel]` when a step uses `fitViewport` to shrink canvas to visible height. */
export const V03_ACTIVE_CANVAS_HEIGHT_VAR = '--v03-active-canvas-height';

/** Screen layout template — guides migration batches. */
export type FunnelStepTemplate = 'fixed-stack' | 'stack-scroll-main' | 'bleed-cinematic' | 'special';
