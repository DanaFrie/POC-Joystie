'use client';

import { useState } from 'react';
import { LANDING_ASSETS, LANDING_HOW_STEPS } from '@/constants/landing-marketing';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingHowGlow } from '@/components/landing/LandingDecor';

/** Figma Story circle — white→#CDCDCD gradient frame + how-it-works-circle.webp */
function StepImage({ className = '' }: { className?: string }) {
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

function StepTabs({
  active,
  onSelect,
  layout,
}: {
  active: number;
  onSelect: (index: number) => void;
  layout: 'mobile' | 'desktop';
}) {
  const isMobile = layout === 'mobile';
  return (
    <div
      className={
        isMobile
          ? /* Full-bleed scroll; flex spacers (not padding) keep end chip borders visible in RTL */
            'flex w-[calc(100%+3rem)] max-w-none -mx-6 flex-row gap-2 overflow-x-auto v03-scroll-hidden'
          : 'flex w-auto min-w-[220px] flex-col gap-4'
      }
    >
      {isMobile ? <div className="w-6 shrink-0" aria-hidden /> : null}
      {LANDING_HOW_STEPS.map((item, index) => {
        const isActive = index === active;
        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => onSelect(index)}
            className={`shrink-0 rounded-full text-center font-rubik outline-none transition-none ${
              isMobile
                ? 'px-3 py-1.5 text-sm tracking-[-0.21px]'
                : 'px-7 py-2.5 text-[20px] tracking-[-0.3px]'
            } ${
              isActive
                ? 'bg-gradient-to-r from-[#e5e5e5] to-white font-bold text-[#05161a]'
                : 'border border-[#ebebeb] font-normal text-[#ebebeb] hover:bg-white/5'
            }`}
          >
            {item.tab}
          </button>
        );
      })}
      {/* RTL: last chip sits on the physical left — spacer must be after buttons in DOM */}
      {isMobile ? <div className="w-6 shrink-0" aria-hidden /> : null}
    </div>
  );
}

export function MarketingHowItWorks() {
  const [active, setActive] = useState(0);
  const step = LANDING_HOW_STEPS[active] ?? LANDING_HOW_STEPS[0];

  return (
    <section
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
              className="size-full max-w-none object-contain"
              draggable={false}
            />
          </div>
        </div>

        {/* Mobile header — Figma 15445:6168 */}
        <LandingReveal className="relative z-[1] mx-auto w-full max-w-[327px] text-right md:hidden">
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
          Mobile Story — Figma 15448:8826: overflow-clip crops ellipse at bottom border.
        */}
        <div className="relative w-full shrink-0 md:hidden">
          <div className="relative mx-auto flex h-[281px] w-full max-w-[375px] flex-col items-stretch overflow-hidden bg-[#05161a] px-6 pb-7">
            {/* Ellipse 209 — Figma 15448:8827 @ top 224.61, centered; clipped by Story overflow */}
            <div
              className="pointer-events-none absolute left-1/2 top-[224.61px] z-0 h-[246px] w-[245px] -translate-x-1/2"
              aria-hidden
            >
              <LandingHowGlow className="left-0 top-0 h-full w-full" />
            </div>

            <LandingReveal delayMs={160} className="relative z-[1] w-full">
              <div className="flex w-full flex-col gap-6">
                <StepTabs active={active} onSelect={setActive} layout="mobile" />
                <div
                  className="relative flex w-full items-start justify-between gap-[21px]"
                  dir="ltr"
                >
                  <div className="relative shrink-0">
                    <StepImage className="h-[119px] w-[119px]" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-4 text-right" dir="rtl">
                    <h3 className="font-rubik text-2xl font-bold leading-[1.15] tracking-[-0.72px] text-white">
                      {step.title}
                    </h3>
                    <p className="font-rubik text-sm leading-[1.25] tracking-[-0.28px] text-white/70">
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
                <StepTabs active={active} onSelect={setActive} layout="desktop" />
              </div>

              <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-6 text-right">
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
              className="pointer-events-none absolute left-[-22px] top-[25px] z-20 h-[254px] w-[254px]"
              aria-hidden
            >
              <StepImage className="h-full w-full" />
            </div>
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
