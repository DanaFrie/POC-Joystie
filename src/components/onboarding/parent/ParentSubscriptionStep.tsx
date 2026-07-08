'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { SelectableOptionCard } from '@/components/onboarding/parent/SelectableOptionCard';
import { SubscriptionJoyLogo } from '@/components/onboarding/parent/SubscriptionJoyLogo';
import {
  FunnelStepFooter,
  FunnelStepForeground,
  FunnelStepRoot,
} from '@/components/ui/funnel-layout';
import {
  useFunnelFullBleed,
  useFunnelHeroBleed,
  useFunnelHeroBleedInsets,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import { ONBOARDING_SELECTABLE_OPTION } from '@/constants/onboarding-selectable-option';
import {
  getSubscriptionCompactMetrics,
  ONBOARDING_SUBSCRIPTION,
  ONBOARDING_SUBSCRIPTION_FEATURES,
  ONBOARDING_SUBSCRIPTION_FEATURE_CHECK,
  ONBOARDING_SUBSCRIPTION_PLANS,
  SUBSCRIPTION_SCREEN_BG,
  type OnboardingSubscriptionPlan,
} from '@/constants/onboarding-subscription-layout';
import { FUNNEL_CTA_HEIGHT_PX } from '@/constants/funnel-vertical-layout';

type ParentSubscriptionStepProps = {
  selectedPlan: OnboardingSubscriptionPlan | null;
  onPlanChange: (plan: OnboardingSubscriptionPlan) => void;
  onContinue?: () => void;
  onClose?: () => void;
};

/** Figma 13277:11554 — subscription / trial gate (Screen 78/79). */
export function ParentSubscriptionStep({
  selectedPlan,
  onPlanChange,
  onContinue,
  onClose,
}: ParentSubscriptionStepProps) {
  const layout = ONBOARDING_SUBSCRIPTION;
  const { hero, logo } = layout;
  const bleedStyle = useFunnelFullBleed();
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const metrics = getSubscriptionCompactMetrics(usableCanvasHeightPx);
  const heroBleedStyle = useFunnelHeroBleed(metrics.heroHeightPx);
  const { bleedX, width: bleedWidth } = useFunnelHeroBleedInsets();

  /** Green fill behind image — never `lightgray` (shows as white seam on SE). */
  const heroBackground = `${hero.gradient}, url(${hero.image}) ${SUBSCRIPTION_SCREEN_BG} ${hero.imagePosition} / ${hero.imageSize} no-repeat`;

  return (
    <FunnelStepRoot
      fitViewport
      className="relative overflow-hidden"
      style={{ background: SUBSCRIPTION_SCREEN_BG }}
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
          }}
        />

        <div
          className="pointer-events-none absolute z-[5] -translate-x-1/2"
          style={{
            top: logo.top * metrics.logoScale,
            left: '50%',
            width: logo.width * metrics.logoScale,
            height: logo.height * metrics.logoScale,
          }}
        >
          <SubscriptionJoyLogo className="h-full w-full" />
        </div>
      </div>

      {/* Bottom blend — outside image clip so soft edge + green body meet. */}
      <div
        className="pointer-events-none absolute z-[2]"
        style={{
          top: metrics.ellipseTopPx,
          left: -bleedX + hero.ellipse.left * metrics.ellipseScale,
          width: Math.max(hero.ellipse.width * metrics.ellipseScale, bleedWidth),
          height: hero.ellipse.height * metrics.ellipseScale,
          borderRadius: hero.ellipse.borderRadius * metrics.ellipseScale,
          background: hero.ellipse.color,
          filter: `blur(${hero.ellipse.blur}px)`,
        }}
        aria-hidden
      />

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="absolute left-[13px] z-[60] flex items-center rounded-full bg-white/30 p-[6px] backdrop-blur-[10px]"
          style={{ top: metrics.closeTopPx }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M7 7l10 10M17 7L7 17"
              stroke="#092125"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}

      <FunnelStepForeground
        fitViewport
        distribution="between"
        padTopPx={metrics.padTopPx}
        padBottomPx={0}
        className="z-[10]"
      >
        <div
          className="flex min-h-0 w-full flex-1 flex-col"
          style={{ gap: metrics.sectionGap }}
        >
          <div className="flex w-full shrink-0 flex-col" style={{ gap: metrics.sectionGap }}>
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: metrics.headlineGap }}
            >
              <h1
                className="w-full text-center font-simpler font-black leading-[1.1] tracking-[-0.6px] text-white"
                style={{
                  fontSize: metrics.headlineSize,
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                הצטרפו למשפחות שכבר מנהלות את המסכים נכון
              </h1>
              <p
                className="w-full text-center font-simpler font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-100"
                style={{ fontSize: metrics.subtitleSize }}
              >
                יחד נייצר הרגלים דיגיטליים בריאים - ללא מאבקים
              </p>
            </div>

            <div
              className="flex w-full shrink-0 flex-col items-stretch rounded-[16.145px] bg-white/[0.08] backdrop-blur-[6px]"
              style={{
                padding: metrics.featuresPadding,
                gap: metrics.featuresGap,
              }}
            >
              {ONBOARDING_SUBSCRIPTION_FEATURES.map((feature) => (
                <div key={feature.label} className="flex w-full items-center gap-2">
                  <div
                    className="flex min-w-0 flex-1 items-center"
                    style={{ gap: metrics.featuresRowGap }}
                  >
                    <OnboardingLazyImage
                      src={feature.icon}
                      alt=""
                      className="shrink-0 object-contain"
                      style={{
                        width: metrics.featureIconSize,
                        height: metrics.featureIconSize,
                      }}
                    />
                    <p
                      className="flex-1 text-right font-simpler font-normal leading-[1.25] tracking-[-0.27px] text-v03-green-100"
                      style={{ fontSize: metrics.featureFontSize }}
                    >
                      {feature.label}
                    </p>
                  </div>
                  <OnboardingLazyImage
                    src={ONBOARDING_SUBSCRIPTION_FEATURE_CHECK}
                    alt=""
                    className="shrink-0 object-contain"
                    style={{
                      width: metrics.featureCheckSize,
                      height: metrics.featureCheckSize,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-auto flex w-full shrink-0 flex-col items-stretch pb-1"
            style={{ gap: metrics.planGap }}
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
                  textLayout="fixed"
                  borderTone="accent"
                  borderRadius={layout.planCard.radius}
                  paddingX={metrics.planPaddingX}
                  paddingY={metrics.planPaddingY}
                  contentGap={metrics.planContentGap}
                >
                  <p
                    className="w-full text-right font-simpler font-bold leading-[1.2] tracking-[-0.3px] text-white"
                    style={{ fontSize: metrics.planTitleSize }}
                  >
                    {option.title}
                  </p>
                  <p
                    className="w-full text-right font-simpler font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-200"
                    style={{ fontSize: metrics.planPriceSize }}
                  >
                    {option.price}
                  </p>
                </SelectableOptionCard>
              );
            })}
          </div>
        </div>

        <FunnelStepFooter
          className="shrink-0"
          customFooter={
            <div className="flex w-full flex-col gap-[6px]">
              <button
                type="button"
                disabled={selectedPlan === null}
                onClick={onContinue}
                className={`${ONBOARDING_SELECTABLE_OPTION.primaryCtaClass} w-full`}
                style={{ minHeight: FUNNEL_CTA_HEIGHT_PX }}
              >
                התחלת 30 ימים ניסיון בחינם
              </button>
              <p className="w-full text-center font-simpler text-[16px] font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-200">
                נזכיר לכם יומיים לפני שתקופת הניסיון נגמרת
              </p>
            </div>
          }
        />
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}
