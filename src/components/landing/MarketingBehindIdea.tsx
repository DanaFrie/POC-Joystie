'use client';

import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { getLandingUi } from '@/constants/landing-i18n';
import { useLandingLocale } from '@/components/landing/LandingLocaleContext';
import { MarketingCtaButton } from '@/components/landing/MarketingCtaButton';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingAuthorAvatar } from '@/components/landing/LandingAuthorAvatar';

/**
 * Behind the idea photo — Figma 15329:16728
 * Outer 378×379 / rx 101.28 / border 2.178 turquoise;
 * inner 338×339 / rx 88.91 with ~20px glass ring.
 */
function BehindIdeaPhoto({ alt }: { alt: string }) {
  return (
    <div className="relative flex h-[379px] w-[378px] shrink-0 items-center justify-center rounded-[101.28px] border-[2.178px] border-v03-turquoise-300 bg-white/10">
      <div className="relative h-[338.7px] w-[337.86px] overflow-hidden rounded-[88.91px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING_ASSETS.calmFamily}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
          style={{ filter: 'saturate(1.75) contrast(1.08)' }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/10" aria-hidden />
      </div>
    </div>
  );
}

export function MarketingBehindIdea() {
  const locale = useLandingLocale();
  const ui = getLandingUi(locale);
  const isEn = locale === 'en';
  const dir = isEn ? 'ltr' : 'rtl';
  const textAlign = isEn ? 'text-left' : 'text-right';

  return (
    <section id="behind-idea" className="landing-section landing-gutter py-12 md:py-24">
      <div
        className={`mx-auto flex max-w-[1000px] flex-col items-center gap-10 lg:items-center lg:justify-between lg:gap-12 ${
          isEn ? 'lg:flex-row' : 'lg:flex-row-reverse'
        }`}
        dir={dir}
      >
        <LandingReveal delayMs={140} className="relative hidden shrink-0 lg:block">
          <BehindIdeaPhoto alt={ui.behindPhotoAlt} />
        </LandingReveal>

        <LandingReveal
          className={`flex w-full max-w-[328px] flex-col items-start gap-6 md:max-w-[492px] lg:gap-[30px] ${textAlign}`}
        >
          <div className="flex w-full flex-col gap-[35px]">
            <div className="flex w-full flex-col gap-4 md:gap-5">
              <h2 className="bg-gradient-to-b from-[#efefef] from-[10%] to-[#d1d1d1] to-[94%] bg-clip-text font-rubik text-[28px] font-bold leading-[1.15] tracking-[-0.9px] text-transparent md:text-[45px] md:tracking-[-1.35px]">
                {ui.behindTitle}
              </h2>
              <div className="relative flex w-full items-center gap-5">
                {/* Figma 15445:6228 — quote accent on the start side */}
                <div
                  className="h-[197px] w-[7px] shrink-0 rounded-[28px] bg-[#223F46]"
                  aria-hidden
                />
                <div className="min-w-0 flex-1 space-y-4 font-rubik text-base italic leading-[1.33] tracking-[-0.3px] text-[#bcc8cb] md:text-[20px]">
                  <p>{ui.behindP1}</p>
                  <p>{ui.behindP2}</p>
                </div>
              </div>
            </div>

            {/* Same About / מרכז הידע avatar treatment */}
            <div className="flex w-full flex-row items-center gap-3 md:gap-4">
              <span className="lg:hidden">
                <LandingAuthorAvatar
                  src={LANDING_ASSETS.founderAvatar}
                  alt={ui.behindAuthor}
                  size="lg"
                />
              </span>
              <span className="hidden lg:inline-flex">
                <LandingAuthorAvatar
                  src={LANDING_ASSETS.founderAvatar}
                  alt={ui.behindAuthor}
                  size="xl"
                />
              </span>
              <div className={textAlign}>
                <p className="font-rubik text-xl font-bold leading-[1.1] tracking-[-0.72px] text-white md:text-2xl">
                  {ui.behindAuthor}
                </p>
                <p className="mt-[5px] font-rubik text-base leading-[1.25] tracking-[-0.36px] text-[#bcc8cb] md:text-lg">
                  {ui.behindRole}
                </p>
              </div>
            </div>
          </div>

          <MarketingCtaButton
            href="/about"
            label={ui.behindCta}
            size="mobile"
            className="lg:hidden"
          />
          <MarketingCtaButton
            href="/about"
            label={ui.behindCta}
            className="hidden lg:inline-flex"
          />
        </LandingReveal>
      </div>
    </section>
  );
}
