'use client';

import type { ReactNode } from 'react';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';

type OnboardingBlurFooterProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** Figma footer — full viewport width; 375×(20+55+20) content centered. */
export function OnboardingBlurFooter({
  onClick,
  disabled = false,
  className = '',
  children,
}: OnboardingBlurFooterProps) {
  const footer = (
    <div
      className={`absolute inset-x-0 bottom-0 z-[45] flex w-full flex-col items-center justify-end gap-[15px] overflow-hidden bg-white/10 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] backdrop-blur-[5px] ${className}`}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex h-[55px] w-v03-content max-w-[calc(100vw-48px)] items-center justify-center gap-2 rounded-v03-button bg-white px-[15px] py-2 text-center font-simpler text-[18px] font-bold text-v03-turquoise-950 shadow-v03-button transition hover:brightness-95 ${
          disabled ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {children}
      </button>
    </div>
  );

  return <FunnelRootPortal>{footer}</FunnelRootPortal>;
}

/** Reserve space above footer: pt 20 + button 55 + pb 20 (+ safe-area via class below) */
export const ONBOARDING_BLUR_FOOTER_HEIGHT_PX = 95;

/** Use on scroll areas so content clears footer + device safe area (e.g. Galaxy S8+). */
export const ONBOARDING_BLUR_FOOTER_RESERVE_CLASS = 'v03-above-blur-footer';
