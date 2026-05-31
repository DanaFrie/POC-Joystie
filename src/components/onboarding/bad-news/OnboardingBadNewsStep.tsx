'use client';

import { useEffect, useState } from 'react';
import { CumulativeScreenTimeCard } from '@/components/onboarding/bad-news/CumulativeScreenTimeCard';
import { ChildCarouselDots } from '@/components/onboarding/bad-news/ChildCarouselDots';
import { ONBOARDING_BLUR_FOOTER_RESERVE_CLASS } from '@/components/onboarding/OnboardingBlurFooter';
import {
  ONBOARDING_BAD_NEWS_HERO_FALLBACK,
  ONBOARDING_BAD_NEWS_HERO_IMAGE,
} from '@/constants/onboarding-figma';
import {
  getChildCumulativeProjections,
  type ChildCumulativeProjection,
} from '@/lib/onboarding/cumulativeScreenTime';

const CARD_HOLD_MS = 3200;
const CARD_FADE_MS = 352;
/** After seq-4 delay + duration before first auto-advance */
const CAROUSEL_START_MS = 616 + 352 + 400;

const headlineClass =
  'w-full text-center font-simpler text-[30px] font-black leading-[34.5px] text-v03-text-on-light';

export function OnboardingBadNewsStep() {
  const [heroSrc, setHeroSrc] = useState<string>(ONBOARDING_BAD_NEWS_HERO_IMAGE);
  const [children, setChildren] = useState<ChildCumulativeProjection[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardOpaque, setCardOpaque] = useState(true);

  useEffect(() => {
    setChildren(getChildCumulativeProjections());
  }, []);

  const child = children[activeIndex];

  useEffect(() => {
    if (children.length <= 1) return;

    let cancelled = false;
    let startTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;
    let fadeTimer: ReturnType<typeof setTimeout>;

    const scheduleAdvance = (index: number) => {
      if (cancelled || index >= children.length - 1) return;

      holdTimer = setTimeout(() => {
        if (cancelled) return;
        setCardOpaque(false);
        fadeTimer = setTimeout(() => {
          if (cancelled) return;
          const next = index + 1;
          setActiveIndex(next);
          setCardOpaque(true);
          scheduleAdvance(next);
        }, CARD_FADE_MS);
      }, CARD_HOLD_MS);
    };

    startTimer = setTimeout(() => scheduleAdvance(0), CAROUSEL_START_MS);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  }, [children.length]);

  return (
    <section
      className={`absolute inset-x-0 top-0 z-[10] flex flex-col items-center overflow-y-auto px-v03-gutter v03-scroll-hidden ${ONBOARDING_BLUR_FOOTER_RESERVE_CLASS}`}
      aria-label="החדשות הפחות טובות"
    >
      <div className="flex w-full max-w-v03-content flex-col items-center gap-[65px] pb-6 pt-[72px]">
        <div className="flex w-full flex-col items-center gap-[9px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            width={150}
            height={150}
            className="v03-fade-in-seq-0 h-[150px] w-[150px] shrink-0 object-contain"
            onError={() => {
              if (heroSrc !== ONBOARDING_BAD_NEWS_HERO_FALLBACK) {
                setHeroSrc(ONBOARDING_BAD_NEWS_HERO_FALLBACK);
              }
            }}
          />

          <div className="flex w-full flex-col items-end gap-4">
            <h1 className={`v03-fade-in-seq-1 ${headlineClass}`}>
              החדשות הפחות טובות הן:
            </h1>
            <p className="v03-fade-in-seq-2 w-full text-center font-simpler text-[20px] font-normal leading-6 text-v03-text-on-light">
              כמו אצל הרבה משפחות,
              <br />
              המסך תופס <span className="font-bold">חלק גדול</span> מהזמן של
              הילדים.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-[10px]">
          <p className="v03-fade-in-seq-3 w-full text-center font-simpler text-[20px] font-normal leading-6 text-[#6d6d6d]">
            לפי החישוב, עד גיל 18:
          </p>

          <div className="v03-fade-in-seq-4 flex w-full flex-col gap-[17px]">
            {child && (
              <div
                className={`transition-opacity duration-[352ms] ease-out ${
                  cardOpaque ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <CumulativeScreenTimeCard child={child} />
              </div>
            )}
          </div>

          <div className="v03-fade-in-seq-5 flex w-full justify-center">
            <ChildCarouselDots
              count={children.length}
              activeIndex={activeIndex}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
