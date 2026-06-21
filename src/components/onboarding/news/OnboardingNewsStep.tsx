'use client';

import { useState } from 'react';
import { ONBOARDING_BLUR_FOOTER_RESERVE_CLASS } from '@/components/onboarding/OnboardingBlurFooter';
import {
  ONBOARDING_NEWS_HERO_FALLBACK,
  ONBOARDING_NEWS_HERO_IMAGE,
} from '@/constants/onboarding-figma';

const headlineClass =
  'w-full text-center font-simpler text-[30px] font-black leading-[34.5px] text-v03-text-on-light';

/** Good/bad news intro — staggered fade: icon → line 1 → line 2 (footer on page). */
export function OnboardingNewsStep() {
  const [heroSrc, setHeroSrc] = useState<string>(ONBOARDING_NEWS_HERO_IMAGE);

  return (
    <section
      className={`absolute inset-0 z-[10] flex flex-col items-center px-v03-gutter ${ONBOARDING_BLUR_FOOTER_RESERVE_CLASS}`}
      aria-label="חדשות טובות ופחות טובות"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[14px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt=""
          width={201}
          height={201}
          className="v03-funnel-enter-reveal-hero-intro h-[201px] w-[201px] shrink-0 object-contain"
          onError={() => {
            if (heroSrc !== ONBOARDING_NEWS_HERO_FALLBACK) {
              setHeroSrc(ONBOARDING_NEWS_HERO_FALLBACK);
            }
          }}
        />

        <div className="flex w-full max-w-v03-content flex-col items-center gap-[19px]">
          <div className="flex w-full flex-col items-center gap-1">
            <h1 className={`v03-funnel-enter-reveal-1 ${headlineClass}`}>
              אז... יש לנו חדשות טובות
            </h1>
            <p className={`v03-funnel-enter-reveal-2 ${headlineClass}`}>
              וחדשות פחות-טובות
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
