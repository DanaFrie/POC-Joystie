'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { JoystieWordmark } from '@/components/brand/JoystieWordmark';

type FunnelDesktopOverlayProps = {
  /**
   * `absolute` — inside `FunnelViewport` (onboarding / game / login / help).
   * `fixed` — full-viewport gate (dashboard and other non-funnel shells).
   */
  position?: 'absolute' | 'fixed';
};

const HEADLINE = 'אנחנו זמינים במובייל,\nמחכים לכם שם :)';
const SCAN_LABEL = 'סרקו אותי מהנייד!';
const HOME_LABEL = 'חזרה לדף הבית';

function qrImageUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=16&color=05161A&bgcolor=FFFFFF&data=${encodeURIComponent(data)}`;
}

/** Chevron — points right, sits on the right of the home CTA (RTL). */
function HomeChevron() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M8.5 5L13.5 10L8.5 15"
        stroke="white"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Desktop mobile-only gate — Figma Marketing 15889:7664.
 * Ignores Figma browser chrome; content centered in the viewport.
 */
export function FunnelDesktopOverlay({
  position = 'absolute',
}: FunnelDesktopOverlayProps) {
  const [scanUrl, setScanUrl] = useState('https://joystie.com/onboarding');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin || 'https://joystie.com';
    setScanUrl(`${origin}/onboarding`);
  }, []);

  return (
    <div
      className={`${
        position === 'fixed' ? 'fixed' : 'absolute'
      } inset-0 z-50 overflow-hidden bg-[#05161A]`}
      role="alert"
      dir="rtl"
      aria-live="polite"
      aria-label={HEADLINE.replace('\n', ' ')}
    >
      {/* Mint ellipse — Figma 264² / blur 332 */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 264,
          height: 264,
          borderRadius: 264,
          background: '#1BECAE',
          filter: 'blur(332.2404479980469px)',
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-8 py-12">
        <div className="flex max-w-[920px] flex-row flex-wrap items-center justify-center gap-10 lg:gap-[92px]">
          {/* Copy — RTL: items-start = right edge (same as text-right headline) */}
          <div className="flex w-full max-w-[422px] flex-col items-start gap-10 lg:gap-[60px]">
            <div className="flex w-full flex-col items-start gap-[30px]">
              <JoystieWordmark
                width={140}
                height={69}
                className="h-auto w-[140px] shrink-0"
              />
              <h1 className="w-full whitespace-pre-line text-right font-rubik text-[clamp(28px,4vw,50px)] font-bold leading-[1.17] text-white">
                {HEADLINE}
              </h1>
            </div>

            <Link
              href="/"
              className="inline-flex h-[46px] flex-row items-center justify-center gap-3 rounded-[16px] px-[22px] py-[11px] outline outline-1 outline-white transition hover:bg-white/10"
            >
              {/* RTL: first child = right → chevron on the right, pointing right */}
              <HomeChevron />
              <span className="text-right font-rubik text-[16px] font-bold leading-[1.28] text-white">
                {HOME_LABEL}
              </span>
            </Link>
          </div>

          {/* QR — visual left */}
          <div className="relative size-[min(332px,72vw)] shrink-0">
            <div
              className="flex size-full items-center justify-center rounded-[32px] bg-[#14353C] p-[8.56px]"
              style={{ outline: '2.57px solid #00FFB3', outlineOffset: '-2.57px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl(scanUrl)}
                alt="קוד QR לפתיחת Joystie בנייד"
                width={291}
                height={291}
                className="size-[min(291px,calc(72vw-24px))] rounded-[28px] bg-white/90 object-contain p-3"
                decoding="async"
              />
            </div>

            <div
              className="pointer-events-none absolute z-10 inline-flex items-center justify-center gap-[7px] rounded-[14px] px-2 py-[7px] backdrop-blur-[10px]"
              style={{
                width: 290,
                maxWidth: '90%',
                left: '-28%',
                top: '4%',
                background: 'rgba(10, 35, 42, 0.70)',
                outline: '3px solid #05161A',
                outlineOffset: '-3px',
                transform: 'rotate(-20deg)',
                transformOrigin: 'top left',
              }}
              aria-hidden
            >
              <p className="text-center font-rubik text-[clamp(18px,2.2vw,32px)] font-bold leading-[1.17] text-white">
                {SCAN_LABEL}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
