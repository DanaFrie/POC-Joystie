'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { TrackAnalyticsEvent } from '@/components/analytics/TrackAnalyticsEvent';
import {
  CONSULTANT_ASSETS,
  CONSULTANT_FAQ,
  CONSULTANT_OFFERS,
  CONSULTANT_PAGE,
  CONSULTANT_STORIES,
  type ConsultantFaqId,
  type ConsultantOffer,
  type ConsultantOfferId,
} from '@/constants/consultant-marketing';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import {
  LandingLocaleProvider,
  landingHomePath,
  type LandingLocale,
} from '@/components/landing/LandingLocaleContext';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { ConsultantOfferCard } from '@/components/consultant/ConsultantOfferCard';
import {
  PurpleChevronIcon,
  consultantCtaLabelClass,
  consultantCtaShellClass,
} from '@/components/consultant/ConsultantChevronCta';
import { AnalyticsEvents, logEvent } from '@/utils/analytics';

const STORIES_AUTOPLAY_MS = 5500;

function BookingCta({
  offerId,
  size = 'desktop',
}: {
  offerId: ConsultantOfferId;
  size?: 'desktop' | 'mobile';
}) {
  const isMobile = size === 'mobile';
  const offer = CONSULTANT_OFFERS.find((o) => o.id === offerId);
  const href = offer?.calendarBookingHref;
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      className={consultantCtaShellClass(isMobile ? 'mobile' : 'desktop')}
      onClick={() => {
        void logEvent(AnalyticsEvents.CLICK_CONSULTANT_PURCHASE, {
          offer_id: offerId,
        });
      }}
    >
      <PurpleChevronIcon size={isMobile ? 28 : 32} />
      <span className={consultantCtaLabelClass(isMobile ? 'mobile' : 'desktop')}>
        <span dir="rtl">{CONSULTANT_PAGE.ctaLabel}</span>
      </span>
    </a>
  );
}

function OfferCard({
  offer,
  size = 'desktop',
}: {
  offer: ConsultantOffer;
  size?: 'desktop' | 'mobile';
}) {
  return (
    <ConsultantOfferCard
      offer={offer}
      size={size}
      action={<BookingCta offerId={offer.id} size={size} />}
    />
  );
}

function MeirBanner({ size = 'desktop' }: { size?: 'desktop' | 'mobile' }) {
  const isMobile = size === 'mobile';
  return (
    <div
      className={`flex w-full items-start gap-6 backdrop-blur-[7.5px] ${
        isMobile
          ? 'rounded-[24px] bg-white/5 px-5 py-[15px]'
          : 'rounded-[24px] bg-white/10 p-[30px]'
      }`}
    >
      {/* RTL: photo first = right (Figma). Explicit px size so avatar can't collapse. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CONSULTANT_ASSETS.meirCircle}
        alt="מאיר ניצן"
        width={76}
        height={76}
        className="h-[76px] w-[76px] shrink-0 rounded-full object-cover object-[center_20%] ring-1 ring-white/25"
        draggable={false}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-right">
        {isMobile ? (
          <>
            <p className="font-rubik text-[14px] font-normal leading-[1.25] tracking-[-0.28px] text-[#ABBEC3]">
              {CONSULTANT_PAGE.meirEyebrow}
            </p>
            <p className="font-rubik text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-white">
              {CONSULTANT_PAGE.meirTitle}
            </p>
          </>
        ) : (
          <p className="font-rubik text-[24px] font-bold leading-[1.17] tracking-[-0.72px] text-white">
            {CONSULTANT_PAGE.meirTitleDesktop}
          </p>
        )}
        <p
          className={`font-rubik font-normal text-[#BCC8CB] ${
            isMobile
              ? 'text-[14px] leading-[1.25] tracking-[-0.28px]'
              : 'text-[20px] leading-[1.17] tracking-[-0.6px]'
          }`}
        >
          {CONSULTANT_PAGE.meirBio}
        </p>
      </div>
    </div>
  );
}

function StoriesCarousel() {
  const [index, setIndex] = useState(0);
  const story = CONSULTANT_STORIES[index] ?? CONSULTANT_STORIES[0];
  const count = CONSULTANT_STORIES.length;

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  function goTo(next: number) {
    setIndex(((next % count) + count) % count);
  }

  /* Auto-advance; chevrons / dots also change slide */
  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, STORIES_AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, index]);

  return (
    /* Figma 16348:17096 — quote left, image + dots on the right */
    <div className="flex w-full items-start gap-5 py-2.5" dir="ltr">
      <div
        className="flex min-w-0 flex-1 flex-col gap-5 text-right"
        dir="rtl"
      >
        <p className="whitespace-pre-wrap font-rubik text-[16px] font-normal italic leading-[1.17] tracking-[-0.48px] text-[#BCC8CB]">
          {story.quote}
        </p>
        <p className="font-rubik text-[16px] font-bold leading-[1.17] tracking-[-0.48px] text-white">
          {story.attribution}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-5">
        <div className="h-[120px] w-[120px] overflow-hidden rounded-[14px] bg-[#d9d9d9] md:h-[162px] md:w-[162px] md:rounded-[17px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={story.image}
            src={story.image}
            alt=""
            width={162}
            height={162}
            className={`block h-full w-full object-cover ${
              story.image.includes('hall')
                ? 'object-[70%_40%]'
                : 'object-center'
            }`}
            draggable={false}
          />
        </div>
        <div className="flex items-center justify-center gap-4 md:gap-5">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex size-6 shrink-0 items-center justify-center text-white transition hover:text-white/80"
            aria-label="הקודם"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
              <path
                d="M7 1L1 7L7 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div
            className="flex items-center gap-[10px]"
            role="tablist"
            aria-label="משפחות מספרות"
          >
            {CONSULTANT_STORIES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`סיפור ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-[10px] w-[10px] shrink-0 rounded-full border-0 p-0 transition ${
                  i === index ? 'bg-[#8C00FF]' : 'bg-white'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex size-6 shrink-0 items-center justify-center text-white transition hover:text-white/80"
            aria-label="הבא"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
              <path
                d="M1 1L7 7L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const FAQ_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

function FaqAccordion({
  size = 'desktop',
}: {
  size?: 'desktop' | 'mobile';
}) {
  const [openId, setOpenId] = useState<ConsultantFaqId | null>(null);
  const isMobile = size === 'mobile';

  return (
    <div className="flex w-full flex-col">
      {CONSULTANT_FAQ.map((item) => {
        const open = openId === item.id;
        const title =
          isMobile && item.titleMobile ? item.titleMobile : item.title;
        return (
          <div
            key={item.id}
            className="border-b border-[#2B3A3D] backdrop-blur-[7.5px]"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-[25px] py-5 text-right"
              aria-expanded={open}
            >
              <span
                className={`font-rubik text-[20px] leading-[1.2] tracking-[-0.4px] transition-colors duration-500 ${
                  open
                    ? 'font-extrabold text-white'
                    : 'font-normal text-white/80'
                }`}
              >
                {title}
              </span>
              <span
                className={`shrink-0 transition-transform duration-500 ${
                  open ? 'rotate-180' : ''
                }`}
                style={{ transitionTimingFunction: FAQ_EASE }}
                aria-hidden
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-500"
              style={{
                transitionTimingFunction: FAQ_EASE,
                gridTemplateRows: open ? '1fr' : '0fr',
              }}
            >
              <div
                className={`min-h-0 ${open ? 'overflow-visible' : 'overflow-hidden'}`}
              >
                <div
                  className="px-[25px] pb-5 transition-opacity duration-500"
                  style={{
                    transitionTimingFunction: FAQ_EASE,
                    transitionDelay: open ? '80ms' : '0ms',
                    opacity: open ? 1 : 0,
                  }}
                  aria-hidden={!open}
                >
                  {item.id === 'stories' ? (
                    <StoriesCarousel />
                  ) : item.id === 'contact' ? (
                    <div className="flex flex-col gap-1 text-right font-rubik text-[18px] font-normal leading-[1.17] tracking-[-0.54px] text-[#BCC8CB]">
                      <p>
                        מרגישים שחסר לכם עוד פרטים? מוזמנים ליצור קשר ישירות עם
                        מאיר.
                        <br />
                        טלפון:{' '}
                        <a
                          href="tel:0558838664"
                          className="underline underline-offset-2 transition hover:text-white"
                          dir="ltr"
                          tabIndex={open ? 0 : -1}
                        >
                          055-883-8664
                        </a>
                      </p>
                      <p>
                        אימייל:{' '}
                        <a
                          href="mailto:nnmeir@gmail.com"
                          className="underline underline-offset-2 transition hover:text-white"
                          dir="ltr"
                          tabIndex={open ? 0 : -1}
                        >
                          nnmeir@gmail.com
                        </a>
                      </p>
                    </div>
                  ) : item.paragraphs ? (
                    <div className="flex flex-col gap-3 text-right font-rubik text-[18px] font-normal leading-[1.17] tracking-[-0.54px] text-[#BCC8CB]">
                      {item.paragraphs.map((p) => (
                        <p key={p.slice(0, 24)} className="whitespace-pre-wrap">
                          {p}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BackToJoystie({ variant }: { variant: 'desktop' | 'mobile' }) {
  const href = landingHomePath('he');
  if (variant === 'mobile') {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 font-rubik text-[14px] font-bold leading-[1.28] tracking-[-0.28px] text-white underline underline-offset-2"
      >
        {/* RTL: first child = right → chevron on the right, pointing right */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="shrink-0"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {CONSULTANT_PAGE.backLabel}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      dir="ltr"
      className="inline-flex h-[46px] flex-row items-center justify-center gap-3 rounded-[16px] border border-white px-[22px] py-[11px] transition hover:bg-white/5"
    >
      <span
        dir="rtl"
        className="font-rubik text-[16px] font-bold leading-[1.28] tracking-[-0.32px] text-white"
      >
        {CONSULTANT_PAGE.backLabel}
      </span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M7.5 5L12.5 10L7.5 15"
          stroke="white"
          strokeWidth="1.67"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

function DesktopWordmark() {
  return (
    <Link
      href={landingHomePath('he')}
      aria-label="Joystie"
      className="absolute left-[34px] top-[19.73px] z-[1] block h-10 w-[79px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LANDING_ASSETS.navLogoWord}
        alt=""
        className="absolute left-[0.7px] top-[4px] h-[22px] w-[77px]"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LANDING_ASSETS.navLogoUnderline}
        alt=""
        className="absolute left-[5px] top-[30px] h-[8px] w-[29px] origin-center rotate-[4.6deg]"
        draggable={false}
      />
    </Link>
  );
}

/**
 * Figma Rectangle 6568 — sticky scroll fade (replaces top-blur.png).
 * Solid page color → transparent so content scrolls up behind chrome.
 */
function ConsultantTopFade({
  className,
  tone = 'desktop',
}: {
  className?: string;
  tone?: 'desktop' | 'mobile';
}) {
  const solid = tone === 'mobile' ? '9, 33, 37' : '5, 22, 26';
  return (
    <div
      className={`pointer-events-none h-[35px] w-full ${className ?? ''}`}
      style={{
        background: `linear-gradient(180deg, rgba(${solid}, 1) 0%, rgba(${solid}, 0.7) 40%, rgba(${solid}, 0) 100%)`,
      }}
      aria-hidden
    />
  );
}

/** Fixed upper chrome — content scrolls up behind the bar + hanging fade. */
function StickyTopBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`fixed inset-x-0 top-0 z-20 ${className ?? ''}`}>
      <div className="relative mx-auto max-w-[1920px] bg-[#05161A]">{children}</div>
    </div>
  );
}

function ConsultantPageInner() {
  return (
    <div
      className="v03-consultant-root marketing-page-fade relative min-h-screen overflow-x-hidden bg-v03-green-900 font-rubik text-white [direction:rtl] md:fixed md:inset-0 md:min-h-0 md:overflow-hidden md:bg-[#05161A]"
      dir="rtl"
      lang="he"
    >
      <TrackAnalyticsEvent event={AnalyticsEvents.REACH_CONSULTANT_PAGE} />

      {/* —— Mobile —— Figma 16348:21470 (document scroll; body lock is md+ only) */}
      <div className="relative z-[1] mx-auto flex w-full max-w-[480px] flex-col overflow-x-hidden md:hidden">
        <div className="fixed inset-x-0 top-0 z-20">
          <div className="relative mx-auto max-w-[480px] bg-v03-green-900 pt-[max(20px,env(safe-area-inset-top))]">
            <div className="flex justify-start px-5 pb-3">
              <BackToJoystie variant="mobile" />
            </div>
            <ConsultantTopFade
              tone="mobile"
              className="absolute inset-x-0 top-[47px] z-[1]"
            />
          </div>
        </div>
        {/* Main frame — 47px under chrome + 15px lower */}
        <div className="relative pt-[62px]">
          {/* Figma Ellipse 400 — soft white + mint behind headline; clipped so no bottom haze */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-[280px] justify-center overflow-hidden"
            aria-hidden
          >
            <div className="relative h-full w-[375px]">
              <div
                className="absolute rounded-full"
                style={{
                  top: 72,
                  left: '50%',
                  width: 160,
                  height: 160,
                  marginLeft: -80,
                  background: 'rgba(255, 255, 255, 0.14)',
                  filter: 'blur(70px)',
                }}
              />
              {/* Mint ellipse — 120×120, blur 100, artboard 133 / 127.5 */}
              <div
                className="absolute rounded-full"
                style={{
                  top: 133,
                  left: 127.5,
                  width: 120,
                  height: 120,
                  background: 'rgba(203, 250, 236, 0.40)',
                  filter: 'blur(100px)',
                }}
              />
            </div>
          </div>

        <div className="relative z-[2] flex flex-col gap-[30px] px-5 pb-16">
          <LandingReveal>
            <header className="mt-[10px] flex flex-col items-end gap-1.5 text-right">
              <h1 className="w-full text-center font-rubik text-[30px] font-bold leading-[1.15] tracking-[-0.9px]">
                <span className="text-[#00FFB3]">{CONSULTANT_PAGE.headlineMint}</span>
                <br />
                <span className="text-white">{CONSULTANT_PAGE.headlineRest}</span>
              </h1>
              <p className="w-full text-right font-rubik text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-[#BCC8CB]">
                {CONSULTANT_PAGE.intro}
              </p>
            </header>
          </LandingReveal>

          <LandingReveal delayMs={40}>
            <MeirBanner size="mobile" />
          </LandingReveal>

          <LandingReveal delayMs={80}>
            <div className="flex flex-col gap-[26px]">
              <div className="flex flex-col gap-2">
                <p className="px-[26px] text-right font-rubik text-[16px] font-normal leading-[1.17] tracking-[-0.48px] text-[#ABBEC3]">
                  {CONSULTANT_PAGE.offersHeading}
                </p>
                <div className="flex flex-col gap-[15px]">
                  {CONSULTANT_OFFERS.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} size="mobile" />
                  ))}
                </div>
              </div>

              <FaqAccordion size="mobile" />
            </div>
          </LandingReveal>
        </div>
        </div>
      </div>

      {/* —— Desktop —— only the right frame (519px + fade rectangle) scrolls */}
      <div className="relative z-[1] mx-auto hidden h-full min-h-0 w-full max-w-[1920px] overflow-hidden md:block">
        {/* Figma Frame 1597882804 — dots vector on the right (left≈1225 / 1920) */}
        <div
          className="pointer-events-none absolute right-0 top-[180px] z-0 h-[650px] w-[min(737px,42vw)]"
          style={{
            background:
              'linear-gradient(90deg, #05161A 0%, #2A3F44 28%, #3A5258 55%, #18262A 82%, #05161A 100%)',
            WebkitMaskImage: `url(${CONSULTANT_ASSETS.dotsMask})`,
            maskImage: `url(${CONSULTANT_ASSETS.dotsMask})`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'right top',
            maskPosition: 'right top',
          }}
          aria-hidden
        />

        <StickyTopBar>
          <DesktopWordmark />
          {/* Same centered columns as main content so «חזרה לג'ויסטי» lines up with the headline */}
          <div className="relative mx-auto flex h-[108.73px] w-fit max-w-full items-center gap-24 px-8 lg:px-12">
            <div className="relative flex h-full w-[519px] max-w-full items-center justify-start">
              <BackToJoystie variant="desktop" />
              <ConsultantTopFade
                tone="desktop"
                className="absolute inset-x-0 top-full z-[2]"
              />
            </div>
            <div className="w-[467px] max-w-full" />
          </div>
        </StickyTopBar>

        <div className="relative z-[1] flex h-full min-h-0 justify-center overflow-hidden px-8 pt-[108.73px] lg:px-12">
          {/* Figma Ellipse 400 — above bg/dots, behind the two main sections */}
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] z-0 flex size-[995px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            aria-hidden
          >
            <div
              style={{
                width: 395,
                height: 395,
                borderRadius: 395,
                background: 'rgba(203, 250, 236, 0.15)',
                filter: 'blur(150px)',
              }}
            />
          </div>

          {/* RTL: copy first = right (scrolls), offers second = left (fixed) */}
          <div className="relative z-[1] mx-auto flex h-full min-h-0 w-fit max-w-full items-stretch justify-center gap-24">
            <div className="v03-scroll-hidden flex h-full min-h-0 w-[519px] max-w-full flex-col gap-12 overflow-x-hidden overflow-y-auto overscroll-y-contain pb-20 pt-6">
              <LandingReveal>
                <header className="flex flex-col gap-3 text-right">
                  <h1 className="font-rubik text-[50px] font-bold leading-[1.15] tracking-[-1.5px]">
                    <span className="text-[#00FFB3]">{CONSULTANT_PAGE.headlineMint}</span>
                    <br />
                    <span className="text-white">{CONSULTANT_PAGE.headlineRest}</span>
                  </h1>
                  <p className="max-w-[482px] font-rubik text-[24px] font-normal leading-[1.17] tracking-[-0.72px] text-[#BCC8CB]">
                    {CONSULTANT_PAGE.intro}
                  </p>
                </header>
              </LandingReveal>

              <LandingReveal delayMs={50}>
                <MeirBanner size="desktop" />
              </LandingReveal>

              <LandingReveal delayMs={90}>
                <FaqAccordion size="desktop" />
              </LandingReveal>
            </div>

            <div className="flex w-[467px] max-w-full shrink-0 flex-col gap-3 self-start pt-6">
              <p className="px-[26px] text-right font-rubik text-[20px] font-medium leading-[1.17] tracking-[-0.6px] text-white/80">
                {CONSULTANT_PAGE.offersHeading}
              </p>
              <div className="flex flex-col gap-[15px]">
                {CONSULTANT_OFFERS.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} size="desktop" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hebrew-only accompaniment programs — dark marketing shell (Figma 16348). */
export function MarketingConsultantPage({
  locale = 'he',
}: {
  locale?: LandingLocale;
}) {
  return (
    <LandingLocaleProvider locale={locale}>
      <ConsultantPageInner />
    </LandingLocaleProvider>
  );
}
