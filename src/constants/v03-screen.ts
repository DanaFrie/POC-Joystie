/** Figma mobile funnel artboard — all layers use this coordinate space */
export const V03_SCREEN_WIDTH = 375;
export const V03_SCREEN_HEIGHT = 812;

/** Figma preview status-bar height — reserve in layout; do not render chrome. */
export const V03_FIGMA_STATUS_BAR_OFFSET_PX = 44;

/** Shift a Figma Y coordinate down when the screen omits preview status-bar chrome. */
export function v03OffsetBelowStatusBar(figmaTop: number): number {
  return figmaTop + V03_FIGMA_STATUS_BAR_OFFSET_PX;
}

/** Viewports wider than this show “mobile only” (iPhone 12 Pro = 390px) */
export const V03_DESKTOP_MIN_WIDTH = 768;
