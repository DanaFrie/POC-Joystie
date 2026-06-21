/** Joystie logo — child screens 3–4 (161×78 SVG, centered on 375 canvas). */
export const CHILD_ONBOARDING_LOGO = {
  top: 120,
  width: 161,
  height: 78,
} as const;

/** Figma 13367:4097 — screen 4 content frame (327×540 @ left 24, top 253). */
export const CHILD_COMPANION_PICK_FRAME = {
  left: 24,
  top: 253,
  width: 327,
  height: 540,
  contentGap: 86,
  headlineGap: 3,
  headline: {
    line1FontSize: 24,
    line1LineHeight: 30,
    line2FontSize: 30,
    line2LineHeight: 33,
    line2Height: 34,
    textShadow: '0 0 20px rgba(255, 255, 255, 0.50)',
  },
  speechBubble: {
    width: 265,
    left: 55,
    top: 97,
    paddingTop: 16.7,
    paddingBottom: 12.99,
    paddingLeft: 20.89,
    paddingRight: 20.89,
    gap: 20.89,
    borderRadius: 16,
    outline: '2px solid #FFF',
    background: 'rgba(255, 255, 255, 0.10)',
    backdropBlur: 11.41,
    boxShadow:
      '0 5.493237495422363px 5.493237495422363px rgba(0, 0, 0, 0.25)',
    tailLeft: 34.22,
    tailTop: 62,
    fontSize: 24,
    lineHeight: 30,
  },
  companion: {
    size: 269,
    imageSize: 238.9,
    imageOffset: 15.05,
    outerRadius: 300,
    outerBackground: 'rgba(255, 255, 255, 0.60)',
    outerInsetShadow:
      '6.760794639587402px 6.760794639587402px 16.901987075805664px rgba(39, 11, 83, 0.20) inset',
    outerBackdropBlur: 16.9,
    ringSize: 313.52,
    ringLeft: -22.56,
    ringTop: -22.26,
    ringRadius: 217.06,
    ringBorder: '5.57px solid #00FFB3',
    badgeSize: 52.87,
    badgeLeft: 188.93,
    badgeTop: 0,
  },
  cta: {
    width: 327,
    height: 55,
    paddingX: 15,
    paddingY: 8,
    borderRadius: 22,
    fontSize: 18,
    color: '#031D15',
  },
} as const;

/** @deprecated Use CHILD_COMPANION_PICK_FRAME */
export const CHILD_DORI_OVERLAY = CHILD_COMPANION_PICK_FRAME;
