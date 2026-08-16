/**
 * Parent dashboard — Figma 13655:11338
 * @see https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform?node-id=13655-11338&m=dev
 */
const FILE =
  'https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform';

export const PARENT_DASHBOARD_FIGMA = `${FILE}?node-id=13655-11338&m=dev` as const;

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
  challengeBanner: '/dashboard/dori-fly.webp',
  doriNotepad: '/dashboard/dori-notebook-close.webp',
  doriMoneySit: '/onboarding/child/dori-money-sit.webp',
  agreementThumb: '/signup/journey/agreements.webp',
  completionCheck: '/onboarding/parent/completion-check.svg',
  /** Mint tick for quick-action success (copy / add-to-home). */
  quickActionTick: '/onboarding/parent/subscription-feature-check.svg',
  quickCopy: '/dashboard/quick-actions/copy-01.svg',
  dealInfo: '/dashboard/info.svg',
  dealHourInfo: '/dashboard/screen-hour-info.svg',
  timeCircle: '/dashboard/time-circle.svg',
  /** Figma 14293:25679 — completed-deals row chevron. */
  completedDealsChevron: '/dashboard/chevron-left.svg',
  /** Figma 14293:25456 — completed-deals page back arrow (→). */
  completedDealsBack: '/dashboard/arrow-right.svg',
  dealEdit: '/dashboard/edit-03.svg',
} as const;

export const PARENT_DASHBOARD_LAYOUT = {
  topBarHeight: 56,
  /** Side gutters — keep on Pixel / Samsung at 100vw. */
  gutter: 24,
  /** Major sections: deals → quick actions → השינוי. */
  contentGap: 40,
  /** Below blur top bar (no fillet / no top:10 offset). */
  contentTop: 72,
  sectionGap: 12,
  frame1Gap: 15,
  frame2Gap: 8,
  frame3Gap: 12,
  ringSize: 219,
  cardRadius: 32,
  contentWidth: 328,
  /** Figma Ellipse 196 — pager under changes card. */
  pagerDotSize: 9,
  pagerDotGap: 8,
  pagerTop: 12,
  pagerCardGap: 12,
} as const;
