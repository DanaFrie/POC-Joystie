/**
 * Figma decor — desktop Home 15329:17364 / mobile Home 15445:6503 / menu 15462:5990.
 * Ellipse boxes use negative inset bleed so the soft SVG glow matches Dev Mode.
 */

import type { CSSProperties } from 'react';

/** Mobile dual-strip fill — same gradient on both vectors (Figma Frame 1597882674). */
const MOBILE_DOTS_GRADIENT =
  'linear-gradient(90deg, #05161A 0.02%, #18262A 36.07%, #09191E 74.52%, #05161A 100%)';

/** Desktop single full-bleed fill (Figma Vector 1917.444×763). */
const DESKTOP_DOTS_GRADIENT =
  'linear-gradient(90deg, #05161A 0.02%, #18262A 36.07%, #09191E 74.52%, #05161A 100%)';

function dotsMaskStyle(src: string, gradient: string, sizeMode: 'fill' | 'cover'): CSSProperties {
  return {
    background: gradient,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: sizeMode === 'fill' ? '100% 100%' : 'cover',
    maskSize: sizeMode === 'fill' ? '100% 100%' : 'cover',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: sizeMode === 'fill' ? 'left top' : 'center',
    maskPosition: sizeMode === 'fill' ? 'left top' : 'center',
  };
}

/**
 * Mobile dots — Figma Frame 1597882674 (Home_Mobile, first feature only).
 *
 * Local artboard: 2174×367.9999, padding-right 0.0002, rotate 90° around top-left
 * → visual ~368×2174 with left edge at −79 (pre-rotate left must be 288.601).
 * Two Vectors 1093.396×435.09 — same mask + gradient on both.
 * Anchor relative to the phone column (Figma parent 210×435).
 */
function WaveDotsMobile({ src }: { src: string }) {
  return (
    <div
      className="pointer-events-none absolute z-0 inline-flex items-start md:hidden"
      style={{
        /* Pre-rotate left 288.601 → visual left −79 after rotate(90deg) */
        left: 288.601,
        top: 0.45,
        width: 2174,
        height: 367.9999,
        paddingRight: 0,
        gap: -0.396,
        transform: 'rotate(90deg)',
        transformOrigin: '0 0',
      }}
      aria-hidden
    >
      <div
        className="shrink-0"
        style={{
          width: 1093.396,
          height: 435.09,
          ...dotsMaskStyle(src, MOBILE_DOTS_GRADIENT, 'fill'),
        }}
      />
      <div
        className="shrink-0"
        style={{
          width: 1093.396,
          height: 435.09,
          ...dotsMaskStyle(src, MOBILE_DOTS_GRADIENT, 'fill'),
        }}
      />
    </div>
  );
}

/**
 * Desktop dots — Figma Home vectors @ 1917.444 wide.
 * Height follows the wave asset aspect (1280×435 → ~652) so dots stay round —
 * Figma’s 763 box with cover/stretch made them oval and uneven.
 */
function WaveDotsDesktop({
  src,
  width = 1917.444,
  height = 651.74,
  flip = false,
  className = '',
}: {
  src: string;
  width?: number;
  height?: number;
  /** Section 3 vector is mirrored in Figma (x ≈ 1917). */
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 z-0 hidden max-w-none shrink-0 md:block ${className}`}
      style={{
        width,
        height,
        transform: flip ? 'translate(-50%, -50%) scaleX(-1)' : 'translate(-50%, -50%)',
      }}
      aria-hidden
    >
      <div
        className="h-full w-full"
        style={{
          ...dotsMaskStyle(src, DESKTOP_DOTS_GRADIENT, 'fill'),
        }}
      />
    </div>
  );
}

export function LandingFeatureWave({
  src,
  className = '',
  /** Mobile dual-strip (only first feature in Figma). */
  showMobile = false,
  /** Desktop full-bleed single vector. */
  showDesktop = true,
  desktopWidth = 1917.444,
  desktopHeight = 651.74,
  desktopFlip = false,
}: {
  src: string;
  className?: string;
  showMobile?: boolean;
  showDesktop?: boolean;
  desktopWidth?: number;
  desktopHeight?: number;
  desktopFlip?: boolean;
}) {
  return (
    <>
      {showMobile ? <WaveDotsMobile src={src} /> : null}
      {showDesktop ? (
        <WaveDotsDesktop
          src={src}
          width={desktopWidth}
          height={desktopHeight}
          flip={desktopFlip}
          className={className}
        />
      ) : null}
    </>
  );
}

/**
 * Ellipse 208 — anchored to the phone column (not the article).
 * Mobile: 239×241, ~top 35 on phone. Desktop: 309, slightly above mid-phone.
 * Soft SVG bleed via negative inset (Figma Dev Mode).
 * Section 1 desktop uses a CSS ellipse on the article instead (`showDesktop={false}`).
 */
export function LandingFeatureEllipse({
  showDesktop = true,
}: {
  showDesktop?: boolean;
}) {
  return (
    <>
      {/* Mobile — centered on phone, Figma y≈35 */}
      <div
        className="pointer-events-none absolute left-1/2 top-[35px] z-0 h-[241px] w-[239px] -translate-x-1/2 md:hidden"
        aria-hidden
      >
        <div className="absolute inset-[-77.5%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing/figma/ellipse-glow.svg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full max-w-none object-contain"
            draggable={false}
          />
        </div>
      </div>
      {/* Desktop — ~309 box */}
      {showDesktop ? (
        <div
          className="pointer-events-none absolute left-1/2 top-[150px] z-0 hidden h-[309px] w-[309px] -translate-x-1/2 md:block"
          aria-hidden
        >
          <div className="absolute inset-[-60%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/figma/ellipse-glow.svg"
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full max-w-none object-contain"
              draggable={false}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Ellipse 400 — CSS glow behind stats copy (not SVG). */
export function LandingStatsGlow({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute z-0 h-[180px] w-[180px] rounded-[180px] bg-[rgba(206,227,232,0.6)] blur-[200px] left-1/2 top-[40px] -translate-x-1/2 md:left-[431px] md:top-[63px] md:h-[366px] md:w-[366px] md:translate-x-0 md:rounded-[366px] md:blur-[400px] ${className}`}
      aria-hidden
    />
  );
}

export function LandingHowGlow({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute z-0 ${className || 'h-[210px] w-[210px] md:h-[309px] md:w-[309px]'}`}
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
  );
}

/** Menu_mobile Ellipse 208: 316×319, bottom 321 on 812 artboard, inset ≈ -58.5% */
export function LandingMenuGlow({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-[321px] left-1/2 z-0 h-[319px] w-[316px] -translate-x-1/2 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-[-58.5%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/figma/ellipse-menu.svg"
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full max-w-none object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}
