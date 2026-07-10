import { ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE } from '@/constants/onboarding-figma';
import {
  FUNNEL_CTA_HEIGHT_PX,
  FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX,
  FUNNEL_FOOTER_INNER_GAP_PX,
  FUNNEL_SECTION_GAP_MIN_PX,
} from '@/constants/funnel-vertical-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

/** CTA disclaimer line under the trial button. */
const SUBSCRIPTION_CTA_DISCLAIMER_H_PX = 22;
const SUBSCRIPTION_CTA_DISCLAIMER_GAP_PX = 6;

/**
 * Footer under plan cards — matches `FunnelStepFooter` customFooter path
 * (shell padTop only when blur/overlay; we use neither).
 */
export function getSubscriptionFooterReservePx(): number {
  return (
    FUNNEL_CTA_HEIGHT_PX +
    SUBSCRIPTION_CTA_DISCLAIMER_GAP_PX +
    SUBSCRIPTION_CTA_DISCLAIMER_H_PX +
    FUNNEL_FOOTER_INNER_GAP_PX +
    FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX
  );
}

/** Approximate plan-card height (title + price + padding). */
function estimatePlanCardHeightPx(paddingY: number, contentGap: number): number {
  return paddingY * 2 + contentGap + 24 + 22;
}

/** Parent subscription gate — Figma 13277:11554 (Screen 78/79). */
export const ONBOARDING_SUBSCRIPTION = {
  hero: {
    /** Full-bleed from canvas top — no Figma status-bar offset. */
    top: 0,
    width: 375,
    height: 414,
    image: ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE,
    gradient:
      'linear-gradient(180deg, rgba(47, 47, 47, 0) 25.37%, rgba(47, 47, 47, 0.5) 39.86%)',
    imagePosition: '-20.25px -24.304px',
    imageSize: '110.8% 100.362%',
    /** Bottom blend into green-900. */
    ellipse: {
      top: 365,
      left: -33,
      width: 425,
      height: 82,
      borderRadius: 425,
      color: '#092125',
      blur: 15,
    },
  },
  logo: { top: 72, left: 162, width: 49.511, height: 47 },
  copy: { top: 135, left: 24, width: 327, gap: 12, headlineGap: 5 },
  features: {
    padding: 20,
    radius: 16.145,
    gap: 12,
    rowGap: 8,
    checkSize: 18.462,
    iconSize: 20,
  },
  plans: { top: 424, left: 24, width: 327, gap: 12 },
  planCard: {
    paddingX: 30,
    paddingY: 25,
    gap: 20,
    radius: 24,
  },
  cta: {
    top: 652,
    left: 24,
    width: 327,
    gap: 6,
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
    price: '₪120 (₪10 לחודש)',
  },
  {
    id: 'monthly',
    title: 'מנוי חודשי',
    price: '₪15 לחודש',
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
    label: 'תובנות, פעולות וכלים פרקטיים לצמצום זמן מסך',
    icon: '/onboarding/parent/subscription-icon-chart.svg',
  },
] as const;

export const ONBOARDING_SUBSCRIPTION_FEATURE_CHECK =
  '/onboarding/parent/subscription-feature-check.svg' as const;

/** Screen / fallback fill — never use lightgray (shows as white seam on SE). */
export const SUBSCRIPTION_SCREEN_BG = 'var(--v03-green-900, #092125)';

/**
 * Responsive metrics for 100vh `fitViewport` subscription gate.
 * Short viewports (SE): shrink cards + keep hero at Figma ratio — don't stretch into CTA.
 * Tall viewports: allow hero to extend slightly so plans sit on mountain→green blend.
 */
export function getSubscriptionCompactMetrics(usableCanvasHeightPx: number) {
  const layoutScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const veryTight = layoutScale < 0.82;
  const tight = layoutScale < 0.9;
  const ellipseScale = layoutScale;

  const planPaddingY = Math.max(
    veryTight ? 10 : tight ? 14 : 16,
    Math.round(ONBOARDING_SUBSCRIPTION.planCard.paddingY * layoutScale)
  );
  const planContentGap = Math.max(
    veryTight ? 8 : 12,
    Math.round(ONBOARDING_SUBSCRIPTION.planCard.gap * layoutScale)
  );
  const planGap = Math.max(
    veryTight ? 8 : 10,
    Math.round(ONBOARDING_SUBSCRIPTION.plans.gap * layoutScale)
  );
  const sectionGap = Math.max(
    veryTight ? 8 : FUNNEL_SECTION_GAP_MIN_PX,
    Math.round(ONBOARDING_SUBSCRIPTION.copy.gap * layoutScale)
  );

  const planCardH = estimatePlanCardHeightPx(planPaddingY, planContentGap);
  const plansBlockH = planCardH * 2 + planGap;
  const footerReservePx = getSubscriptionFooterReservePx();
  /**
   * Gap between last plan card and trial CTA — Figma ~36px @ 812;
   * keep a hard floor on SE so the button never sits on the card.
   */
  const plansToCtaGap = Math.max(
    veryTight ? 16 : tight ? 20 : 24,
    Math.round(36 * layoutScale)
  );

  const figmaHeroH = Math.round(ONBOARDING_SUBSCRIPTION.hero.height * layoutScale);

  /**
   * Max hero that still leaves room for plans + CTA without overlap.
   * On SE, stretch-to-plans was eating that budget and cards piled onto the button.
   */
  const maxHeroForPlans = Math.round(
    usableCanvasHeightPx -
      footerReservePx -
      plansBlockH -
      plansToCtaGap -
      sectionGap
  );

  let heroHeightPx: number;
  if (veryTight) {
    /** SE: Figma-scaled hero, never larger than plan/CTA budget. */
    heroHeightPx = Math.min(figmaHeroH, Math.max(220, maxHeroForPlans));
  } else if (tight) {
    heroHeightPx = Math.min(Math.max(figmaHeroH, maxHeroForPlans - 8), maxHeroForPlans);
  } else {
    /** Tall phones: fill to plan seam (no white band), never past CTA budget. */
    heroHeightPx = Math.min(Math.max(figmaHeroH, maxHeroForPlans), usableCanvasHeightPx);
  }

  /** Figma: ellipse sits 49px above hero bottom (414 − 365). */
  const ellipseInsetFromHeroBottom =
    ONBOARDING_SUBSCRIPTION.hero.height - ONBOARDING_SUBSCRIPTION.hero.ellipse.top;

  return {
    layoutScale,
    veryTight,
    heroHeightPx,
    ellipseTopPx: Math.round(
      Math.max(0, heroHeightPx - ellipseInsetFromHeroBottom * ellipseScale)
    ),
    ellipseScale,
    padTopPx: Math.max(
      veryTight ? 56 : 72,
      Math.round(ONBOARDING_SUBSCRIPTION.copy.top * layoutScale)
    ),
    sectionGap,
    headlineGap: Math.max(4, Math.round(ONBOARDING_SUBSCRIPTION.copy.headlineGap * layoutScale)),
    headlineSize: Math.max(veryTight ? 20 : 22, Math.round(30 * Math.min(1, layoutScale + 0.02))),
    subtitleSize: Math.max(13, Math.round(16 * layoutScale)),
    featuresPadding: Math.max(10, Math.round((veryTight ? 12 : 20) * layoutScale)),
    featuresGap: Math.max(6, Math.round(ONBOARDING_SUBSCRIPTION.features.gap * layoutScale)),
    featuresRowGap: ONBOARDING_SUBSCRIPTION.features.rowGap,
    featureFontSize: Math.max(14, Math.round(18 * layoutScale)),
    featureIconSize: Math.max(16, Math.round(ONBOARDING_SUBSCRIPTION.features.iconSize * layoutScale)),
    featureCheckSize: Math.max(16, Math.round(ONBOARDING_SUBSCRIPTION.features.checkSize * layoutScale)),
    planPaddingY,
    planPaddingX: Math.max(18, Math.round(ONBOARDING_SUBSCRIPTION.planCard.paddingX * layoutScale)),
    planGap,
    planContentGap,
    plansToCtaGap,
    planTitleSize: Math.max(16, Math.round(20 * layoutScale)),
    planPriceSize: Math.max(13, Math.round(16 * layoutScale)),
    closeTopPx: Math.round(26 * layoutScale),
    logoScale: Math.min(1, layoutScale + (veryTight ? 0.04 : 0)),
  };
}
