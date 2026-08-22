import { ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE } from '@/constants/onboarding-figma';
import {
  FUNNEL_CTA_HEIGHT_PX,
  FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX,
  FUNNEL_FOOTER_INNER_GAP_PX,
} from '@/constants/funnel-vertical-layout';

/** CTA disclaimer line under the trial button. */
const SUBSCRIPTION_CTA_DISCLAIMER_H_PX = 22;
const SUBSCRIPTION_CTA_DISCLAIMER_GAP_PX = 6;

/**
 * Footer under plan cards — matches `FunnelStepFooter` customFooter path
 * (shell padTop only when blur/overlay; we use neither).
 */
export function getSubscriptionFooterReservePx(disclaimerH = SUBSCRIPTION_CTA_DISCLAIMER_H_PX): number {
  return (
    FUNNEL_CTA_HEIGHT_PX +
    SUBSCRIPTION_CTA_DISCLAIMER_GAP_PX +
    disclaimerH +
    FUNNEL_FOOTER_INNER_GAP_PX +
    FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX
  );
}

/**
 * Parent subscription gate — Figma 13277:11554 (Screen 78/79).
 * @ 812: Figma sizes. On shorter viewports, scale layout by
 * `fillH / 812` so the stack fits 100vh (SE shrinks components + gaps).
 */
export const ONBOARDING_SUBSCRIPTION = {
  hero: {
    /** Figma Screen layer height (status-bar offset already removed). */
    height: 414,
    image: ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE,
    gradient:
      'linear-gradient(180deg, rgba(47, 47, 47, 0) 25.37%, rgba(47, 47, 47, 0.5) 39.86%)',
    /** Figma fill: `-20.25px -24.304px / 110.8% 100.362%` (not cover). */
    imagePositionX: -20.25,
    imagePositionY: -24.304,
    imageWidth: '110.8%',
    imageHeight: '100.362%',
    /** Boost mountain color to match vibrant art (Figma export is flatter). */
    imageFilter: 'saturate(1.75) contrast(1.08)',
    ellipse: {
      top: 365,
      left: -33,
      width: 425,
      height: 82,
      borderRadius: 425,
      color: '#092125',
      blur: 15,
    },
    logoGlow: {
      top: 24,
      left: 117,
      width: 145,
      height: 89.93,
      color: 'rgba(0, 255, 179, 0.35)',
      blur: 40,
    },
  },
  /** Figma logo top after dropping status preview (72 − 26). */
  logo: { top: 46, width: 49.511, height: 47 },
  /** Close control — no Figma status-bar chrome. */
  topBar: {
    closeTop: 26,
    paddingInline: 13,
    closeSize: 24,
    closePad: 6,
  },
  copy: {
    /** Space from top of canvas to headline (logo sits above). */
    padTop: 109,
    width: 332,
    gap: 12,
    headlineGap: 5,
    /** Features card → first plan card @ 812 (scales with viewport). */
    featuresToPlansGap: 30,
    headlineSize: 30,
    subtitleSize: 16,
  },
  features: {
    padding: 20,
    radius: 16.145,
    gap: 20,
    rowGap: 8,
    checkSize: 18.462,
    iconSize: 20,
    chartIconSize: 18,
    blur: 15,
    fontSize: 18,
  },
  plans: {
    width: 327,
    gap: 12,
    titleSize: 20,
    priceSize: 16,
  },
  planCard: {
    paddingX: 30,
    paddingY: 25,
    titlePriceGap: 4,
    radius: 24,
  },
  cta: {
    width: 327,
    gap: 6,
    /** Plan cards → footer CTA @ 812 (scales with viewport). */
    plansToCtaGap: 30,
    disclaimerSize: 16,
    /** Figma lower home-indicator row — spacing only, no chrome. */
    bottomSpacer: FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX,
    button: {
      height: 55,
      paddingX: 15,
      paddingY: 8,
      gap: 8,
    },
  },
} as const;

export type OnboardingSubscriptionPlan = 'annual' | 'monthly';

export const ONBOARDING_SUBSCRIPTION_PLANS: {
  id: OnboardingSubscriptionPlan;
  title: string;
  price: string;
}[] = [
  {
    id: 'annual',
    title: 'מנוי שנתי',
    price: '₪244.99 (₪14.90 לחודש)',
  },
  {
    id: 'monthly',
    title: 'מנוי חודשי',
    price: '₪24.90 לחודש',
  },
];

export const ONBOARDING_SUBSCRIPTION_FEATURES = [
  {
    label: 'אתגרי זמן מסך ללא הגבלה',
    icon: '/onboarding/parent/subscription-icon-target.svg',
  },
  {
    label: 'ניהול ארנק דיגיטלי לילדים',
    icon: '/onboarding/parent/subscription-icon-wallet.svg',
  },
  {
    label: 'תובנות, פעולות וכלים פרקטיים לשינוי התנהגותי אמיתי',
    icon: '/onboarding/parent/subscription-icon-chart.svg',
  },
] as const;

export const ONBOARDING_SUBSCRIPTION_FEATURE_CHECK =
  '/onboarding/parent/subscription-feature-check.svg' as const;

/** Screen / fallback fill — never use lightgray (shows as white seam on SE). */
export const SUBSCRIPTION_SCREEN_BG = 'var(--v03-green-900, #092125)';
