'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CumulativeScreenTimeCard } from '@/components/onboarding/bad-news/CumulativeScreenTimeCard';
import { ChildStoryProgress } from '@/components/onboarding/bad-news/ChildStoryProgress';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_BAD_NEWS_HERO_FALLBACK,
  ONBOARDING_BAD_NEWS_HERO_IMAGE,
} from '@/constants/onboarding-figma';
import { getFunnelStackedFooterShellHeightPx } from '@/constants/funnel-vertical-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
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
const STORY_START_MS = 1000;

/** Figma @ 812 — gap between copy block and kids report. */
const COPY_REPORT_GAP_MAX_PX = 65;
/** Floor so short viewports still separate the two sections. */
const COPY_REPORT_GAP_MIN_PX = 20;
const TOP_PAD_MAX_PX = 30;
const TOP_PAD_MIN_PX = 10;
const HERO_MAX_PX = 150;
const HERO_MIN_PX = 112;

/**
 * Figma Screen 7 (12703:42214) — bad-news facts with story loader between
 * children. After the last card finishes, returns to the first card static
 * (no loader); chevrons allow optional manual browsing.
 */
export function OnboardingBadNewsStep() {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const footerH = getFunnelStackedFooterShellHeightPx();
  const mainBandPx = Math.max(1, usableCanvasHeightPx - footerH);
  const fullMainBandPx = V03_SCREEN_HEIGHT - footerH;
  const heightScale = Math.min(1, mainBandPx / fullMainBandPx);
  const topPadPx = Math.max(TOP_PAD_MIN_PX, Math.round(TOP_PAD_MAX_PX * heightScale));
  const copyReportGapPx = Math.max(
    COPY_REPORT_GAP_MIN_PX,
    Math.round(COPY_REPORT_GAP_MAX_PX * heightScale)
  );
  const heroSizePx = Math.max(HERO_MIN_PX, Math.round(HERO_MAX_PX * heightScale));
  const heroCopyGapPx = Math.max(4, Math.round(9 * heightScale));
  const headlineBodyGapPx = Math.max(8, Math.round(16 * heightScale));
  const reportStackGapPx = Math.max(8, Math.round(15 * heightScale));

  const [heroSrc, setHeroSrc] = useState<string>(ONBOARDING_BAD_NEWS_HERO_IMAGE);
  const [children, setChildren] = useState<ChildCumulativeProjection[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardOpaque, setCardOpaque] = useState(true);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyKey, setStoryKey] = useState(0);
  /** Auto story finished (or user took over) — no purple loader. */
  const [staticMode, setStaticMode] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setChildren(getChildCumulativeProjections());
  }, []);

  const child = children[activeIndex];
  const multiChild = children.length > 1;

  const goToIndex = useCallback(
    (nextIndex: number, opts?: { enterStatic?: boolean }) => {
      if (children.length < 1) return;
      const wrapped =
        ((nextIndex % children.length) + children.length) % children.length;
      if (wrapped === activeIndex && !opts?.enterStatic) return;

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      setCardOpaque(false);
      fadeTimerRef.current = setTimeout(() => {
        setActiveIndex(wrapped);
        setCardOpaque(true);
        setStoryProgress(0);
        if (opts?.enterStatic) {
          setStaticMode(true);
        }
        fadeTimerRef.current = null;
      }, CARD_FADE_MS);
    },
    [activeIndex, children.length]
  );

  const handlePrev = useCallback(() => {
    setStaticMode(true);
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  const handleNext = useCallback(() => {
    setStaticMode(true);
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  // Story fill 0→1; when done, advance — last card loops to first in static mode.
  useEffect(() => {
    if (children.length < 1 || staticMode) return;

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
          // Last card done → first card, static (no loader).
          setCardOpaque(false);
          fadeTimer = setTimeout(() => {
            if (cancelled) return;
            setActiveIndex(0);
            setCardOpaque(true);
            setStoryProgress(0);
            setStaticMode(true);
          }, CARD_FADE_MS);
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
  }, [children.length, storyKey, staticMode]); // eslint-disable-line react-hooks/exhaustive-deps -- storyKey driver

  useEffect(
    () => () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    },
    []
  );

  return (
    <section
      className="flex h-full min-h-0 w-full flex-1 flex-col items-center"
      aria-label="החדשות הפחות טובות"
    >
      <div
        className="flex h-full min-h-0 w-full flex-1 flex-col items-center pb-1"
        style={{ paddingTop: topPadPx }}
      >
        <div
          className="flex w-full shrink-0 flex-col items-center"
          style={{ gap: heroCopyGapPx }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt=""
            width={HERO_MAX_PX}
            height={HERO_MAX_PX}
            className="v03-funnel-enter-reveal-0 shrink-0 object-contain"
            style={{ width: heroSizePx, height: heroSizePx }}
            onError={() => {
              if (heroSrc !== ONBOARDING_BAD_NEWS_HERO_FALLBACK) {
                setHeroSrc(ONBOARDING_BAD_NEWS_HERO_FALLBACK);
              }
            }}
          />

          <div
            className="flex w-full flex-col items-center text-center"
            style={{ gap: headlineBodyGapPx }}
          >
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

        <div
          className="w-full"
          style={{
            height: copyReportGapPx,
            minHeight: COPY_REPORT_GAP_MIN_PX,
            maxHeight: COPY_REPORT_GAP_MAX_PX,
            flexShrink: 1,
          }}
          aria-hidden
        />

        <div
          className="flex w-full shrink-0 flex-col items-center"
          style={{ gap: reportStackGapPx }}
        >
          <div className="flex w-full flex-col items-center gap-[5px]">
            <p className="v03-funnel-enter-reveal-3 w-full text-center font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.4px] text-[#6d6d6d]">
              לפי החישוב, עד גיל 18:
            </p>

            <div className="v03-funnel-enter-reveal-4 w-full">
              {child ? (
                <div
                  className={`w-full transition-opacity duration-[420ms] ease-out ${
                    cardOpaque ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <CumulativeScreenTimeCard
                    child={child}
                    className="w-full"
                    showNav={multiChild}
                    canPrev={multiChild}
                    canNext={multiChild}
                    onPrev={handlePrev}
                    onNext={handleNext}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="v03-funnel-enter-reveal-5 flex w-full shrink-0 justify-center overflow-visible">
            <ChildStoryProgress
              count={children.length}
              activeIndex={activeIndex}
              progress={storyProgress}
              staticMode={staticMode}
            />
          </div>
        </div>

        <div className="min-h-0 w-full flex-1" aria-hidden />
      </div>
    </section>
  );
}
