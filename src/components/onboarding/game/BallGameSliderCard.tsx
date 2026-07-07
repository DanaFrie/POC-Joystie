'use client';

import type { ReactNode } from 'react';

type BallGameSliderCardProps = {
  children: ReactNode;
  footer: ReactNode;
  compact?: boolean;
};

/** Figma 13530:5655 / 13598:6534 — 327px slider card (no bottom glow frame). */
export function BallGameSliderCard({ children, footer, compact = false }: BallGameSliderCardProps) {
  return (
    <div className="relative w-[327px] max-w-[calc(100vw-48px)] shrink-0">
      <div
        className={`relative flex w-full max-h-[calc(100dvh-48px)] flex-col items-center overflow-y-auto overflow-x-hidden rounded-[18px] border border-white/25 bg-[#092125] px-[18px] shadow-[2px_2px_15px_rgba(0,0,0,0.08)] v03-scroll-hidden ${
          compact ? 'gap-[20px] py-[20px]' : 'gap-[30px] py-[30px]'
        }`}
      >
        <div className="flex w-full min-h-0 shrink-0 flex-col items-center gap-[15px] self-stretch">
          {children}
        </div>
        <div className="w-full shrink-0 self-stretch">{footer}</div>
      </div>
    </div>
  );
}

export const BALL_GAME_SLIDER_CTA_CLASS =
  'inline-flex h-[55px] w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-[22px] bg-[#00FFB3] px-[15px] py-2 font-assistant text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95 disabled:opacity-60';
