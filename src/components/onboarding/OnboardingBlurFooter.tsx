'use client';

import type { ReactNode } from 'react';
import { FunnelBleedFooterBackdrop } from '@/components/ui/FunnelBleedFooterBackdrop';
import { V03_CTA_LABEL_CLASS } from '@/constants/funnel-vertical-layout';
import {
  ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX,
  ONBOARDING_STACKED_FOOTER_RESERVE_PX,
  ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX,
} from '@/constants/onboarding-footer';

type OnboardingBlurFooterProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** Frosted bar behind CTA — only when content scrolls underneath */
  blur?: boolean;
  children: ReactNode;
};

/** In-canvas stacked footer — CTA scales with funnel; blur bleeds full viewport. */
export function OnboardingBlurFooter({
  onClick,
  disabled = false,
  className = '',
  blur = true,
  children,
}: OnboardingBlurFooterProps) {
  return (
    <>
      {blur ? (
        <FunnelBleedFooterBackdrop shellTopPx={ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX} />
      ) : null}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`absolute left-v03-gutter z-[45] flex h-[55px] w-v03-content items-center justify-center gap-2 rounded-v03-button bg-white px-[15px] py-2 ${V03_CTA_LABEL_CLASS} text-v03-turquoise-950 shadow-v03-button transition hover:brightness-95 ${
          disabled ? 'pointer-events-none opacity-50' : ''
        } ${className}`}
        style={{ top: ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX }}
      >
        {children}
      </button>
    </>
  );
}

/** Reserve scroll space from button top to canvas bottom (matches stacked footer). */
export const ONBOARDING_BLUR_FOOTER_HEIGHT_PX = ONBOARDING_STACKED_FOOTER_RESERVE_PX;

/** Use on scroll areas so content clears footer + device safe area (e.g. Galaxy S8+). */
export const ONBOARDING_BLUR_FOOTER_RESERVE_CLASS = 'v03-above-blur-footer';
