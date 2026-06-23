'use client';

import type { ReactNode } from 'react';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import { ONBOARDING_STACKED_FOOTER_RESERVE_PX } from '@/constants/onboarding-footer';
import { useOnboardingStackedFooterLayout } from '@/hooks/useOnboardingStackedFooterLayout';

type OnboardingBlurFooterProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** Frosted bar behind CTA — only when content scrolls underneath */
  blur?: boolean;
  children: ReactNode;
};

/**
 * Portaled footer — Figma Y when canvas fits; viewport bottom when width-fill overflows (e.g. iPhone mini).
 */
export function OnboardingBlurFooter({
  onClick,
  disabled = false,
  className = '',
  blur = true,
  children,
}: OnboardingBlurFooterProps) {
  const layout = useOnboardingStackedFooterLayout();
  const {
    pinToViewportBottom,
    shellTopPx,
    shellHeightPx,
    buttonTopPx,
    buttonBottomPx,
    buttonLeftPx,
    buttonWidthPx,
    buttonHeightPx,
    viewportWidth,
    safeBottomPx,
  } = layout;

  const blurStyle = pinToViewportBottom
    ? {
        bottom: 0,
        left: 0,
        width: viewportWidth,
        height: shellHeightPx + safeBottomPx,
      }
    : {
        top: shellTopPx,
        left: 0,
        width: viewportWidth,
        bottom: 0,
      };

  const buttonStyle = pinToViewportBottom
    ? {
        bottom: buttonBottomPx,
        left: buttonLeftPx,
        width: buttonWidthPx,
        height: buttonHeightPx,
      }
    : {
        top: buttonTopPx,
        left: buttonLeftPx,
        width: buttonWidthPx,
        height: buttonHeightPx,
      };

  const footer = (
    <>
      {blur ? (
        <div
          className="pointer-events-none fixed z-[44] bg-white/10 backdrop-blur-[5px]"
          style={blurStyle}
          aria-hidden
        />
      ) : null}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`fixed z-[45] flex items-center justify-center gap-2 rounded-v03-button bg-white px-[15px] py-2 text-center font-simpler text-[18px] font-bold text-v03-turquoise-950 shadow-v03-button transition hover:brightness-95 ${
          disabled ? 'pointer-events-none opacity-50' : ''
        } ${className}`}
        style={buttonStyle}
      >
        {children}
      </button>
    </>
  );

  return <FunnelRootPortal>{footer}</FunnelRootPortal>;
}

/** Reserve scroll space from button top to canvas bottom (matches stacked footer). */
export const ONBOARDING_BLUR_FOOTER_HEIGHT_PX = ONBOARDING_STACKED_FOOTER_RESERVE_PX;

/** Use on scroll areas so content clears footer + device safe area (e.g. Galaxy S8+). */
export const ONBOARDING_BLUR_FOOTER_RESERVE_CLASS = 'v03-above-blur-footer';
