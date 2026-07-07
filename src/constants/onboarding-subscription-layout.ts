import { ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE } from '@/constants/onboarding-figma';

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
    /** Bottom blend into green-900 — replaces signup hero ellipse stack. */
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
  logoEllipse: {
    top: 32,
    left: 117,
    width: 145,
    height: 89.93,
    fill: 'rgba(6, 43, 33, 0.15)',
    blur: 20.4617,
  },
  copy: { top: 135, left: 24, width: 327, gap: 12, headlineGap: 5 },
  features: {
    padding: 20,
    radius: 16.145,
    gap: 12,
    rowGap: 4,
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
