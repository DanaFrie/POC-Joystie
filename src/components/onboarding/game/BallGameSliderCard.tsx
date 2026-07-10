'use client';

import type { ReactNode } from 'react';
import { OverlayCloseButton } from '@/components/dashboard/challenge/OverlayCloseButton';
import { OverlayBackButton } from '@/components/dashboard/challenge/OverlayBackButton';

type BallGameSliderCardProps = {
  children: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  /** Fill viewport height with auto vertical spacing (collapsed funnel steps). */
  fillViewport?: boolean;
  /** Allow goal cards / tilt content to bleed slightly outside the card frame. */
  contentBleed?: boolean;
};

/** Figma 13530:5655 / 13598:6534 — 327px slider card (no bottom glow frame). */
export function BallGameSliderCard({
  children,
  footer,
  compact = false,
  onClose,
  onBack,
  fillViewport = false,
  contentBleed = false,
}: BallGameSliderCardProps) {
  const overflowClass = contentBleed
    ? 'overflow-visible'
    : fillViewport
      ? 'overflow-hidden'
      : 'overflow-y-auto overflow-x-hidden v03-scroll-hidden';

  const shellHeightClass = fillViewport
    ? 'min-h-[calc(100dvh-48px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] max-h-[calc(100dvh-48px)] justify-between'
    : 'max-h-[calc(100dvh-48px)]';

  return (
    <div className="relative w-[327px] max-w-[calc(100vw-48px)] shrink-0">
      <div
        className={`relative flex w-full flex-col items-center ${shellHeightClass} ${overflowClass} rounded-[18px] border border-white/25 bg-[#092125] px-[18px] shadow-[2px_2px_15px_rgba(0,0,0,0.08)] ${
          compact ? 'gap-[20px] py-[20px]' : 'gap-[30px] py-[30px]'
        }`}
      >
        {onBack ? (
          <OverlayBackButton onClick={onBack} />
        ) : onClose ? (
          <OverlayCloseButton onClick={onClose} />
        ) : null}
        <div
          className={`flex w-full flex-col items-center gap-[15px] self-stretch ${
            fillViewport ? 'min-h-0 flex-1 justify-between' : 'min-h-0 shrink-0'
          } ${contentBleed ? 'overflow-visible' : ''}`}
        >
          {children}
        </div>
        {footer ? <div className="w-full shrink-0 self-stretch">{footer}</div> : null}
      </div>
    </div>
  );
}

export const BALL_GAME_SLIDER_CTA_CLASS =
  'inline-flex h-[55px] w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-[22px] bg-[#00FFB3] px-[15px] py-2 font-assistant text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95 disabled:opacity-60';
