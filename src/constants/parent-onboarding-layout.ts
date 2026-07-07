/**
 * Parent onboarding — Figma Screen 38 (12703:42228) children details.
 * Main frame 12703:41650 — 327px column @ top 69, gap 19.
 */
export const PARENT_ROLE_STEP = {
  top: 97,
  columnGap: 35,
  cardGap: 15,
} as const;

export const PARENT_PHONE_COUNT_STEP = {
  top: 130,
  columnGap: 19,
  contentGap: 35,
} as const;

/** Figma 12703:41650 — hero + title/forms column inside 100vh funnel scroll. */
export const PARENT_CHILDREN_DETAILS_STEP = {
  /** Main column — flex col, items-end, gap 19 */
  frameWidthPx: 327,
  top: 69,
  columnGap: 19,
  /** Inner content frame 12703:41653 — title + forms */
  contentFrameGap: 30,
  formsGap: 25,
  childBlockGap: 20,
  childRowGap: 12,
  scrollPadBottomPx: 0,
  /** Hero clip frame */
  heroFramePx: 180,
  /** Overflow art inside clip — image 102 */
  heroImagePx: 250.8,
  heroImageTopPx: -26.4,
  /** `left: calc(50% - Npx)` inside hero clip */
  heroImageCenterOffsetPx: 29.6,
} as const;

/** @deprecated Use PARENT_CHILDREN_DETAILS_STEP */
export const PARENT_CHILDREN_DETAILS_TOP_PX = PARENT_CHILDREN_DETAILS_STEP.top;
/** @deprecated Use PARENT_CHILDREN_DETAILS_STEP */
export const PARENT_CHILDREN_DETAILS_COLUMN_GAP_PX = PARENT_CHILDREN_DETAILS_STEP.columnGap;
/** @deprecated Use PARENT_CHILDREN_DETAILS_STEP */
export const PARENT_CHILDREN_DETAILS_TITLE_FORMS_GAP_PX =
  PARENT_CHILDREN_DETAILS_STEP.contentFrameGap;
/** @deprecated Use PARENT_CHILDREN_DETAILS_STEP */
export const PARENT_CHILDREN_DETAILS_FORMS_GAP_PX = PARENT_CHILDREN_DETAILS_STEP.formsGap;
/** @deprecated Use PARENT_CHILDREN_DETAILS_STEP */
export const PARENT_CHILDREN_DETAILS_HERO_CLIP_PX = PARENT_CHILDREN_DETAILS_STEP.heroFramePx;
/** @deprecated Use PARENT_CHILDREN_DETAILS_STEP */
export const PARENT_CHILDREN_DETAILS_IMAGE_PX = PARENT_CHILDREN_DETAILS_STEP.heroImagePx;
/** @deprecated Use PARENT_CHILDREN_DETAILS_STEP */
export const PARENT_CHILDREN_DETAILS_IMAGE_TOP_PX = PARENT_CHILDREN_DETAILS_STEP.heroImageTopPx;
/** @deprecated Use PARENT_CHILDREN_DETAILS_STEP */
export const PARENT_CHILDREN_DETAILS_IMAGE_CENTER_OFFSET_PX =
  PARENT_CHILDREN_DETAILS_STEP.heroImageCenterOffsetPx;
