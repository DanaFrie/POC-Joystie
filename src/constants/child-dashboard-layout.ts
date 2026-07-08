/**
 * Child dashboard — Figma 13655:11339
 * @see https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform?node-id=13655-11339&m=dev
 */
const FILE =
  'https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform';

export const CHILD_DASHBOARD_FIGMA = `${FILE}?node-id=13655-11339&m=dev` as const;

export const CHILD_DASHBOARD_ASSETS = {
  companion: '/dashboard/dori-pocket-phone.webp',
  savingsCardBg: '/onboarding/landing/kingdom.webp',
  agreementThumb: '/signup/journey/agreements.webp',
  conversionCoins: '/dashboard/conversion-coins.svg',
  conversionChevron: '/dashboard/conversion-chevron.svg',
  conversionClock: '/dashboard/conversion-clock.svg',
} as const;

export const CHILD_DASHBOARD_LAYOUT = {
  contentWidth: 328,
  contentGap: 45,
  contentTop: 92,
  frame2Gap: 28,
  companion: {
    width: 151.608,
    height: 151.608,
    top: 246,
    right: 251,
    rotateDeg: -9.14,
  },
} as const;
