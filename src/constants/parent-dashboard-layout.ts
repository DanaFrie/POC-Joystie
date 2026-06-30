/**
 * Parent dashboard — Figma 13465:6179
 * @see https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform?node-id=13465-6179&m=dev
 */
const FILE =
  'https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform';

export const PARENT_DASHBOARD_FIGMA = `${FILE}?node-id=13465-6179&m=dev` as const;

export const PARENT_DASHBOARD_COLORS = {
  canvas: '#061C1E',
  mint: '#00E7A2',
  mintBright: '#1BECAE',
  cyanGlow: '#00D5F2',
  ringTrack: '#093532',
  ringBorder: 'rgba(205.59, 240.86, 230.32, 0.15)',
  purpleDone: '#8C00FF',
  dayPending: '#3A514A',
  textPrimary: '#F6F7F6',
  textMuted: '#B9C9CB',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  cardOutline: 'rgba(247, 248, 247, 0.20)',
  walletOutline: '#26514D',
  comboOutline: '#415152',
} as const;

export const PARENT_DASHBOARD_ASSETS = {
  /** Optional — companion bleed; falls back to dori-money-sit */
  companion: '/onboarding/child/dori-money-sit.webp',
  savingsCardBg: '/dashboard/savings-card-bg.webp',
} as const;

export const PARENT_DASHBOARD_LAYOUT = {
  topBarHeight: 56,
  contentGap: 28,
  sectionGap: 12,
  ringSize: 219,
  cardRadius: 32,
} as const;
