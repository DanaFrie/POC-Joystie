/** Pick first child — Figma 13680:1526 (עם מי מתחילים?). */
export const PICK_FIRST_CHILD_HEADER_TOP_PX = 97;
export const PICK_FIRST_CHILD_CARDS_TOP_PX = 210;
export const PICK_FIRST_CHILD_HEADER_GAP_PX = 10;
export const PICK_FIRST_CHILD_CARDS_GAP_PX = 15;
export const PICK_FIRST_CHILD_SECTION_GAP_PX = 25;
export const PICK_FIRST_CHILD_FOOTNOTE_MAX_W_PX = 297;

/** Selectable child row — same shell as 13617:4029 inside 13680:1526. */
export const PICK_FIRST_CHILD_CARD = {
  contentGap: 4,
  title: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 21.6,
    letterSpacing: -0.24,
    color: '#B0C6BF',
  },
} as const;
