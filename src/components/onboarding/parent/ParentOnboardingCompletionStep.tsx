'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import {
  ONBOARDING_COMPLETION,
  ONBOARDING_COMPLETION_CHECK_IMAGE,
  ONBOARDING_COMPLETION_IMAGE,
} from '@/constants/onboarding-completion-layout';

/** Figma 13057:16567 — parent onboarding completion (Screen 66). */
export function ParentOnboardingCompletionStep() {
  const layout = ONBOARDING_COMPLETION;

  return (
    <section
      className="absolute left-1/2 z-[10] flex -translate-x-1/2 flex-col items-center"
      style={{
        top: layout.content.top,
        width: layout.content.width,
        gap: layout.content.gap,
      }}
      aria-label="סיום ההרשמה"
    >
      <div
        className="flex w-full flex-col items-center"
        style={{ gap: layout.header.gap }}
      >
        <div
          className="relative shrink-0"
          style={{ width: layout.check.size, height: layout.check.size }}
        >
          <OnboardingLazyImage
            src={ONBOARDING_COMPLETION_CHECK_IMAGE}
            alt=""
            className="size-full object-contain"
            priority
          />
        </div>

        <div className="flex w-full flex-col items-center text-center text-v03-turquoise-950">
          <p
            className="w-full font-simpler font-normal"
            style={{
              fontSize: layout.title.fontSize,
              lineHeight: `${layout.title.lineHeight}px`,
              letterSpacing: `${layout.title.letterSpacing}px`,
            }}
          >
            כל הכבוד!
          </p>
          <h1
            className="w-full font-simpler font-black"
            style={{
              fontSize: layout.headline.fontSize,
              lineHeight: layout.headline.lineHeight,
              letterSpacing: `${layout.headline.letterSpacing}px`,
            }}
          >
            התחלתם את המסע שלכם עם ג׳ויסטי!
          </h1>
        </div>
      </div>

      <div
        className="relative shrink-0"
        style={{
          width: layout.hero.width,
          height: layout.hero.height,
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D9D9D9]/60"
          style={{
            width: layout.hero.glowSize,
            height: layout.hero.glowSize,
          }}
          aria-hidden
        />
        <OnboardingLazyImage
          src={ONBOARDING_COMPLETION_IMAGE}
          alt="משפחה עם דורי הדרקון"
          className="absolute inset-0 size-full object-cover"
          priority
        />
      </div>
    </section>
  );
}
