/**
 * Child dashboard — Figma 14396:20486 (before payment),
 * 14396:16697 (deal running), 14396:18776 (waiting redeem), 14396:18777 (after redeem).
 * @see https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform?node-id=14396-20486&m=dev
 */
const FILE =
  'https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform';

export const CHILD_DASHBOARD_FIGMA = `${FILE}?node-id=14396-20486&m=dev` as const;

export const CHILD_DASHBOARD_ASSETS = {
  companion: '/dashboard/dori-pocket-phone.webp',
  greetingDori: '/dashboard/dori-coins.png',
  greetingDoriNotebook: '/dashboard/dori-notebook-close.webp',
  savingsCardBg: '/onboarding/landing/kingdom.webp',
  agreementThumb: '/signup/journey/agreements.webp',
  conversionCoins: '/dashboard/conversion-coins.svg',
  conversionChevron: '/dashboard/conversion-chevron.svg',
  conversionClock: '/dashboard/conversion-clock.svg',
  conversionFlame: '/dashboard/conversion-flame.svg',
  timeCircle: '/dashboard/time-circle.svg',
  currentDayDot: '/dashboard/current-day-dot.svg',
  quickHome: '/dashboard/quick-actions/home-03.svg',
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
