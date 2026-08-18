'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { BallGameSliderCard, BALL_GAME_SLIDER_CTA_CLASS } from '@/components/onboarding/game/BallGameSliderCard';

type DashboardBlurCardOverlayProps = {
  visible: boolean;
  titleId: string;
  children: ReactNode;
  footer: ReactNode;
  compact?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  /** When true, card fills viewport with auto vertical spacing between sections. */
  fillViewport?: boolean;
  /** When true, inner card allows tilted goal tiles to bleed slightly outside. */
  contentBleed?: boolean;
  /** When true, card + backdrop fade out (e.g. post-celebration). */
  exiting?: boolean;
  onExitComplete?: () => void;
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
  onClose,
  onBack,
  fillViewport = false,
  contentBleed = false,
  exiting = false,
  onExitComplete,
}: DashboardBlurCardOverlayProps) {
  const [mounted, setMounted] = useState(visible);
  const onExitCompleteRef = useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), 700);
    return () => window.clearTimeout(timer);
  }, [visible]);

  // Only depend on `exiting` — unstable onExitComplete identities were re-arming
  // the timer on every parent re-render and re-submitting the challenge forever.
  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(() => onExitCompleteRef.current?.(), 700);
    return () => window.clearTimeout(timer);
  }, [exiting]);

  if (!mounted) return null;

  const shellOpacity = exiting ? 0 : 1;

  return (
    <div
      className="v03-scroll-hidden absolute inset-0 z-[60] isolate flex items-center justify-center overflow-x-hidden overflow-y-auto px-v03-gutter transition-opacity duration-700 ease-out"
      style={{
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        opacity: shellOpacity,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="relative transition-all duration-700 ease-out"
        style={{
          opacity: shellOpacity,
          transform: exiting ? 'scale(0.96) translateY(12px)' : 'scale(1) translateY(0)',
        }}
      >
        <BallGameSliderCard
          footer={footer}
          compact={compact}
          onClose={onClose}
          onBack={onBack}
          fillViewport={fillViewport}
          contentBleed={contentBleed}
        >
          {children}
        </BallGameSliderCard>
      </div>
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
