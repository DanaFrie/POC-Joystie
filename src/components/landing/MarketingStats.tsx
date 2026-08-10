'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  isLandingStatsStoryBypassed,
  onSkipLandingStatsStory,
} from '@/components/landing/landingStatsStory';

/** Dwell per word once the section is locked in view (desktop + mobile). */
const MS_PER_WORD = 180;

const HIGHLIGHT = '5 שעות ביום.';
const LINE1 = 'זה הזמן הממוצע שילדים במסך בשנת 2026, וזה רק הולך וגדל.';
const LINE2 = 'הגיע הזמן שנחזיר את הבחירה לידיים שלנו ושל הילדים שלנו.';

function wordsOf(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

/**
 * Unread: muted regular. Read: white bold.
 * Highlight line stays white; bold kicks in as words unlock.
 */
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
        const weightClass = lit ? 'font-bold' : 'font-normal';
        return (
          <span key={`${offset}-${i}-${word}`}>
            {i > 0 ? ' ' : null}
            <span
              className={`inline transition-[color,font-weight] duration-200 ease-out ${colorClass} ${weightClass}`}
            >
              {word}
            </span>
          </span>
        );
      })}
    </>
  );
}

/**
 * Section 2 — 100dvh pane + scroll locked while words auto-bold.
 * Scroll unlocks only after the reading finishes.
 *
 * Figma Frame 1597882750 (1200×308) visuals preserved.
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
  const startedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setActiveIndex(totalWords - 1);
      setPinEnabled(false);
      return;
    }

    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current) return;
        // Menu / hash jump — pass through without locking or auto-reading.
        if (isLandingStatsStoryBypassed()) {
          // Suppress this pass only; leave-observer clears so a later scroll can play.
          startedRef.current = true;
          return;
        }
        startedRef.current = true;
        el.scrollIntoView({ block: 'start', behavior: 'auto' });
        setActiveIndex(-1);
        setPlaying(true);
      },
      { threshold: 0.45, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [totalWords]);

  // Menu jump: unlock scroll lock; keep pass suppressed until section leaves view.
  useEffect(() => {
    return onSkipLandingStatsStory(() => {
      setPlaying(false);
      startedRef.current = true;
      document.documentElement.classList.remove('landing-stats-scroll-lock');
    });
  }, []);

  // Hard lock: landing uses overflow-y: auto !important — class + event block.
  useEffect(() => {
    if (!playing) return;

    const html = document.documentElement;
    const y = window.scrollY;
    html.classList.add('landing-stats-scroll-lock');

    const block = (event: Event) => {
      event.preventDefault();
    };
    const blockKeys = (event: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'];
      if (keys.includes(event.key)) event.preventDefault();
    };
    const pin = () => {
      if (window.scrollY !== y) window.scrollTo(0, y);
    };

    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });
    window.addEventListener('keydown', blockKeys);
    window.addEventListener('scroll', pin, { passive: true });

    return () => {
      html.classList.remove('landing-stats-scroll-lock');
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
      window.removeEventListener('keydown', blockKeys);
      window.removeEventListener('scroll', pin);
    };
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    if (activeIndex >= totalWords - 1) {
      setPlaying(false);
      return;
    }

    const id = window.setTimeout(() => {
      setActiveIndex((i) => Math.min(totalWords - 1, i + 1));
    }, MS_PER_WORD);
    return () => window.clearTimeout(id);
  }, [playing, activeIndex, totalWords]);

  // Reset after leaving — finished story or menu pass — so a later visit can play.
  useEffect(() => {
    if (playing || !startedRef.current) return;

    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) return;
        startedRef.current = false;
        setActiveIndex(-1);
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [playing, activeIndex, totalWords]);

  return (
    <section
      ref={sectionRef}
      className={`landing-section relative ${
        pinEnabled ? 'h-[100vh] h-[100dvh]' : ''
      }`}
    >
      <div
        className={`landing-gutter flex w-full flex-col justify-center overflow-visible ${
          pinEnabled
            ? 'min-h-[100vh] min-h-[100dvh] py-16'
            : 'min-h-[100vh] min-h-[100dvh] py-16 md:min-h-0 md:pt-[90px] md:pb-16 lg:pb-[298px]'
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
              className="relative mx-auto max-w-[850px] text-center font-rubik text-[24px] leading-[1.05] tracking-[-0.72px] text-white md:pt-[26px] md:text-[50px] md:tracking-[-1.5px]"
              aria-label={`${HIGHLIGHT} ${LINE1} ${LINE2}`}
            >
              {/* 5 שעות ביום. + Purple-700 #8D00FF (Figma Rectangle 6549) */}
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
          </div>
        </div>
      </div>
    </section>
  );
}
