'use client';

import { useState } from 'react';
import {
  CONSULTANT_OFFERS,
  CONSULTANT_PAGE,
  type ConsultantOffer,
  type ConsultantOfferId,
} from '@/constants/consultant-marketing';
import { ABOUT_ASSETS } from '@/constants/about-marketing';
import {
  LandingLocaleProvider,
  landingHomePath,
  type LandingLocale,
} from '@/components/landing/LandingLocaleContext';
import { MarketingNav } from '@/components/landing/MarketingNav';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingAuthorAvatar } from '@/components/landing/LandingAuthorAvatar';
import { ONBOARDING_SELECTABLE_OPTION } from '@/constants/onboarding-selectable-option';

/** Light DSM checkbox — mint fill when selected. */
function OfferCheck({ selected }: { selected: boolean }) {
  return (
    <span
      className={`relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border-2 transition ${
        selected
          ? 'border-[#00b37a] bg-[#00FFB3]'
          : 'border-[#092125]/30 bg-white'
      }`}
      aria-hidden
    >
      {selected ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7.2L5.8 10L11 4"
            stroke="#092125"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function ConsultantOfferCard({
  offer,
  selected,
  onSelect,
  index,
}: {
  offer: ConsultantOffer;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const outlineClass = selected
    ? 'outline outline-[1.5px] outline-offset-[-1.5px] outline-[#00FFB3]'
    : 'outline outline-[1.5px] outline-offset-[-1.5px] outline-[#092125]/12 hover:outline-[#092125]/25';

  return (
    <LandingReveal delayMs={80 + index * 70} className="w-full">
      {/*
        Light DSM cards (white marketing shell) + subscription card proportions.
        dir=ltr + checkbox last → checkbox on the visual right; gap before it.
      */}
      <button
        type="button"
        dir="ltr"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className={`relative flex w-full items-center gap-4 transition ${
          selected ? 'bg-[#00FFB3]/12' : 'bg-v03-bg-light'
        } ${outlineClass}`}
        style={{
          borderRadius: ONBOARDING_SELECTABLE_OPTION.borderRadius,
          padding: `${ONBOARDING_SELECTABLE_OPTION.paddingY}px ${ONBOARDING_SELECTABLE_OPTION.paddingX}px`,
        }}
        aria-labelledby={`consultant-offer-${offer.id}`}
      >
        <div
          dir="rtl"
          className="relative z-[1] flex min-w-0 flex-1 flex-col items-end gap-1 text-right"
        >
          <h2
            id={`consultant-offer-${offer.id}`}
            className="w-full text-right font-rubik text-[20px] font-bold leading-[1.2] tracking-[-0.4px] text-[#05161a] md:text-[22px]"
          >
            {offer.title}
          </h2>
          <p className="w-full text-right font-rubik text-[15px] font-normal leading-[1.28] tracking-[-0.3px] text-[#434343]">
            {offer.meta}
          </p>
          {offer.description ? (
            <p className="w-full text-right font-rubik text-[15px] font-normal leading-[1.4] tracking-[-0.3px] text-[#434343]">
              {offer.description}
            </p>
          ) : null}
          <p className="w-full pt-1 text-right font-rubik text-[18px] font-bold leading-[1.28] tracking-[-0.36px] text-[#092125] md:text-[20px]">
            {offer.priceLabel}
          </p>
        </div>

        <OfferCheck selected={selected} />
      </button>
    </LandingReveal>
  );
}

function MeirConsultantBanner() {
  return (
    <LandingReveal delayMs={40}>
      <div className="relative mb-8 overflow-hidden rounded-[28px] bg-[#092125] px-5 py-6 md:mb-10 md:px-6 md:py-7">
        {/* Soft mint glow behind Meir */}
        <div
          className="pointer-events-none absolute -left-8 top-1/2 h-[180px] w-[180px] -translate-y-1/2 rounded-full opacity-80 md:-left-4"
          style={{
            background:
              'radial-gradient(circle, rgba(0,255,179,0.45) 0%, rgba(0,255,179,0.12) 45%, transparent 70%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,255,179,0.12) 0%, transparent 55%)',
          }}
          aria-hidden
        />

        <div className="relative z-[1] flex items-center gap-4">
          <LandingAuthorAvatar
            src={ABOUT_ASSETS.meir}
            alt={CONSULTANT_PAGE.consultantName}
            size="xl"
          />
          <div className="min-w-0 flex-1 text-right">
            <p className="font-rubik text-[14px] font-bold leading-none tracking-[0.04em] text-[#00FFB3]">
              {CONSULTANT_PAGE.consultantNote}
            </p>
            <p className="mt-2 font-rubik text-[22px] font-bold leading-[1.15] tracking-[-0.44px] text-white md:text-[24px]">
              {CONSULTANT_PAGE.consultantName}
            </p>
            <p className="mt-1 font-rubik text-[15px] font-normal leading-[1.3] tracking-[-0.3px] text-white/75">
              {CONSULTANT_PAGE.consultantRole}
            </p>
          </div>
        </div>
      </div>
    </LandingReveal>
  );
}

function ConsultantPageInner() {
  const homePrefix = landingHomePath('he');
  const [selectedId, setSelectedId] = useState<ConsultantOfferId | null>(null);
  const selected = CONSULTANT_OFFERS.find((o) => o.id === selectedId) ?? null;

  return (
    <div
      className="marketing-page-fade min-h-screen bg-white font-rubik text-[#092125] [direction:rtl]"
      dir="rtl"
      lang="he"
    >
      <MarketingNav
        homeHashPrefix={homePrefix === '/en' ? '/en' : '/'}
        chrome="onLight"
      />

      <main className="mx-auto flex w-full max-w-[480px] flex-col px-6 pb-28 pt-28 md:max-w-[560px] md:px-8 md:pb-32 md:pt-36">
        <LandingReveal>
          <header className="mb-6 flex flex-col gap-3 text-right md:mb-8 md:gap-4">
            <h1 className="font-rubik text-[32px] font-bold leading-[1.15] tracking-[-0.8px] text-[#05161a] md:text-[40px] md:tracking-[-1px]">
              {CONSULTANT_PAGE.title}
            </h1>
            <p className="font-rubik text-[16px] font-normal leading-[1.4] tracking-[-0.32px] text-[#434343] md:text-[18px]">
              {CONSULTANT_PAGE.intro}
            </p>
          </header>
        </LandingReveal>

        <MeirConsultantBanner />

        <LandingReveal delayMs={60}>
          <h2 className="mb-4 text-right font-rubik text-[18px] font-bold leading-[1.25] tracking-[-0.36px] text-[#05161a] md:mb-5 md:text-[20px]">
            {CONSULTANT_PAGE.offersHeading}
          </h2>
        </LandingReveal>

        <div
          className="flex flex-col gap-3 md:gap-4"
          role="radiogroup"
          aria-label={CONSULTANT_PAGE.offersHeading}
        >
          {CONSULTANT_OFFERS.map((offer, index) => (
            <ConsultantOfferCard
              key={offer.id}
              offer={offer}
              index={index}
              selected={selectedId === offer.id}
              onSelect={() => setSelectedId(offer.id)}
            />
          ))}
        </div>

        <LandingReveal delayMs={320}>
          <p className="mt-6 text-center font-rubik text-[14px] font-normal leading-[1.4] tracking-[-0.28px] text-[#6b7a7e]">
            {selected
              ? CONSULTANT_PAGE.footnote
              : CONSULTANT_PAGE.ctaDisabledHint}
          </p>
        </LandingReveal>
      </main>

      {/* Sticky bottom CTA — one button for the selected offer */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#092125]/08 bg-white/95 px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[480px] md:max-w-[560px]">
          {selected ? (
            <a
              href={selected.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-[#00FFB3] px-[15px] font-rubik text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
            >
              {CONSULTANT_PAGE.ctaLabel}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-[55px] w-full cursor-not-allowed items-center justify-center rounded-[22px] bg-[#00FFB3]/40 px-[15px] font-rubik text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-v03-green-900/50"
            >
              {CONSULTANT_PAGE.ctaLabel}
            </button>
          )}
        </div>
      </div>

      <div className="pb-24 pt-6 md:pb-28 md:pt-10">
        <MarketingFooter surface="light" />
      </div>
    </div>
  );
}

/** Mobile-first consultant sales page — white DSM shell. */
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
