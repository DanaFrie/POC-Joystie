import { ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE } from '@/constants/onboarding-figma';

import { SIGNUP_HERO_HEIGHT_PX } from '@/constants/signup-layout';

/** Parent subscription gate — Figma 13277:11554 (Screen 78/79). */
export const ONBOARDING_SUBSCRIPTION = {
  hero: {
    top: 26,
    height: 366,
    /** Ellipse stack uses same 533px frame as signup/login hero. */
    ellipseFrameHeight: SIGNUP_HERO_HEIGHT_PX,
    image: ONBOARDING_PARENT_SUBSCRIPTION_HERO_IMAGE,
    gradient:
      'linear-gradient(180deg, rgba(47, 47, 47, 0) 25.37%, rgba(47, 47, 47, 0.5) 39.86%)',
  },
  logo: { top: 72, width: 107, height: 53.5 },
  copy: { top: 135, left: 22, width: 332, gap: 12, headlineGap: 5 },
  features: {
    padding: 20,
    radius: 16.145,
    gap: 20,
    rowGap: 8,
    checkSize: 18.462,
    iconSize: 20,
  },
  plans: { top: 450, left: 24, width: 327, gap: 12 },
  planCard: {
    paddingX: 30,
    paddingY: 25,
    gap: 20,
    radius: 24,
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
    price: '₪244.99 (14.90 לחודש)',
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
    label: 'תובנות, פעולות וכלים פרקטיים לצמצום זמן מסך',
    icon: '/onboarding/parent/subscription-icon-chart.svg',
  },
] as const;

export const ONBOARDING_SUBSCRIPTION_FEATURE_CHECK =
  '/onboarding/parent/subscription-feature-check.svg' as const;
