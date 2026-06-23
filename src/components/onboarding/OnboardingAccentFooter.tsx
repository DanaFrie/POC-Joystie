'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { FunnelBleedFooterBackdrop } from '@/components/ui/FunnelBleedFooterBackdrop';
import { ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX } from '@/constants/onboarding-footer';

type OnboardingAccentFooterProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  type?: 'button' | 'submit';
  showLoginLink?: boolean;
};

/** Bottom CTA — turquoise primary (Figma accent), in-canvas stacked footer slot. */
export function OnboardingAccentFooter({
  onClick,
  disabled = false,
  className = '',
  children,
  type = 'button',
  showLoginLink = false,
}: OnboardingAccentFooterProps) {
  return (
    <>
      <FunnelBleedFooterBackdrop shellTopPx={ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX} />

      <div
        className={`absolute left-v03-gutter z-[45] flex w-v03-content flex-col items-center gap-[15px] pt-5 ${className}`}
        style={{ top: ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX }}
      >
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={`inline-flex h-[55px] w-full items-center justify-center gap-2 overflow-hidden rounded-v03-button bg-v03-accent px-[15px] py-2 text-center font-simpler text-[18px] font-bold leading-normal text-[#031D15] shadow-v03-button transition hover:brightness-105 ${
            disabled ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {children}
        </button>
        {showLoginLink ? (
          <p className="w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
            <span>יש לך חשבון? </span>
            <Link
              href="/login"
              className="font-normal text-white underline decoration-solid underline-offset-2"
            >
              להתחברות
            </Link>
          </p>
        ) : null}
      </div>
    </>
  );
}
