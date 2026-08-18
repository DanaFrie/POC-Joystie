'use client';

import { useState } from 'react';
import {
  ONBOARDING_NEWS_HERO_FALLBACK,
  ONBOARDING_NEWS_HERO_IMAGE,
} from '@/constants/onboarding-figma';
import { REVEAL_HEADLINE_CLASS } from '@/constants/reveal-typography';

/** Good/bad news intro — staggered fade: icon → line 1 → line 2 (footer on page). */
export function OnboardingNewsStep() {
  const [heroSrc, setHeroSrc] = useState<string>(ONBOARDING_NEWS_HERO_IMAGE);

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col items-center overflow-hidden px-v03-gutter"
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
            <h1 className={`v03-funnel-enter-reveal-1 ${REVEAL_HEADLINE_CLASS}`}>
              אז... יש לנו חדשות טובות
            </h1>
            <p className={`v03-funnel-enter-reveal-2 ${REVEAL_HEADLINE_CLASS}`}>
              וחדשות פחות-טובות
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
