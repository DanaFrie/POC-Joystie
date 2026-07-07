'use client';

import { useEffect, useState } from 'react';
import { CumulativeScreenTimeCard } from '@/components/onboarding/bad-news/CumulativeScreenTimeCard';
import { ChildCarouselDots } from '@/components/onboarding/bad-news/ChildCarouselDots';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_BAD_NEWS_HERO_FALLBACK,
  ONBOARDING_BAD_NEWS_HERO_IMAGE,
} from '@/constants/onboarding-figma';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  getChildCumulativeProjections,
  type ChildCumulativeProjection,
} from '@/lib/onboarding/cumulativeScreenTime';

const CARD_HOLD_MS = 3200;
const CARD_FADE_MS = 720;
/** After seq-4 delay + duration before first auto-advance */
const CAROUSEL_START_MS = 600 + 720 + 400;

const headlineClass =
  'w-full text-center font-simpler text-[30px] font-black leading-[34.5px] text-v03-text-on-light';

/** Figma @ 812 — scales down on short viewports so dots stay above the footer. */
const BAD_NEWS_HERO_PX = 150;
const BAD_NEWS_SECTION_GAP_PX = 24;
const BAD_NEWS_CARD_BLOCK_GAP_PX = 10;
const BAD_NEWS_DOTS_BOTTOM_PAD_PX = 20;

export function OnboardingBadNewsStep() {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const vhScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const heroPx = Math.max(120, Math.round(BAD_NEWS_HERO_PX * vhScale));
  const sectionGapPx = Math.max(16, Math.round(BAD_NEWS_SECTION_GAP_PX * vhScale));
  const cardBlockGapPx = Math.max(8, Math.round(BAD_NEWS_CARD_BLOCK_GAP_PX * vhScale));
  const dotsBottomPadPx = Math.max(12, Math.round(BAD_NEWS_DOTS_BOTTOM_PAD_PX * vhScale));

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
      className="flex h-full min-h-0 w-full flex-col items-center px-v03-gutter"
      aria-label="החדשות הפחות טובות"
    >
      <div
        className="flex min-h-0 w-full max-w-v03-content flex-1 flex-col items-center justify-start py-2"
        style={{ gap: sectionGapPx, paddingBottom: dotsBottomPadPx }}
      >
        <div className="flex w-full shrink-0 flex-col items-center gap-[9px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            width={heroPx}
            height={heroPx}
            className="v03-funnel-enter-reveal-0 shrink-0 object-contain"
            style={{ width: heroPx, height: heroPx }}
            onError={() => {
              if (heroSrc !== ONBOARDING_BAD_NEWS_HERO_FALLBACK) {
                setHeroSrc(ONBOARDING_BAD_NEWS_HERO_FALLBACK);
              }
            }}
          />

          <div className="flex w-full flex-col items-end gap-4">
            <h1 className={`v03-funnel-enter-reveal-1 ${headlineClass}`}>
              החדשות הפחות טובות הן:
            </h1>
            <p className="v03-funnel-enter-reveal-2 w-full text-center font-simpler text-[20px] font-normal leading-6 text-v03-text-on-light">
              כמו אצל הרבה משפחות,
              <br />
              המסך תופס <span className="font-bold">חלק גדול</span> מהזמן של
              הילדים.
            </p>
          </div>
        </div>

        <div
          className="flex w-full shrink-0 flex-col items-center"
          style={{ gap: cardBlockGapPx }}
        >
          <p className="v03-funnel-enter-reveal-3 w-full text-center font-simpler text-[20px] font-normal leading-6 text-[#6d6d6d]">
            לפי החישוב, עד גיל 18:
          </p>

          <div className="v03-funnel-enter-reveal-4 flex w-full flex-col gap-[17px]">
            {child && (
              <div
                className={`transition-opacity duration-[720ms] ease-out ${
                  cardOpaque ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <CumulativeScreenTimeCard child={child} />
              </div>
            )}
          </div>

          <div className="v03-funnel-enter-reveal-5 flex w-full shrink-0 justify-center overflow-visible py-1">
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
