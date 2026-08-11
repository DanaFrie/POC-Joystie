'use client';

import { useEffect, useState } from 'react';
import { CumulativeScreenTimeCard } from '@/components/onboarding/bad-news/CumulativeScreenTimeCard';
import { ChildStoryProgress } from '@/components/onboarding/bad-news/ChildStoryProgress';
import {
  ONBOARDING_BAD_NEWS_HERO_FALLBACK,
  ONBOARDING_BAD_NEWS_HERO_IMAGE,
} from '@/constants/onboarding-figma';
import {
  getChildCumulativeProjections,
  type ChildCumulativeProjection,
} from '@/lib/onboarding/cumulativeScreenTime';
import {
  REVEAL_BODY_CLASS,
  REVEAL_HEADLINE_CLASS,
} from '@/constants/reveal-typography';

/** How long each child card is held before auto-advance (story fill duration). */
const CARD_HOLD_MS = 3200;
const CARD_FADE_MS = 420;
/** After staggered reveal enters, start the story timer. */
const STORY_START_MS = 600 + 720 + 200;

/**
 * Figma Screen 7 (12703:42214) — bad-news facts with story loader between
 * children; fills the 100vh main band above the pinned footer.
 */
export function OnboardingBadNewsStep() {
  const [heroSrc, setHeroSrc] = useState<string>(ONBOARDING_BAD_NEWS_HERO_IMAGE);
  const [children, setChildren] = useState<ChildCumulativeProjection[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardOpaque, setCardOpaque] = useState(true);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyKey, setStoryKey] = useState(0);

  useEffect(() => {
    setChildren(getChildCumulativeProjections());
  }, []);

  const child = children[activeIndex];

  // Story fill 0→1; when done, active loader becomes ellipse and next becomes loader.
  useEffect(() => {
    if (children.length < 1) return;

    let cancelled = false;
    let raf = 0;
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const index = activeIndex;

    const runFill = () => {
      const startedAt = performance.now();
      setStoryProgress(0);

      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - startedAt) / CARD_HOLD_MS);
        setStoryProgress(t);
        if (t < 1) {
          raf = requestAnimationFrame(tick);
          return;
        }

        if (index >= children.length - 1) {
          setStoryProgress(1);
          return;
        }

        setCardOpaque(false);
        fadeTimer = setTimeout(() => {
          if (cancelled) return;
          setActiveIndex(index + 1);
          setCardOpaque(true);
          setStoryKey((k) => k + 1);
        }, CARD_FADE_MS);
      };

      raf = requestAnimationFrame(tick);
    };

    startTimer = setTimeout(runFill, storyKey === 0 ? STORY_START_MS : 0);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(fadeTimer);
      cancelAnimationFrame(raf);
    };
  }, [children.length, storyKey]); // eslint-disable-line react-hooks/exhaustive-deps -- storyKey driver

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col items-center px-v03-gutter"
      aria-label="החדשות הפחות טובות"
    >
      <div className="flex h-full min-h-0 w-full max-w-[337px] flex-1 flex-col items-center justify-between gap-[65px] pb-1 pt-[30px]">
        <div className="flex w-full max-w-v03-content shrink-0 flex-col items-center gap-[9px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            width={150}
            height={150}
            className="v03-funnel-enter-reveal-0 size-[150px] shrink-0 object-contain"
            onError={() => {
              if (heroSrc !== ONBOARDING_BAD_NEWS_HERO_FALLBACK) {
                setHeroSrc(ONBOARDING_BAD_NEWS_HERO_FALLBACK);
              }
            }}
          />

          <div className="flex w-full flex-col items-center gap-4 text-center">
            <h1 className={`v03-funnel-enter-reveal-1 ${REVEAL_HEADLINE_CLASS}`}>
              החדשות הפחות טובות הן:
            </h1>
            <p className={`v03-funnel-enter-reveal-2 ${REVEAL_BODY_CLASS}`}>
              כמו אצל הרבה משפחות,
              <br />
              המסך תופס <span className="font-bold tracking-[-0.4px]">חלק גדול</span>{' '}
              מהזמן של הילדים.
            </p>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-[15px]">
          <div className="flex w-full flex-col items-center gap-[5px]">
            <p className="v03-funnel-enter-reveal-3 w-full text-center font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.4px] text-[#6d6d6d]">
              לפי החישוב, עד גיל 18:
            </p>

            <div className="v03-funnel-enter-reveal-4 w-full">
              {child ? (
                <div
                  className={`transition-opacity duration-[420ms] ease-out ${
                    cardOpaque ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <CumulativeScreenTimeCard child={child} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="v03-funnel-enter-reveal-5 flex w-full shrink-0 justify-center overflow-visible">
            <ChildStoryProgress
              count={children.length}
              activeIndex={activeIndex}
              progress={storyProgress}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
