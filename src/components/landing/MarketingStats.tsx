'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LandingReveal } from '@/components/landing/LandingReveal';

/** Reading pace — ~3 words/sec */
const WORD_MS = 320;
const START_DELAY_MS = 450;

const HIGHLIGHT = '5-6 שעות ביום.';
const LINE1 = 'זה הזמן הממוצע שילדים מבלים במסך בשנת 2026.';
const LINE2 =
  'בעידן שבו AI מעצב את הדרך שבה הילדים שלנו לומדים, היכולת לנהל קשב הופכת לאחת המיומניות החשובות ביותר.';

function wordsOf(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

/** Base: Blue-400 #527079 / Rubik 700. Active (reading): white. */
function ReadingWords({
  words,
  offset,
  activeIndex,
  tone = 'body',
}: {
  words: string[];
  offset: number;
  activeIndex: number;
  tone?: 'body' | 'highlight';
}) {
  return (
    <>
      {words.map((word, i) => {
        const index = offset + i;
        const lit = index <= activeIndex;
        const colorClass =
          tone === 'highlight'
            ? 'text-white'
            : lit
              ? 'text-white'
              : 'text-[#527079]';
        return (
          <span key={`${offset}-${i}-${word}`}>
            {i > 0 ? ' ' : null}
            <span className={`inline transition-colors duration-300 ease-out ${colorClass}`}>
              {word}
            </span>
          </span>
        );
      })}
    </>
  );
}

/**
 * Desktop — Figma Frame 1597882750 (1200×308):
 * Ellipse 400 @ left 431 / top 63 / 366²
 * Purple Rectangle 6549 @ 324×53 under highlight
 * 90px below hero blur (314px); 298px gap to Frame 1597882581
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

  const [activeIndex, setActiveIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const startReading = useCallback(() => {
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setActiveIndex(totalWords - 1);
      return;
    }

    let cancelled = false;
    let intervalId = 0;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      let word = 0;
      setActiveIndex(0);
      intervalId = window.setInterval(() => {
        word += 1;
        if (word >= totalWords) {
          window.clearInterval(intervalId);
          return;
        }
        setActiveIndex(word);
      }, WORD_MS);
    }, START_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [playing, totalWords]);

  return (
    <section
      /* 90px from hero blur → text; mobile 286px / desktop 298px to presenting frame */
      className="landing-section landing-gutter overflow-visible pt-[90px] pb-[286px] md:pb-16 lg:pb-[298px]"
    >
      <div className="relative mx-auto max-w-[341px] overflow-visible text-center md:max-w-[1200px] md:min-h-[308px]">
        {/*
          Ellipse 400 — Figma relative to 1200 parent:
          left 431 / top 63 / 366² / rgba(206,227,232,0.60) / blur(400px)
        */}
        <div
          className="pointer-events-none absolute z-0 h-[180px] w-[180px] rounded-[180px] bg-[rgba(206,227,232,0.6)] blur-[200px] left-1/2 top-[40px] -translate-x-1/2 md:left-[431px] md:top-[63px] md:h-[366px] md:w-[366px] md:translate-x-0 md:rounded-[366px] md:blur-[400px]"
          aria-hidden
        />
        <LandingReveal onVisible={startReading} className="landing-section-fg relative z-10">
          <div
            className="relative mx-auto max-w-[850px] text-center font-rubik text-[24px] font-bold leading-[1.05] tracking-[-0.72px] text-white md:pt-[26px] md:text-[50px] md:tracking-[-1.5px]"
            aria-label={`${HIGHLIGHT} ${LINE1} ${LINE2}`}
          >
            {/* 5-6 שעות ביום. + Purple-700 #8D00FF (Figma Rectangle 6549) */}
            <p className="relative z-10 mx-auto inline-block isolate">
              <span
                className="absolute left-1/2 top-1/2 z-0 h-[28px] w-[min(100%,210px)] -translate-x-1/2 -translate-y-1/2 bg-[#8D00FF] md:h-[53px] md:w-[324px]"
                aria-hidden
              />
              <span className="relative z-[1]">
                <ReadingWords
                  words={highlightWords}
                  offset={offsets.h}
                  activeIndex={activeIndex}
                  tone="highlight"
                />
              </span>
            </p>

            <p className="mt-1 md:mt-0">
              <ReadingWords
                words={line1Words}
                offset={offsets.l1}
                activeIndex={activeIndex}
              />
            </p>

            <p className="mt-5 md:mt-0 md:pt-[1.05em]">
              <ReadingWords
                words={line2Words}
                offset={offsets.l2}
                activeIndex={activeIndex}
              />
            </p>
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
