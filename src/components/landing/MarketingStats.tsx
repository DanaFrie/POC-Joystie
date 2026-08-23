'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LandingStatsGlow } from '@/components/landing/LandingDecor';

const HIGHLIGHT = '5 שעות ביום.';
const LINE1 = 'זה הזמן הממוצע שילדים במסך בשנת 2026, וזה רק הולך וגדל.';
const LINE2 = 'הגיע הזמן שנחזיר את הבחירה לידיים שלנו ושל הילדים שלנו.';

/** Scroll distance while copy stays pinned at 100svh (mobile / desktop). */
const SCRUB_VH_MOBILE = 200;
const SCRUB_VH_DESKTOP = 220;

function wordsOf(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Unread: muted teal. Read: white.
 * Progress driven by sticky-scrub scroll index.
 */
function ReadingWords({
  words,
  offset,
  activeIndex,
}: {
  words: string[];
  offset: number;
  activeIndex: number;
}) {
  return (
    <>
      {words.map((word, i) => {
        const index = offset + i;
        const lit = index <= activeIndex;
        const colorClass = lit ? 'text-white' : 'text-[#527079]';
        return (
          <span key={`${offset}-${i}-${word}`}>
            {i > 0 ? ' ' : null}
            <span className={`inline font-bold transition-colors duration-150 ease-out ${colorClass}`}>
              {word}
            </span>
          </span>
        );
      })}
    </>
  );
}

/**
 * Section 2 — sticky 100svh pane; words turn white as the user scrolls (mobile + desktop).
 * Ellipse uses pre-blurred SVG (no CSS filter:blur) so iOS Safari stays responsive.
 */
export function MarketingStats() {
  const highlightWords = useMemo(() => wordsOf(HIGHLIGHT), []);
  const line1Words = useMemo(() => wordsOf(LINE1), []);
  const line2Words = useMemo(() => wordsOf(LINE2), []);

  const totalWords = highlightWords.length + line1Words.length + line2Words.length;

  const offsets = useMemo(
    () => ({
      h: 0,
      l1: highlightWords.length,
      l2: highlightWords.length + line1Words.length,
    }),
    [highlightWords.length, line1Words.length],
  );

  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  /** Until scroll sync runs, keep copy readable. */
  const [scrollReady, setScrollReady] = useState(false);
  const [scrubVh, setScrubVh] = useState(SCRUB_VH_MOBILE);

  const totalWordsMinusOne = totalWords - 1;
  const scrubEnabled = !reduceMotion;
  const displayIndex =
    scrollReady && scrubEnabled ? activeIndex : totalWordsMinusOne;
  const displayProgress = scrollReady && scrubEnabled ? progress : 1;

  const highlightCount = highlightWords.length;
  const highlightFill = scrubEnabled
    ? clamp(displayProgress * (totalWords / Math.max(highlightCount, 1)), 0, 1)
    : 1;

  useEffect(() => {
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqDesktop = window.matchMedia('(min-width: 768px)');

    const sync = () => {
      const reduce = mqReduce.matches;
      setReduceMotion(reduce);
      setScrubVh(mqDesktop.matches ? SCRUB_VH_DESKTOP : SCRUB_VH_MOBILE);
      if (reduce) {
        setActiveIndex(totalWords - 1);
        setProgress(1);
        setScrollReady(true);
      }
    };

    sync();
    mqReduce.addEventListener('change', sync);
    mqDesktop.addEventListener('change', sync);
    return () => {
      mqReduce.removeEventListener('change', sync);
      mqDesktop.removeEventListener('change', sync);
    };
  }, [totalWords]);

  useEffect(() => {
    if (reduceMotion) return;

    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setActiveIndex(totalWords - 1);
        setProgress(1);
        return;
      }
      const scrolled = clamp(-rect.top, 0, scrollable);
      const nextProgress = scrolled / scrollable;
      const index =
        nextProgress <= 0
          ? -1
          : nextProgress >= 1
            ? totalWords - 1
            : Math.min(totalWords - 1, Math.floor(nextProgress * totalWords));
      setProgress(nextProgress);
      setActiveIndex(index);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    setScrollReady(true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduceMotion, totalWords, scrubVh]);

  return (
    <section
      ref={sectionRef}
      className="landing-section relative"
      style={scrubEnabled ? { height: `${scrubVh}vh` } : undefined}
    >
      <div
        className={
          scrubEnabled
            ? 'landing-gutter sticky top-0 flex h-[100svh] w-full flex-col justify-center overflow-hidden py-10 sm:py-16'
            : 'landing-gutter flex min-h-[100svh] w-full flex-col justify-center py-16 md:min-h-0 md:pt-[90px] md:pb-16 lg:pb-[298px]'
        }
      >
        <div className="relative mx-auto w-full max-w-[341px] overflow-visible text-center md:max-w-[1200px] md:min-h-[308px]">
          <LandingStatsGlow />
          <div className="landing-section-fg relative z-10">
            <div
              className="relative mx-auto max-w-[850px] text-center font-rubik text-[24px] font-bold leading-[1.2] tracking-[-0.72px] md:pt-[26px] md:text-[50px] md:leading-[1.05] md:tracking-[-1.5px]"
              aria-label={`${HIGHLIGHT} ${LINE1} ${LINE2}`}
            >
              <p className="relative z-10 mx-auto inline-block isolate">
                <span className="relative inline-block">
                  <span
                    className="absolute inset-0 z-0 bg-[#8D00FF]"
                    style={{
                      transform: `scaleX(${highlightFill})`,
                      transformOrigin: 'right center',
                    }}
                    aria-hidden
                  />
                  <span className="relative z-[1]">
                    <ReadingWords
                      words={highlightWords}
                      offset={offsets.h}
                      activeIndex={displayIndex}
                    />
                  </span>
                </span>
              </p>

              <p className="mt-1 md:mt-0">
                <ReadingWords
                  words={line1Words}
                  offset={offsets.l1}
                  activeIndex={displayIndex}
                />
              </p>

              <p className="mt-5 md:mt-0 md:pt-[1.05em]">
                <ReadingWords
                  words={line2Words}
                  offset={offsets.l2}
                  activeIndex={displayIndex}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
