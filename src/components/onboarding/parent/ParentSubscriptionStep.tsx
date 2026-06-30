'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { SelectableOptionCard } from '@/components/onboarding/parent/SelectableOptionCard';
import { SubscriptionJoystieLogo } from '@/components/onboarding/parent/SubscriptionJoystieLogo';
import {
  ONBOARDING_SUBSCRIPTION,
  ONBOARDING_SUBSCRIPTION_FEATURES,
  ONBOARDING_SUBSCRIPTION_FEATURE_CHECK,
  ONBOARDING_SUBSCRIPTION_PLANS,
  type OnboardingSubscriptionPlan,
} from '@/constants/onboarding-subscription-layout';
import { ONBOARDING_SELECTABLE_OPTION } from '@/constants/onboarding-selectable-option';

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
  const { hero } = layout;

  const heroBackground = `${hero.gradient}, url(${hero.image}) lightgray ${hero.imagePosition} / ${hero.imageSize} no-repeat`;

  return (
    <div dir="rtl" className="relative h-full w-full overflow-x-hidden bg-v03-green-900">
      <div
        className="pointer-events-none absolute left-0 w-full overflow-visible"
        style={{
          top: hero.top,
          height: hero.height,
        }}
        aria-hidden
      >
        <div
          className="absolute left-0 top-0 z-[1]"
          style={{
            width: hero.width,
            height: hero.height,
            background: heroBackground,
          }}
        />

        <div
          className="absolute z-[2]"
          style={{
            top: hero.ellipse.top,
            left: hero.ellipse.left,
            width: hero.ellipse.width,
            height: hero.ellipse.height,
            borderRadius: hero.ellipse.borderRadius,
            background: hero.ellipse.color,
            filter: `blur(${hero.ellipse.blur}px)`,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute left-1/2 z-[5] -translate-x-1/2"
        style={{
          top: layout.logo.top,
          width: layout.logo.width,
          height: layout.logo.height,
        }}
        aria-hidden
      >
        <SubscriptionJoystieLogo className="h-full w-full" />
      </div>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="absolute left-[13px] top-[26px] z-[60] flex items-center rounded-full bg-white/30 p-[6px] backdrop-blur-[10px]"
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
        className="absolute z-[10] flex flex-col items-center"
        style={{
          left: layout.copy.left,
          top: layout.copy.top,
          width: layout.copy.width,
          gap: layout.copy.gap,
        }}
      >
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
          className="flex w-full flex-col items-stretch rounded-[16.145px] bg-white/[0.08] backdrop-blur-[6px]"
          style={{ padding: layout.features.padding, gap: layout.features.gap }}
        >
          {ONBOARDING_SUBSCRIPTION_FEATURES.map((feature) => (
            <div key={feature.label} className="flex w-full items-center gap-2">
              <div
                className="flex min-w-0 flex-1 items-center gap-2"
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
        className="absolute z-[10] flex flex-col"
        style={{
          left: layout.plans.left,
          top: layout.plans.top,
          width: layout.plans.width,
          gap: layout.plans.gap,
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
              textLayout="fixed"
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

      <div
        className="absolute z-[10] flex flex-col items-center"
        style={{
          left: layout.cta.left,
          top: layout.cta.top,
          width: layout.cta.width,
          gap: layout.cta.gap,
        }}
      >
        <button
          type="button"
          disabled={selectedPlan === null}
          onClick={onContinue}
          className={ONBOARDING_SELECTABLE_OPTION.primaryCtaClass}
        >
          התחלת 30 ימים ניסיון בחינם
        </button>
        <p className="w-full text-center font-simpler text-[16px] font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-200">
          נזכיר לכם יומיים לפני שתקופת הניסיון נגמרת
        </p>
      </div>
    </div>
  );
}
