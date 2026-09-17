'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { getLandingUi } from '@/constants/landing-i18n';
import { MarketingCtaButton } from '@/components/landing/MarketingCtaButton';
import { useLandingLocale } from '@/components/landing/LandingLocaleContext';

/** EN desktop — sit text higher in the sky above phone/coins */
const DESKTOP_HERO_TOP_EN = 120;
/** HE desktop — main text frame top */
const DESKTOP_HERO_TOP_HE = 165;
/** Skip top of hero art so the viewport starts at this image Y (desktop). */
const DESKTOP_HERO_IMAGE_TOP_CROP_PX = 73;

/** Figma “גוללים למטה” — decorative cue only (not tappable). */
function HeroScrollCue({
  label,
  size,
}: {
  label: string;
  size: 'mobile' | 'desktop';
}) {
  const mobile = size === 'mobile';
  return (
    <div
      className="pointer-events-none inline-flex flex-col items-center"
      aria-hidden
    >
      <span
        className={`text-center font-rubik font-normal text-white/60 ${
          mobile ? 'text-sm leading-[17.5px]' : 'text-lg leading-[22.5px]'
        }`}
      >
        {label}
      </span>
      {/* Chevron tip down — outline turquoise #00FFB3 */}
      <span className="landing-scroll-cue-bob relative mt-0.5 flex h-6 w-6 items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
        >
          <path
            d="M8 10L12 14L16 10"
            stroke="#00FFB3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

export function MarketingHero() {
  const locale = useLandingLocale();
  const ui = getLandingUi(locale);
  const isEn = locale === 'en';

  return (
    <section
      className="relative lg:h-[100dvh] lg:min-h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden"
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div className="landing-hero-bg pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <picture className="absolute inset-0 block h-full w-full overflow-hidden">
          <source media="(min-width: 1024px)" srcSet={LANDING_ASSETS.heroDesktop} type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_ASSETS.heroMobile}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover object-[center_40%] lg:absolute lg:left-0 lg:w-full lg:object-cover lg:object-top lg:top-[calc(var(--desktop-hero-crop)*-1)] lg:h-[calc(100%+var(--desktop-hero-crop))]"
            style={
              {
                ['--desktop-hero-crop']: `${DESKTOP_HERO_IMAGE_TOP_CROP_PX}px`,
              } as CSSProperties
            }
            sizes="100vw"
          />
        </picture>
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent to-[#05161a] lg:hidden" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[314px] lg:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,22,26,0) 0%, rgba(5,22,26,0.55) 45%, #05161a 100%)',
          }}
          aria-hidden
        />
      </div>

      {/* Mobile */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[327px] flex-col items-center gap-10 px-0 pb-20 pt-[calc(93px+env(safe-area-inset-top))] text-center lg:hidden">
        <div className="relative flex w-full flex-col items-center gap-[39px]">
          <div className="flex w-full flex-col items-center gap-[30px]">
            <div className="flex w-full flex-col items-center gap-3 self-stretch">
              <p
                className={`landing-hero-item landing-hero-item--1 w-full self-stretch text-center font-rubik font-normal leading-[1.25] text-[rgba(237,239,239,0.45)] ${
                  isEn
                    ? 'text-[13px] tracking-[3.9px]'
                    : 'text-[14px] tracking-[5.32px]'
                }`}
              >
                {ui.heroEyebrow}
              </p>
              <div className="landing-hero-item landing-hero-item--2">
                <h1
                  className={`relative text-center font-rubik text-white [text-shadow:2px_2px_10px_rgba(0,0,0,0.1)] ${
                    isEn
                      ? 'mx-auto w-max origin-center scale-x-[0.78] text-[52px] font-extrabold leading-[54.6px] tracking-[-1.56px]'
                      : 'w-full self-stretch text-[40px] font-bold leading-[1.1] tracking-[-1.2px]'
                  }`}
                >
                {isEn ? (
                  <>
                    <span className="block text-center whitespace-nowrap">
                      {ui.heroTitleLine1}
                    </span>
                    <span className="block text-center whitespace-nowrap">
                      <span className="relative">
                        {ui.heroTitleMobileUnderline}
                        <Image
                          src={LANDING_ASSETS.heroUnderlineMobile}
                          alt=""
                          width={280}
                          height={28}
                          className="pointer-events-none absolute left-1/2 top-[calc(100%-2px)] z-[1] h-[22px] w-[280px] max-w-none -translate-x-1/2"
                          unoptimized
                        />
                      </span>{' '}
                      {ui.heroTitleMobileLine2After}
                    </span>
                  </>
                ) : (
                  <>
                    {ui.heroTitleLine1}
                    <br />
                    <span className="relative inline-block">
                      {ui.heroTitleUnderline}
                      <Image
                        src={LANDING_ASSETS.heroUnderlineMobile}
                        alt=""
                        width={144}
                        height={20}
                        className="pointer-events-none absolute left-1/2 top-[calc(100%-1px)] z-[1] h-5 w-[144px] max-w-none -translate-x-1/2"
                        unoptimized
                      />
                    </span>{' '}
                    {ui.heroTitleLine2After}
                  </>
                )}
              </h1>
              </div>
            </div>
            <p
              className={`landing-hero-item landing-hero-item--3 w-full self-stretch text-center font-rubik font-normal ${
                isEn
                  ? 'text-[16px] leading-[1.28] tracking-[-0.48px] text-[#d1edf4]'
                  : 'text-[18px] leading-[1.25] tracking-[-0.36px] text-[#d1edf4]'
              }`}
            >
              {ui.heroBodyMobile}
            </p>
          </div>
          {/* HE RTL: Learn more right / Join left · EN LTR: Learn more left / Join right */}
          <div className="landing-hero-item landing-hero-item--4 flex flex-row items-center justify-center gap-[7px]">
            <a
              href="#what-is-joystie"
              className={`inline-flex h-[46px] shrink-0 items-center justify-center rounded-2xl border border-white bg-[rgba(255,255,255,0.10)] px-[22px] py-[11px] font-rubik text-base font-bold leading-[1.28] text-white shadow-[2px_2px_20px_rgba(0,0,0,0.05)] backdrop-blur-[10px] transition-colors duration-500 ease-out hover:bg-white/20 ${
                isEn ? 'tracking-[-0.64px]' : 'tracking-[-0.32px]'
              }`}
            >
              {ui.heroLearnMore}
            </a>
            <MarketingCtaButton href="/onboarding" label={ui.joinJoystie} size="mobile" />
          </div>
        </div>

        {/* Figma ~ top 710 / left 150 on 375 — bottom-center of first viewport */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 justify-center">
          <div className="landing-hero-item landing-hero-item--5">
            <HeroScrollCue label={ui.scrollExplore} size="mobile" />
          </div>
        </div>
      </div>

      {/* Desktop — one viewport tall so scroll cue stays visible */}
      <div
        className="relative z-10 mx-auto hidden h-full min-h-0 w-full max-w-[1200px] flex-col items-center landing-gutter pb-12 text-center lg:flex"
        style={{ paddingTop: isEn ? DESKTOP_HERO_TOP_EN : DESKTOP_HERO_TOP_HE }}
      >
        <div className="flex w-full max-w-[900px] flex-col items-center gap-8">
          {isEn ? (
            <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-8 text-center">
              <div className="flex h-[194px] w-[638px] max-w-full flex-col items-center justify-center gap-[13px]">
                <div className="landing-hero-item landing-hero-item--1 inline-flex items-center justify-center gap-2.5 px-[13px] py-[3px]">
                  <p className="text-center font-rubik text-[16px] font-normal leading-[16.8px] tracking-[4.96px] text-[#01639C]">
                    {ui.heroEyebrow}
                  </p>
                </div>
                <div className="landing-hero-item landing-hero-item--2 flex w-full justify-center">
                  <h1
                    className="inline-flex origin-center scale-x-[0.86] flex-col items-center text-center font-rubik text-[75px] leading-[78.75px] text-[#06171B]"
                    style={{ fontWeight: 760 }}
                  >
                    <span className="whitespace-nowrap">{ui.heroTitleLine1}</span>
                    <span className="whitespace-nowrap">
                      <span className="relative">
                        {ui.heroTitleUnderline}
                        <Image
                          src={LANDING_ASSETS.heroUnderline}
                          alt=""
                          width={320}
                          height={28}
                          className="pointer-events-none absolute left-1/2 top-[calc(100%-2px)] z-[1] h-7 w-[320px] max-w-none -translate-x-1/2"
                          unoptimized
                        />
                      </span>{' '}
                      {ui.heroTitleLine2After}
                    </span>
                  </h1>
                </div>
              </div>
              <p className="landing-hero-item landing-hero-item--3 inline-flex max-w-none flex-col items-center text-center font-rubik text-[22px] font-normal leading-[25.3px] text-[rgba(6,23,27,0.80)]">
                <span className="whitespace-nowrap">{ui.heroBodyDesktopL1}</span>
                <span className="whitespace-nowrap">{ui.heroBodyDesktopL2}</span>
              </p>
            </div>
          ) : (
            <>
              <div className="flex w-full flex-col items-center gap-[13px]">
                <p className="landing-hero-item landing-hero-item--1 font-rubik text-[20px] tracking-[6.2px] text-[#01639c]">
                  {ui.heroEyebrow}
                </p>
                <h1 className="landing-hero-item landing-hero-item--2 relative text-center font-rubik text-[65px] font-bold leading-[1.05] tracking-[-1.95px] text-[#05161a]">
                  {ui.heroTitleLine1}
                  <br />
                  <span className="relative inline-block">
                    {ui.heroTitleUnderline}
                    <Image
                      src={LANDING_ASSETS.heroUnderline}
                      alt=""
                      width={247}
                      height={27}
                      className="pointer-events-none absolute left-1/2 top-[calc(100%-4px)] z-[1] w-[247px] max-w-none -translate-x-1/2"
                      unoptimized
                    />
                  </span>{' '}
                  {ui.heroTitleLine2After}
                </h1>
              </div>
              <p className="landing-hero-item landing-hero-item--3 max-w-[638px] font-rubik text-2xl leading-[1.35] tracking-[-0.72px] text-[#2f2f2f]">
                {ui.heroBodyDesktop}
              </p>
            </>
          )}

          <div className="landing-hero-item landing-hero-item--4 flex flex-row items-center justify-center gap-8">
            <MarketingCtaButton href="/onboarding" label={ui.joinJoystie} />
            <a
              href="#what-is-joystie"
              className="inline-flex flex-row items-center gap-3 font-rubik text-lg font-bold tracking-[-0.36px] text-[#05161a] transition-opacity duration-500 ease-out hover:opacity-70"
            >
              {ui.heroLearnMoreDesktop}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="6"
                height="11"
                viewBox="0 0 6 11"
                fill="none"
                className={`h-[9px] w-[4.5px] shrink-0 ${isEn ? 'rotate-180' : ''}`}
                aria-hidden
              >
                <path
                  d="M5.25037 9.7506L0.750067 5.2503L5.25037 0.75"
                  stroke="#05161A"
                  strokeWidth="1.5001"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Figma ~ top 940 / left 922 — bottom-center of desktop hero */}
        <div className="pointer-events-none absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 justify-center">
          <div className="landing-hero-item landing-hero-item--5">
            <HeroScrollCue label={ui.scrollExplore} size="desktop" />
          </div>
        </div>
      </div>
    </section>
  );
}
