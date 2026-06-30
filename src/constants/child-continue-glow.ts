/** Shared mint continue glow — Figma 13668:6585. */
export const CHILD_CONTINUE_GLOW = {
  size: 54,
  ringStroke: 1.54286,
  blur: 13.499999046325684,
  layerBlur: 27,
  /** Gap from white ring edge to continue label. */
  labelGap: 17,
  /** Touch target — icon + full halo bleed (layerBlur extends ~27px each side). */
  hitExtent: 54 + 27 * 2,
} as const;

export const CHILD_CONTINUE_GLOW_HIT_PAD =
  (CHILD_CONTINUE_GLOW.hitExtent - CHILD_CONTINUE_GLOW.size) / 2;
