/** Floating tilt offsets for child money-goal cards (2-col grid). */
export const V03_CHALLENGE_GOAL_TILTS = [
  { rotateDeg: -3.2, floatY: 3 },
  { rotateDeg: 2.8, floatY: -2 },
  { rotateDeg: -2.1, floatY: 4 },
  { rotateDeg: 3.5, floatY: -3 },
  { rotateDeg: -2.6, floatY: 2 },
  { rotateDeg: 1.9, floatY: -4 },
  { rotateDeg: -3.8, floatY: 3 },
  { rotateDeg: 2.2, floatY: -2 },
  { rotateDeg: -1.5, floatY: 4 },
  { rotateDeg: 3.1, floatY: -3 },
  { rotateDeg: -2.9, floatY: 2 },
  { rotateDeg: 2.5, floatY: -1 },
] as const;

/** Turquoise ellipse — castle slider / onboarding mint glow (scaled for goal cards). */
export const V03_CHALLENGE_GOAL_GLOW = {
  width: 72,
  height: 72,
  blur: 38,
  color: 'var(--v03-ellipse-385)',
  bottom: -28,
} as const;
