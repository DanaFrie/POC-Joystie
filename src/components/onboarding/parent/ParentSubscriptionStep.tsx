'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { SelectableOptionCard } from '@/components/onboarding/parent/SelectableOptionCard';
import { SubscriptionJoyLogo } from '@/components/onboarding/parent/SubscriptionJoyLogo';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import {
  useFunnelFullBleed,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_SUBSCRIPTION,
  ONBOARDING_SUBSCRIPTION_FEATURES,
  ONBOARDING_SUBSCRIPTION_FEATURE_CHECK,
  ONBOARDING_SUBSCRIPTION_PLANS,
  type OnboardingSubscriptionPlan,
} from '@/constants/onboarding-subscription-layout';
import { ONBOARDING_SELECTABLE_OPTION } from '@/constants/onboarding-selectable-option';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

type ParentSubscriptionStepProps = {
  selectedPlan: OnboardingSubscriptionPlan | null;
  onPlanChange: (plan: OnboardingSubscriptionPlan) => void;
  onContinue?: () => void;
  onClose?: () => void;
};

const CTA_DISCLAIMER_LINE_H_PX = 22;

/** Figma 13277:11554 — subscription / trial gate (Screen 78/79). */
export function ParentSubscriptionStep({
  selectedPlan,
  onPlanChange,
  onContinue,
  onClose,
}: ParentSubscriptionStepProps) {
  const layout = ONBOARDING_SUBSCRIPTION;
  const { hero, logo, logoEllipse } = layout;
  const bleedStyle = useFunnelFullBleed();
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const layoutScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const compactScale = Math.min(1, layoutScale + (layoutScale < 0.92 ? 0.02 : 0));
  const heroHeightPx = Math.round(hero.height * compactScale);
  const copyTopPx = Math.round(layout.copy.top * layoutScale);
  const closeTopPx = Math.round(26 * layoutScale);
  const contentWidth = layout.copy.width;
  const sectionGap = Math.max(8, Math.round(12 * layoutScale));

  const ctaShellHeightPx =
    5 +
    15 +
    layout.cta.button.height +
    layout.cta.gap +
    CTA_DISCLAIMER_LINE_H_PX +
    34;

  const heroBackground = `${hero.gradient}, url(${hero.image}) lightgray ${hero.imagePosition} / ${hero.imageSize} no-repeat`;

  return (
    <FunnelStepRoot fitViewport className="relative overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
        <div className="bg-v03-green-900" style={bleedStyle} />
      </div>

      <div
        className="pointer-events-none absolute left-0 top-0 z-[1] w-full overflow-visible"
        style={{ height: heroHeightPx }}
        aria-hidden
      >
        <div
          className="absolute left-0 top-0 z-[1] w-full"
          style={{
            height: heroHeightPx,
            background: heroBackground,
          }}
        />

        <div
          className="absolute z-[2]"
          style={{
            top: hero.ellipse.top * compactScale,
            left: hero.ellipse.left * compactScale,
            width: hero.ellipse.width * compactScale,
            height: hero.ellipse.height * compactScale,
            borderRadius: hero.ellipse.borderRadius * compactScale,
            background: hero.ellipse.color,
            filter: `blur(${hero.ellipse.blur * compactScale}px)`,
          }}
        />

        <div
          className="pointer-events-none absolute z-[3] -translate-x-1/2 rounded-full"
          style={{
            top: logoEllipse.top * layoutScale,
            left: '50%',
            width: logoEllipse.width * layoutScale,
            height: logoEllipse.height * layoutScale,
            background: logoEllipse.fill,
            filter: `blur(${logoEllipse.blur * layoutScale}px)`,
          }}
          aria-hidden
        />

        <div
          className="pointer-events-none absolute z-[5] -translate-x-1/2"
          style={{
            top: logo.top * layoutScale,
            left: '50%',
            width: logo.width * layoutScale,
            height: logo.height * layoutScale,
          }}
        >
          <SubscriptionJoyLogo className="h-full w-full" />
        </div>
      </div>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="absolute left-[13px] z-[60] flex items-center rounded-full bg-white/30 p-[6px] backdrop-blur-[10px]"
          style={{ top: closeTopPx }}
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

      <div
        className="absolute left-1/2 z-[10] flex -translate-x-1/2 flex-col"
        style={{
          top: copyTopPx,
          bottom: ctaShellHeightPx,
          width: contentWidth,
          gap: sectionGap,
        }}
      >
        <div className="flex w-full shrink-0 flex-col" style={{ gap: layout.copy.gap }}>
          <div
            className="flex w-full flex-col items-center"
            style={{ gap: layout.copy.headlineGap }}
          >
            <h1
              className="w-full text-center font-simpler text-[30px] font-black leading-[1.1] tracking-[-0.6px] text-white"
              style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.3)' }}
            >
              הצטרפו למשפחות שכבר מנהלות את המסכים נכון
            </h1>
            <p className="w-full text-center font-simpler text-[16px] font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-100">
              יחד נייצר הרגלים דיגיטליים בריאים - ללא מאבקים
            </p>
          </div>

          <div
            className="flex w-full shrink-0 flex-col items-stretch rounded-[16.145px] bg-white/[0.08] backdrop-blur-[6px]"
            style={{
              padding: layout.features.padding,
              gap: layout.features.gap,
            }}
          >
            {ONBOARDING_SUBSCRIPTION_FEATURES.map((feature) => (
              <div key={feature.label} className="flex w-full items-center gap-2">
                <div
                  className="flex min-w-0 flex-1 items-center"
                  style={{ gap: layout.features.rowGap }}
                >
                  <OnboardingLazyImage
                    src={feature.icon}
                    alt=""
                    className="shrink-0 object-contain"
                    style={{
                      width: layout.features.iconSize,
                      height: layout.features.iconSize,
                    }}
                  />
                  <p className="flex-1 text-right font-simpler text-[18px] font-normal leading-[1.25] tracking-[-0.27px] text-v03-green-100">
                    {feature.label}
                  </p>
                </div>
                <OnboardingLazyImage
                  src={ONBOARDING_SUBSCRIPTION_FEATURE_CHECK}
                  alt=""
                  className="shrink-0 object-contain"
                  style={{
                    width: layout.features.checkSize,
                    height: layout.features.checkSize,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-auto flex w-full shrink-0 flex-col items-start"
          style={{ gap: layout.plans.gap }}
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
                borderRadius={layout.planCard.radius}
                paddingX={layout.planCard.paddingX}
                paddingY={layout.planCard.paddingY}
                contentGap={layout.planCard.gap}
              >
                <p className="w-full text-right font-simpler text-[20px] font-bold leading-[1.2] tracking-[-0.3px] text-white">
                  {option.title}
                </p>
                <p className="w-full text-right font-simpler text-[16px] font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-200">
                  {option.price}
                </p>
              </SelectableOptionCard>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[10] flex w-full flex-col items-center gap-[5px]">
        <div className="flex w-full max-w-[375px] flex-col items-center justify-end gap-[15px] self-stretch">
          <div
            className="flex flex-col items-start gap-[6px]"
            style={{ width: layout.cta.width }}
          >
            <button
              type="button"
              disabled={selectedPlan === null}
              onClick={onContinue}
              className={`${ONBOARDING_SELECTABLE_OPTION.primaryCtaClass} shrink-0`}
              style={{
                width: layout.cta.width,
                height: layout.cta.button.height,
                padding: `${layout.cta.button.paddingY}px ${layout.cta.button.paddingX}px`,
                gap: layout.cta.button.gap,
              }}
            >
              התחלת 30 ימים ניסיון בחינם
            </button>
            <p className="w-full text-center font-simpler text-[16px] font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-200">
              נזכיר לכם יומיים לפני שתקופת הניסיון נגמרת
            </p>
          </div>
        </div>
        <div
          className="w-full shrink-0"
          style={{ height: 'max(34px, env(safe-area-inset-bottom, 0px))' }}
          aria-hidden
        />
      </div>
    </FunnelStepRoot>
  );
}
