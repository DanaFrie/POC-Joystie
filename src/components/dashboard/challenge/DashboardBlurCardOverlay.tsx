'use client';

import type { ReactNode } from 'react';
import { BallGameSliderCard, BALL_GAME_SLIDER_CTA_CLASS } from '@/components/onboarding/game/BallGameSliderCard';

type DashboardBlurCardOverlayProps = {
  visible: boolean;
  titleId: string;
  children: ReactNode;
  footer: ReactNode;
  compact?: boolean;
};

/**
 * Blurred dashboard frame + centered card — same pattern as ChildDashboardNonPaidOverlay.
 * Hosts challenge setup / redemption flows as cards on top of the dashboard.
 */
export function DashboardBlurCardOverlay({
  visible,
  titleId,
  children,
  footer,
  compact = false,
}: DashboardBlurCardOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="v03-scroll-hidden absolute inset-0 z-[60] isolate flex items-center justify-center overflow-x-hidden overflow-y-auto px-v03-gutter"
      style={{
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <BallGameSliderCard footer={footer} compact={compact}>
        {children}
      </BallGameSliderCard>
    </div>
  );
}

export { BALL_GAME_SLIDER_CTA_CLASS };

type OverlayPrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

export function OverlayPrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: OverlayPrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={BALL_GAME_SLIDER_CTA_CLASS}
    >
      {children}
    </button>
  );
}

type OverlaySecondaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
};

export function OverlaySecondaryButton({ children, onClick }: OverlaySecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[48px] w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-[22px] border border-white/25 bg-transparent px-[15px] py-2 font-simpler text-[16px] font-bold leading-[21.6px] text-white transition hover:bg-white/5"
    >
      {children}
    </button>
  );
}
