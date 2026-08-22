'use client';

import { useEffect, useRef, useState } from 'react';
import { LANDING_ASSETS, LANDING_HOW_STEPS } from '@/constants/landing-marketing';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingHowGlow } from '@/components/landing/LandingDecor';

/** Story dwell per step — active badge fills turquoise, then advances. */
const STORY_MS = 8000;

const CARD_GRAD =
  'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(205, 205, 205) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%)';

const STATS_GRAD =
  'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(205, 205, 205) 100%), linear-gradient(90deg, rgba(5, 22, 26, 0.3) 0%, rgba(5, 22, 26, 0.3) 100%)';

/** Figma Story circle — white→#CDCDCD gradient frame + how-it-works-circle.webp */
function StepCircle({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative z-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-white to-[#cdcdcd] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LANDING_ASSETS.howItWorksCircle}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
    </div>
  );
}

/** Capsule 2 — Figma 15143:1261 stacked screen-time slider cards */
function GoalsFrame({ className = '' }: { className?: string }) {
  return (
    <div className={`relative shrink-0 ${className}`} aria-hidden>
      {/* Back card — offset stack */}
      <div
        className="absolute left-[11px] top-[11px] flex w-[261px] flex-col items-center justify-center gap-[14px] overflow-hidden rounded-[18px] border border-white/25 px-[17px] pb-[13px] pt-[15px] shadow-[2px_2px_14px_rgba(0,0,0,0.08)]"
        style={{ backgroundImage: CARD_GRAD }}
      >
        <GoalsSliderContent />
      </div>
      {/* Front card */}
      <div
        className="relative z-10 flex w-[261px] flex-col items-center justify-center gap-[14px] overflow-hidden rounded-[17px] border border-white/25 px-[17px] pb-[13px] pt-[15px] shadow-[2px_2px_14px_rgba(0,0,0,0.08)]"
        style={{ backgroundImage: CARD_GRAD }}
      >
        <GoalsSliderContent />
      </div>
    </div>
  );
}

function GoalsSliderContent() {
  return (
    <>
      <div className="flex w-full items-center justify-between" dir="rtl">
        <p className="font-rubik text-[23px] font-bold leading-[29px] tracking-[-0.35px] text-[#05161a]">
          אלון
        </p>
        <p className="font-rubik text-[19px] font-normal leading-[1.2] tracking-[-0.29px] text-[#05161a]">
          40 דקות
        </p>
      </div>
      <div className="relative w-full">
        <div className="relative mb-[-10px] h-5 w-full">
          {/* Track */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_ASSETS.howItWorksSliderTrack}
            alt=""
            className="absolute left-0 right-0 top-1/2 h-[8px] w-full -translate-y-1/2"
            draggable={false}
          />
          {/* Teal fill (~40/360) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_ASSETS.howItWorksSliderFill}
            alt=""
            className="absolute left-0 top-[calc(50%-2px)] h-[4px] w-[28px] -translate-y-1/2"
            draggable={false}
          />
          {/* Thumb */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_ASSETS.howItWorksSliderThumb}
            alt=""
            className="absolute left-[20px] top-[-1px] size-5"
            draggable={false}
          />
        </div>
        <div className="flex w-full items-start justify-between font-rubik text-[15px] leading-[29px] text-[#05161a]">
          <span>0</span>
          <span>360</span>
        </div>
      </div>
    </>
  );
}

/** Capsule 3 — Figma 15099:1172 stacked daily-average stats cards */
function HabitsFrame({ className = '' }: { className?: string }) {
  return (
    <div className={`relative shrink-0 ${className}`} aria-hidden>
      {/* Back card */}
      <div
        className="absolute left-[11px] top-[11px] flex w-[247px] flex-col items-center justify-center rounded-[33px] border border-white py-5"
        style={{ backgroundImage: STATS_GRAD }}
      >
        <HabitsStatsContent muted />
      </div>
      {/* Front card */}
      <div
        className="relative z-10 flex w-[247px] flex-col items-center justify-center rounded-[33px] border border-[#f2f2f2] py-5 shadow-[2px_2px_6px_rgba(0,0,0,0.25)]"
        style={{ backgroundImage: STATS_GRAD }}
      >
        <HabitsStatsContent />
      </div>
    </div>
  );
}

function HabitsStatsContent({ muted = false }: { muted?: boolean }) {
  return (
    <div className="flex w-full flex-col items-center gap-[11px] px-4">
      <p className="whitespace-nowrap text-center font-rubik text-[14px] font-normal leading-[19px] tracking-[-0.29px] text-[#8d9495]">
        ממוצע דק׳ יומי של אלון
      </p>
      <div className="relative flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <p className="whitespace-nowrap font-rubik text-[35px] font-bold leading-[41px] text-[#05161a]">
            52 דק׳
          </p>
          {!muted ? (
            <div className="absolute -left-6 top-3 size-[18px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LANDING_ASSETS.howItWorksCheckBg}
                alt=""
                className="absolute inset-0 size-full"
                draggable={false}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LANDING_ASSETS.howItWorksCheckTick}
                alt=""
                className="absolute left-[15%] right-[11%] top-[2px] h-[60%] w-[74%]"
                draggable={false}
              />
            </div>
          ) : null}
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-[9px] px-1.5 pb-0.5 pt-[3px] ${
            muted ? 'bg-[#172a2c] opacity-40' : 'bg-[#1becae]'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_ASSETS.howItWorksTrendArrow}
            alt=""
            className={`size-4 ${muted ? 'brightness-0 invert' : ''}`}
            draggable={false}
          />
          <p
            className={`whitespace-nowrap text-center font-rubik text-[13px] font-normal leading-[1.3] ${
              muted ? 'text-white' : 'text-[#05161a]'
            }`}
          >
            15%- ביחס לשבוע שעבר
          </p>
        </div>
      </div>
    </div>
  );
}

function StepVisual({
  step,
  layout,
}: {
  step: number;
  layout: 'mobile' | 'desktop';
}) {
  if (step === 1) {
    return (
      <GoalsFrame
        className={
          layout === 'mobile'
            ? 'origin-center scale-[0.55] sm:scale-[0.65]'
            : 'origin-center scale-[0.92]'
        }
      />
    );
  }
  if (step === 2) {
    return (
      <HabitsFrame
        className={
          layout === 'mobile'
            ? 'origin-center scale-[0.55] sm:scale-[0.65]'
            : 'origin-center scale-[0.92]'
        }
      />
    );
  }
  return (
    <StepCircle
      className={
        layout === 'mobile' ? 'h-[100px] w-[100px] sm:h-[119px] sm:w-[119px]' : 'h-full w-full'
      }
    />
  );
}

/** Step capsules — clickable story tabs; active one fills turquoise over STORY_MS. */
function StepBadges({
  active,
  layout,
  progress,
  onSelect,
}: {
  active: number;
  layout: 'mobile' | 'desktop';
  /** 0–1 fill on the active badge */
  progress: number;
  onSelect: (index: number) => void;
}) {
  const isMobile = layout === 'mobile';
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Horizontal-only: scroll the badge row, never the page (text/image stay put).
  useEffect(() => {
    if (!isMobile) return;
    const el = activeRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const elCenter = elRect.left + elRect.width / 2;
    const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;
    const delta = elCenter - scrollerCenter;
    if (Math.abs(delta) < 4) return;

    scroller.scrollBy({ left: delta, behavior: 'smooth' });
  }, [active, isMobile]);

  return (
    <div
      ref={scrollerRef}
      className={
        isMobile
          ? /* Full-bleed scroll; flex spacers keep end chip borders visible in RTL */
            'flex w-full flex-row gap-2 overflow-x-auto v03-scroll-hidden'
          : 'flex w-auto min-w-[220px] flex-col gap-4'
      }
      role="tablist"
      aria-label="שלבי התהליך"
    >
      {isMobile ? <div className="w-6 shrink-0" aria-hidden /> : null}
      {LANDING_HOW_STEPS.map((item, index) => {
        const isActive = index === active;
        return (
          <button
            key={item.tab}
            type="button"
            ref={isActive ? activeRef : undefined}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(index)}
            className={`relative shrink-0 overflow-hidden rounded-full text-center font-rubik transition-[border-color,background-color,color] duration-300 ${
              isMobile
                ? 'px-3 py-1.5 text-sm tracking-[-0.21px]'
                : 'px-7 py-2.5 text-[20px] tracking-[-0.3px]'
            } ${
              isActive
                ? /* Light chip from the start so label stays readable over the fill */
                  'border border-[#00ffb3] bg-white font-bold text-[#05161a]'
                : 'border border-[#ebebeb] bg-transparent font-normal text-[#ebebeb] hover:border-[#00ffb3]/60 hover:text-white'
            }`}
          >
            {isActive ? (
              <span
                className="pointer-events-none absolute inset-y-0 start-0 z-0 bg-[#00ffb3]"
                style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
                aria-hidden
              />
            ) : null}
            <span className="relative z-10">{item.tab}</span>
          </button>
        );
      })}
      {isMobile ? <div className="w-6 shrink-0" aria-hidden /> : null}
    </div>
  );
}

export function MarketingHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const startedRef = useRef(false);
  const [active, setActive] = useState(0);
  const [storyKey, setStoryKey] = useState(0);
  const [storyPlaying, setStoryPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const step = LANDING_HOW_STEPS[active] ?? LANDING_HOW_STEPS[0];

  const selectStep = (index: number) => {
    if (index === active) {
      // Restart fill timer on re-tap of the current step.
      setStoryKey((k) => k + 1);
      return;
    }
    startedRef.current = true;
    setActive(index);
    setStoryKey((k) => k + 1);
    setStoryPlaying(true);
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          setStoryPlaying(false);
          return;
        }
        setStoryPlaying(true);
        if (!startedRef.current) {
          startedRef.current = true;
          setActive(0);
          setStoryKey((k) => k + 1);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Turquoise fill 0→1 over STORY_MS, then advance step.
  useEffect(() => {
    if (!storyPlaying) {
      setProgress(0);
      return;
    }

    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    setProgress(0);

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / STORY_MS);
      setProgress(t);
      if (t < 1) {
        raf = window.requestAnimationFrame(tick);
        return;
      }
      setActive((i) => (i + 1) % LANDING_HOW_STEPS.length);
      setStoryKey((k) => k + 1);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [storyPlaying, storyKey]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="landing-section landing-gutter-md relative py-12 md:py-24"
    >
      {/*
        Frame 1597882715 / 15445:6167 — column, center, gap 30, stretch.
        Story (15448:8826) overflow-clips Ellipse 209 at the frame bottom;
        anything past that sits behind the next section (science).
      */}
      <div className="relative mx-auto flex w-full max-w-[1004px] flex-col items-center gap-[30px] self-stretch md:gap-12">
        {/* Desktop Ellipse 208 — Figma right 19.672 / bottom −34.57; clipped by section flow under science */}
        <div
          className="pointer-events-none absolute z-0 hidden h-[309.328px] w-[309.328px] md:block"
          style={{ right: 19.672, bottom: -34.57 }}
          aria-hidden
        >
          <div className="absolute inset-[-60%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/figma/ellipse-how.svg"
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full max-w-none object-contain"
              draggable={false}
            />
          </div>
        </div>

        {/* Mobile header — same px-6 as story copy below */}
        <LandingReveal className="relative z-[1] w-full px-6 text-right md:hidden">
          <h2 className="font-rubik text-[30px] font-bold leading-[1.15] tracking-[-0.9px] text-white">
            איך עובד התהליך איתנו?
          </h2>
          <p className="mt-2 font-rubik text-base leading-[1.28] tracking-[-0.32px] text-[#abbec3]">
            נלווה אתכם בכל שלב עד שתצליחו לשלב את ההרגלים החדשים בחיי הילדים
          </p>
        </LandingReveal>

        {/* Desktop header */}
        <LandingReveal className="relative z-[1] hidden w-full text-center md:block">
          <h2 className="whitespace-nowrap bg-gradient-to-b from-[#efefef] from-[10%] to-[#d1d1d1] to-[94%] bg-clip-text font-rubik text-[40px] font-bold leading-[1.1] tracking-[-0.9px] text-transparent lg:text-[45px]">
            איך עובד התהליך עם ג׳ויסטי?
          </h2>
          <p className="mx-auto mt-2 max-w-[431px] font-rubik text-[20px] leading-[1.33] tracking-[-0.3px] text-white">
            נלווה אתכם בכל שלב עד שתצליחו לשלב את ההרגלים החדשים בחיי הילדים
          </p>
        </LandingReveal>

        {/*
          Mobile Story — full-bleed past the 1004 column (no side margins);
          ellipse clipped at frame bottom.
        */}
        <div className="relative left-1/2 w-screen max-w-[100vw] shrink-0 -translate-x-1/2 md:hidden">
          {/*
            Figma story is 281px @ 375-wide; on SE/320 text wraps taller —
            grow with content + extra bottom pad so copy isn’t flush to the frame.
          */}
          <div className="relative flex min-h-[300px] w-full flex-col items-stretch overflow-hidden bg-[#05161a] pb-10 pt-1">
            {/* Ellipse 209 — Figma 15448:8827 @ top 224.61, centered; clipped by Story overflow */}
            <div
              className="pointer-events-none absolute left-1/2 top-[224.61px] z-0 h-[246px] w-[245px] -translate-x-1/2"
              aria-hidden
            >
              <LandingHowGlow className="left-0 top-0 h-full w-full" />
            </div>

            <LandingReveal delayMs={160} className="relative z-[1] w-full">
              <div className="flex w-full flex-col gap-5 sm:gap-6">
                <StepBadges
                  active={active}
                  layout="mobile"
                  progress={progress}
                  onSelect={selectStep}
                />
                <div
                  key={active}
                  className="relative flex w-full items-center justify-between gap-4 px-6 pb-2 landing-step-swap sm:gap-[21px]"
                  dir="ltr"
                >
                  <div className="relative flex h-[119px] w-[140px] shrink-0 items-center justify-center sm:w-[160px]">
                    <StepVisual step={active} layout="mobile" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 text-right sm:gap-4" dir="rtl">
                    <h3 className="font-rubik text-[22px] font-bold leading-[1.15] tracking-[-0.66px] text-white sm:text-2xl sm:tracking-[-0.72px]">
                      {step.title}
                    </h3>
                    <p className="font-rubik text-sm leading-[1.35] tracking-[-0.28px] text-white/70">
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
            </LandingReveal>
          </div>
        </div>

        {/* Desktop Story — circle @ top 25 / left −22, outside card so it bleeds past the dashed border */}
        <LandingReveal delayMs={80} className="relative z-[1] hidden w-full overflow-visible md:block">
          <div className="relative w-full overflow-visible">
            <div
              className="relative flex h-[304px] w-full flex-row items-center gap-5 overflow-visible rounded-[50px] border border-dashed border-[#505050] bg-[rgba(1,21,24,0.5)] py-6 pe-[230px] ps-[46px]"
              dir="rtl"
            >
              <div className="relative z-10 shrink-0">
                <StepBadges
                  active={active}
                  layout="desktop"
                  progress={progress}
                  onSelect={selectStep}
                />
              </div>

              <div
                key={active}
                className="relative z-10 flex min-w-0 flex-1 flex-col gap-6 text-right landing-step-swap"
              >
                <h3 className="font-rubik text-[36px] font-bold leading-[1.1] tracking-[-1.08px] text-white">
                  {step.title}
                </h3>
                <p className="font-rubik text-[20px] leading-[1.2] tracking-[-0.4px] text-white">
                  {step.body}
                </p>
              </div>
            </div>

            {/* Sibling of dashed card — not clipped by story overflow/border */}
            <div
              className={`pointer-events-none absolute z-20 flex items-center justify-center ${
                active === 0
                  ? 'left-[-22px] top-[25px] h-[254px] w-[254px]'
                  : 'left-[-40px] top-1/2 h-auto w-[280px] -translate-y-1/2'
              }`}
              aria-hidden
            >
              <StepVisual step={active} layout="desktop" />
            </div>
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
