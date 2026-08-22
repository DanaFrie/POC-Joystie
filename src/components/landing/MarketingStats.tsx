'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const HIGHLIGHT = '5 שעות ביום.';
const LINE1 = 'זה הזמן הממוצע שילדים במסך בשנת 2026, וזה רק הולך וגדל.';
const LINE2 = 'הגיע הזמן שנחזיר את הבחירה לידיים שלנו ושל הילדים שלנו.';

/** Tall scrub range — sticky copy stays put while words light up with scroll. */
const SCRUB_VH = 220;

function wordsOf(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Unread: Blue-600 mobile / Blue-400 desktop, weight 700.
 * Read: white, weight 700. Progress driven by parent scroll index.
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
        const colorClass = lit
          ? 'text-white'
          : 'text-[#527079]';
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
 * Section 2 — sticky pane; words turn white as the user scrolls (no scroll lock).
 * Figma Frame 1597882750 typography preserved.
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
  /** Until scroll sync runs, keep copy readable (dark unread colors are invisible on #05161a). */
  const [scrollReady, setScrollReady] = useState(false);

  const totalWordsMinusOne = totalWords - 1;
  const displayIndex =
    scrollReady && !reduceMotion ? activeIndex : totalWordsMinusOne;
  const displayProgress = scrollReady && !reduceMotion ? progress : 1;

  const highlightCount = highlightWords.length;
  const highlightFill = reduceMotion
    ? 1
    : clamp(displayProgress * (totalWords / Math.max(highlightCount, 1)), 0, 1);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const reduce = mq.matches;
      setReduceMotion(reduce);
      if (reduce) {
        setActiveIndex(totalWords - 1);
        setProgress(1);
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
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
  }, [reduceMotion, totalWords]);

  return (
    <section
      ref={sectionRef}
      className="landing-section relative"
      style={reduceMotion ? undefined : { height: `${SCRUB_VH}vh` }}
    >
      <div
        className={`landing-gutter flex w-full flex-col justify-center ${
          reduceMotion
            ? 'min-h-[100svh] py-16 md:min-h-0 md:pt-[90px] md:pb-16 lg:pb-[298px]'
            : 'sticky top-0 h-[100svh] overflow-hidden py-10 sm:py-16'
        }`}
      >
        <div className="relative mx-auto w-full max-w-[341px] overflow-visible text-center md:max-w-[1200px] md:min-h-[308px]">
          {/*
            Ellipse 400 — Figma relative to 1200 parent:
            left 431 / top 63 / 366² / rgba(206,227,232,0.60) / blur(400px)
          */}
          <div
            className="pointer-events-none absolute z-0 h-[180px] w-[180px] rounded-[180px] bg-[rgba(206,227,232,0.6)] blur-[200px] left-1/2 top-[40px] -translate-x-1/2 md:left-[431px] md:top-[63px] md:h-[366px] md:w-[366px] md:translate-x-0 md:rounded-[366px] md:blur-[400px]"
            aria-hidden
          />
          <div className="landing-section-fg relative z-10">
            <div
              className="relative mx-auto max-w-[850px] text-center font-rubik text-[24px] font-bold leading-[1.2] tracking-[-0.72px] md:pt-[26px] md:text-[50px] md:leading-[1.05] md:tracking-[-1.5px]"
              aria-label={`${HIGHLIGHT} ${LINE1} ${LINE2}`}
            >
              {/* 5 שעות ביום. — purple highlighter hugs the text, fills RTL as you scrub */}
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
