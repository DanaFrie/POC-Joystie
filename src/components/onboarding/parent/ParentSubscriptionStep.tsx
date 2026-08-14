'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { SelectableOptionCard } from '@/components/onboarding/parent/SelectableOptionCard';
import { SubscriptionJoyLogo } from '@/components/onboarding/parent/SubscriptionJoyLogo';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import {
  useFunnelFullBleed,
  useFunnelHeroBleed,
  useFunnelHeroBleedInsets,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import { ONBOARDING_SELECTABLE_OPTION } from '@/constants/onboarding-selectable-option';
import {
  ONBOARDING_SUBSCRIPTION,
  ONBOARDING_SUBSCRIPTION_FEATURES,
  ONBOARDING_SUBSCRIPTION_FEATURE_CHECK,
  ONBOARDING_SUBSCRIPTION_PLANS,
  SUBSCRIPTION_SCREEN_BG,
  type OnboardingSubscriptionPlan,
} from '@/constants/onboarding-subscription-layout';
import { FUNNEL_CTA_HEIGHT_PX } from '@/constants/funnel-vertical-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

type ParentSubscriptionStepProps = {
  selectedPlan: OnboardingSubscriptionPlan | null;
  onPlanChange: (plan: OnboardingSubscriptionPlan) => void;
  onContinue?: () => void;
  onClose?: () => void;
};

/** Scale a Figma px value to the current canvas height (≤1 on short phones). */
function sx(figmaPx: number, heightScale: number, minPx = 0): number {
  return Math.max(minPx, Math.round(figmaPx * heightScale));
}

/**
 * Figma 13277:11554 — 100vh (`fillViewport`).
 * Short viewports (SE): shrink spacing + component sizes by fillH/812 so the
 * stack lays out inside the main frame without clipping.
 */
export function ParentSubscriptionStep({
  selectedPlan,
  onPlanChange,
  onContinue,
  onClose,
}: ParentSubscriptionStepProps) {
  const layout = ONBOARDING_SUBSCRIPTION;
  const { hero, logo, topBar, copy, features, plans, planCard, cta } = layout;
  const { viewportHeight, scale } = useFunnelViewportMetrics();
  const bleedStyle = useFunnelFullBleed();

  const fillH = Math.max(
    1,
    Math.round(viewportHeight / Math.max(scale, 0.0001))
  );
  /** 1 @ iPhone 12 / 812 canvas; ~0.82 on SE — drives layout shrink. */
  const heightScale = Math.min(1, fillH / V03_SCREEN_HEIGHT);
  const isShort = heightScale < 0.98;

  const heroH = sx(hero.height, heightScale, 280);
  const heroBleedStyle = useFunnelHeroBleed(heroH);
  const { bleedX, width: bleedWidth } = useFunnelHeroBleedInsets();

  const logoTopPx = sx(logo.top, heightScale, 18);
  const logoW = sx(logo.width, heightScale, 36);
  const logoH = sx(logo.height, heightScale, 34);
  const closeTopPx = sx(topBar.closeTop, heightScale, 10);
  const closeSizePx = sx(topBar.closeSize, heightScale, 20);

  // Headline starts below scaled logo (+ small air).
  const padTopPx = Math.max(
    logoTopPx + logoH + sx(12, heightScale, 8),
    sx(copy.padTop, heightScale, 72)
  );
  const copyGapPx = sx(copy.gap, heightScale, 6);
  const headlineGapPx = sx(copy.headlineGap, heightScale, 3);
  const headlineSizePx = sx(copy.headlineSize, heightScale, 22);
  const subtitleSizePx = sx(copy.subtitleSize, heightScale, 13);

  const featuresPadPx = sx(features.padding, heightScale, 10);
  const featuresGapPx = sx(features.gap, heightScale, 8);
  const featuresFontPx = sx(features.fontSize, heightScale, 14);
  const checkSizePx = sx(features.checkSize, heightScale, 14);
  const iconSizePx = sx(features.iconSize, heightScale, 14);
  const chartIconSizePx = sx(features.chartIconSize, heightScale, 13);

  const featuresToPlansPx = sx(copy.featuresToPlansGap, heightScale, 16);
  const plansGapPx = sx(plans.gap, heightScale, 6);
  const planPadXPx = sx(planCard.paddingX, heightScale, 16);
  const planPadYPx = sx(planCard.paddingY, heightScale, 12);
  const planTitlePx = sx(plans.titleSize, heightScale, 16);
  const planPricePx = sx(plans.priceSize, heightScale, 13);
  const planRadiusPx = sx(planCard.radius, heightScale, 16);

  const plansToCtaPx = sx(cta.plansToCtaGap, heightScale, 16);
  const bottomSpacerPx = sx(cta.bottomSpacer, heightScale, 8);
  const ctaGapPx = sx(cta.gap, heightScale, 4);
  const disclaimerPx = sx(cta.disclaimerSize, heightScale, 13);
  const ctaMinH = sx(FUNNEL_CTA_HEIGHT_PX, heightScale, 48);

  const heroBackground = `${hero.gradient}, url(${hero.image}) ${SUBSCRIPTION_SCREEN_BG} ${hero.imagePosition} / ${hero.imageSize} no-repeat`;

  return (
    <FunnelStepRoot
      fillViewport
      className="relative overflow-hidden"
      style={{ background: SUBSCRIPTION_SCREEN_BG }}
      aria-label="מנוי Joystie"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
        <div
          style={{
            ...bleedStyle,
            background: SUBSCRIPTION_SCREEN_BG,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute z-[1] overflow-hidden"
        style={heroBleedStyle}
        aria-hidden
      >
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: heroBackground,
            backgroundColor: SUBSCRIPTION_SCREEN_BG,
            filter: hero.imageFilter,
          }}
        />

        <div
          className="pointer-events-none absolute z-[2] rounded-full"
          style={{
            top: sx(hero.logoGlow.top, heightScale),
            left: hero.logoGlow.left,
            width: sx(hero.logoGlow.width, heightScale, 100),
            height: sx(hero.logoGlow.height, heightScale, 60),
            background: hero.logoGlow.color,
            filter: `blur(${hero.logoGlow.blur}px)`,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute z-[2]"
        style={{
          top: sx(hero.ellipse.top, heightScale, 240),
          left: -bleedX + hero.ellipse.left,
          width: Math.max(hero.ellipse.width, bleedWidth),
          height: sx(hero.ellipse.height, heightScale, 50),
          borderRadius: hero.ellipse.borderRadius,
          background: hero.ellipse.color,
          filter: `blur(${hero.ellipse.blur}px)`,
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute left-1/2 z-[15] -translate-x-1/2"
        style={{
          top: logoTopPx,
          width: logoW,
          height: logoH,
        }}
      >
        <SubscriptionJoyLogo className="h-full w-full" />
      </div>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="absolute z-[60] flex items-center rounded-full bg-white/30 backdrop-blur-[10px]"
          style={{
            top: closeTopPx,
            left: topBar.paddingInline,
            padding: topBar.closePad,
          }}
        >
          <svg
            width={closeSizePx}
            height={closeSizePx}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M7 7l10 10M17 7L7 17"
              stroke="#092125"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}

      <div className="relative z-[10] flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div
          className="flex min-h-0 w-full flex-1 flex-col"
          style={{ paddingTop: padTopPx }}
        >
          <div
            className="mx-auto flex w-full shrink-0 flex-col items-center"
            style={{
              width: copy.width,
              maxWidth: '100%',
              gap: copyGapPx,
            }}
          >
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: headlineGapPx }}
            >
              <h1
                className="w-full text-center font-rubik font-extrabold leading-[1.1] tracking-[-0.9px] text-white"
                style={{
                  fontSize: headlineSizePx,
                  textShadow: '0px 0px 10px rgba(0, 0, 0, 0.30)',
                }}
              >
                הצטרפו למשפחות שכבר
                <br />
                מנהלות את המסכים נכון
              </h1>
              <p
                className="w-full text-center font-simpler font-normal leading-[1.28] tracking-[-0.32px] text-[#cadcd6]"
                style={{ fontSize: subtitleSizePx }}
              >
                יחד נייצר הרגלים דיגיטליים בריאים - ללא מאבקים
              </p>
            </div>

            <div
              className="flex w-full flex-col items-stretch bg-white/[0.08]"
              style={{
                padding: featuresPadPx,
                gap: featuresGapPx,
                borderRadius: features.radius,
                backdropFilter: `blur(${features.blur}px)`,
                WebkitBackdropFilter: `blur(${features.blur}px)`,
              }}
            >
              {ONBOARDING_SUBSCRIPTION_FEATURES.map((feature) => {
                const rowIcon = feature.icon.includes('chart')
                  ? chartIconSizePx
                  : iconSizePx;
                return (
                  <div
                    key={feature.label}
                    dir="ltr"
                    className="flex w-full items-center justify-between"
                  >
                    <OnboardingLazyImage
                      src={ONBOARDING_SUBSCRIPTION_FEATURE_CHECK}
                      alt=""
                      className="shrink-0 object-contain"
                      style={{
                        width: checkSizePx,
                        height: checkSizePx,
                      }}
                    />
                    <div
                      className="flex min-w-0 flex-1 items-center"
                      style={{ gap: features.rowGap }}
                    >
                      <p
                        className="min-w-0 flex-1 text-right font-simpler font-normal leading-[1.25] tracking-[-0.36px] text-v03-green-100"
                        style={{ fontSize: featuresFontPx }}
                      >
                        {feature.label}
                      </p>
                      <OnboardingLazyImage
                        src={feature.icon}
                        alt=""
                        className="shrink-0 object-contain"
                        style={{ width: rowIcon, height: rowIcon }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="w-full shrink-0"
            style={{ height: featuresToPlansPx }}
            aria-hidden
          />

          <div
            className="mx-auto flex w-full shrink-0 flex-col"
            style={{
              width: plans.width,
              maxWidth: '100%',
              gap: plansGapPx,
            }}
            role="radiogroup"
            aria-label="בחירת מנוי"
          >
            {ONBOARDING_SUBSCRIPTION_PLANS.map((option) => {
              const selected = selectedPlan === option.id;
              return (
                <SelectableOptionCard
                  key={option.id}
                  selected={selected}
                  onSelect={() => onPlanChange(option.id)}
                  textLayout="flex"
                  borderTone="accent"
                  borderRadius={planRadiusPx}
                  paddingX={planPadXPx}
                  paddingY={planPadYPx}
                  contentGap={planCard.titlePriceGap}
                >
                  <p
                    className="w-full text-right font-simpler font-bold leading-[1.2] tracking-[-0.4px] text-white"
                    style={{ fontSize: planTitlePx }}
                  >
                    {option.title}
                  </p>
                  <p
                    className="w-full text-right font-simpler font-normal leading-[1.28] tracking-[-0.32px] text-v03-green-200"
                    style={{ fontSize: planPricePx }}
                  >
                    {option.price}
                  </p>
                </SelectableOptionCard>
              );
            })}
          </div>

          {/* Tall: rubber-band to bottom. Short: scaled gap only. */}
          <div
            className={`w-full ${isShort ? 'shrink-0' : 'min-h-0 flex-1'}`}
            style={{
              height: isShort ? plansToCtaPx : undefined,
              minHeight: plansToCtaPx,
            }}
            aria-hidden
          />

          <div
            className="mx-auto w-full shrink-0"
            style={{
              width: cta.width,
              maxWidth: '100%',
              paddingBottom: bottomSpacerPx,
            }}
          >
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: ctaGapPx }}
            >
              <button
                type="button"
                disabled={selectedPlan === null}
                onClick={onContinue}
                className={`${ONBOARDING_SELECTABLE_OPTION.primaryCtaClass} w-full`}
                style={{ minHeight: ctaMinH, height: ctaMinH }}
              >
                התחלת 30 ימים ניסיון בחינם
              </button>
              <p
                className="w-full text-center font-simpler font-normal leading-[1.28] tracking-[-0.32px] text-v03-green-200"
                style={{ fontSize: disclaimerPx }}
              >
                נזכיר לכם יומיים לפני שתקופת הניסיון נגמרת
              </p>
            </div>
          </div>
        </div>
      </div>
    </FunnelStepRoot>
  );
}
