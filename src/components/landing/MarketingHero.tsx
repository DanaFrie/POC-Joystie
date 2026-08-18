import Image from 'next/image';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { MarketingCtaButton } from '@/components/landing/MarketingCtaButton';
import { LandingReveal } from '@/components/landing/LandingReveal';

/** Figma Y minus permanently-removed chrome (desktop browser 79). */
const DESKTOP_HERO_TOP = 251 - 79;

export function MarketingHero() {
  return (
    // No overflow-* on mobile: overflow-x:hidden/clip computes overflow-y:auto and
    // can create a nested scrollport. Desktop may clip for absolute art.
    <section className="relative lg:min-h-[1001px] lg:overflow-hidden" dir="rtl">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/*
          Art-directed LCP: one hero file per viewport (preload in MarketingLandingPage).
          Avoid priority on both mobile+desktop Next/Image — that double-fetches ~2MB.
        */}
        <picture className="absolute inset-0 block h-full w-full">
          <source media="(min-width: 1024px)" srcSet={LANDING_ASSETS.heroDesktop} type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_ASSETS.heroMobile}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover object-[center_40%] lg:object-center"
            sizes="100vw"
          />
        </picture>
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent to-[#05161a] lg:hidden" />
        {/* Desktop — Figma Rectangle 6554: 1924×314 fade into stats */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[314px] lg:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,22,26,0) 0%, rgba(5,22,26,0.55) 45%, #05161a 100%)',
          }}
          aria-hidden
        />
      </div>

      {/* Mobile — min-h fills first viewport; height grows with content (page scroll only) */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[327px] flex-col items-center gap-10 px-0 pb-16 pt-[calc(93px+env(safe-area-inset-top))] text-center lg:hidden">
        <div className="relative flex w-full flex-col items-center gap-[39px]">
          <LandingReveal
            immediate
            variant="fade"
            delayMs={80}
            className="flex w-full flex-col items-center gap-[30px]"
          >
            <div className="flex w-full flex-col items-center gap-3">
              <p className="font-rubik text-[14px] tracking-[5.32px] text-[rgba(237,239,239,0.45)]">
                לא עוד מלחמות על המסך
              </p>
              <h1 className="relative w-full font-rubik text-[40px] font-bold leading-[1.1] tracking-[-1.2px] text-white [text-shadow:2px_2px_10px_rgba(0,0,0,0.1)]">
                הדרך החדשה לנהל
                <br />
                <span className="relative inline-block">
                  הרגלי מסך
                  {/* Figma hero-underline-mobile — under הרגלי מסך, native 144×20, no rotate */}
                  <Image
                    src={LANDING_ASSETS.heroUnderlineMobile}
                    alt=""
                    width={144}
                    height={20}
                    className="pointer-events-none absolute left-1/2 top-[calc(100%-1px)] z-[1] h-5 w-[144px] max-w-none -translate-x-1/2"
                    unoptimized
                  />
                </span>{' '}
                בריאים
              </h1>
            </div>
            <p className="font-rubik text-[18px] leading-[1.25] tracking-[-0.36px] text-[#d1edf4]">
              הארנק הדיגיטלי שהופך את זמן המסך למטבעות קשב, ומשנה לטובה את הדרך בה ילדים והורים
              מתמודדים עם מסכים
            </p>
          </LandingReveal>
          <LandingReveal immediate variant="fade" delayMs={280}>
            <MarketingCtaButton
              href="/onboarding"
              label="הצטרפות לג׳ויסטי"
              size="mobile"
            />
          </LandingReveal>
        </div>
      </div>

      {/* Desktop — Figma Home content Y kept after cropping browser chrome */}
      <div
        className="relative z-10 mx-auto hidden min-h-[1001px] max-w-[1200px] flex-col items-center landing-gutter pb-40 text-center lg:flex"
        style={{ paddingTop: DESKTOP_HERO_TOP }}
      >
        <LandingReveal
          immediate
          variant="fade"
          delayMs={100}
          className="flex w-full max-w-[638px] flex-col items-center gap-10"
        >
          <div className="flex w-full flex-col items-center gap-[13px]">
            <p className="font-rubik text-[20px] tracking-[6.2px] text-[#01639c]">
              לא עוד מלחמות על המסך
            </p>
            <h1 className="relative font-rubik text-[65px] font-bold leading-[1.05] tracking-[-1.95px] text-[#05161a]">
              הדרך החדשה לנהל
              <br />
              <span className="relative inline-block">
                הרגלי מסך
                {/* Figma Vector 116 — under הרגלי מסך (right side of line), not centered */}
                <Image
                  src={LANDING_ASSETS.heroUnderline}
                  alt=""
                  width={247}
                  height={27}
                  className="pointer-events-none absolute left-1/2 top-[calc(100%-4px)] z-[1] w-[247px] max-w-none -translate-x-1/2"
                  unoptimized
                />
              </span>{' '}
              בריאים
            </h1>
          </div>

          <p className="max-w-[638px] font-rubik text-2xl leading-[1.35] tracking-[-0.72px] text-[#2f2f2f]">
            הארנק הדיגיטלי שהופך את זמן המסך למטבעות קשב, ומשנה את הדרך בה ילדים והורים מתמודדים
            עם מסכים: באמצעות כלכלה התנהגותית, משחק ואחריות אישית
          </p>

          <div className="flex flex-row items-center justify-center gap-8">
            <MarketingCtaButton href="/onboarding" label="הצטרפות לג׳ויסטי" />
            <a
              href="#what-is-joystie"
              className="inline-flex flex-row items-center gap-3 font-rubik text-lg font-bold tracking-[-0.36px] text-[#05161a] transition-opacity duration-500 ease-out hover:opacity-70"
            >
              ספרו לי עוד על ג׳ויסטי
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="6"
                height="11"
                viewBox="0 0 6 11"
                fill="none"
                className="h-[9px] w-[4.5px] shrink-0"
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
        </LandingReveal>
      </div>
    </section>
  );
}
