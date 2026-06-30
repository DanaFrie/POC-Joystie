'use client';

import { useId, type ReactNode } from 'react';

type BallGameSliderCardProps = {
  children: ReactNode;
  footer: ReactNode;
};

/**
 * Figma 13598:3363 — glow on card background behind CTA.
 * CSS blur matches Figma filter; bottom strip keeps glow inside rounded card.
 */
function BallGameSliderEllipse({ filterId }: { filterId: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={327}
      height={145}
      viewBox="0 0 327 145"
      fill="none"
      className="pointer-events-none absolute"
      style={{ left: 0, bottom: -92.866 }}
      aria-hidden
    >
      <g filter={`url(#${filterId})`}>
        <circle cx="163.433" cy="180.918" r="56.4331" fill="#00D978" />
      </g>
      <defs>
        <filter
          id={filterId}
          x="-17.4848"
          y="0"
          width="361.836"
          height="361.836"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="62.2424" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

/** Figma 13530:5655 / 13598:6534 — 327px slider card. */
export function BallGameSliderCard({ children, footer }: BallGameSliderCardProps) {
  const filterId = `ball-game-slider-blur-${useId().replace(/:/g, '')}`;

  return (
    <div className="relative w-[327px] max-w-[calc(100vw-48px)] shrink-0">
      <div className="relative isolate flex w-full flex-col items-center gap-[30px] overflow-hidden rounded-[18px] border border-white/25 px-[18px] py-[30px] shadow-[2px_2px_15px_rgba(0,0,0,0.08)]">
        <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[#092125]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[150px] overflow-hidden rounded-b-[18px]"
          aria-hidden
        >
          <BallGameSliderEllipse filterId={filterId} />
        </div>

        <div className="relative z-10 flex w-full min-h-0 shrink-0 flex-col items-center gap-[15px] self-stretch">
          {children}
        </div>

        <div className="relative z-10 w-full shrink-0 self-stretch">{footer}</div>
      </div>
    </div>
  );
}

export const BALL_GAME_SLIDER_CTA_CLASS =
  'inline-flex h-[55px] w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-[22px] bg-[#00FFB3] px-[15px] py-2 font-assistant text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95 disabled:opacity-60';
