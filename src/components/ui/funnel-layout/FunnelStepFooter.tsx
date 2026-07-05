'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  FUNNEL_CTA_HEIGHT_PX,
  FUNNEL_FOOTER_INNER_GAP_PX,
  FUNNEL_FOOTER_SHELL_PAD_TOP_PX,
} from '@/constants/funnel-vertical-layout';

type FunnelStepFooterProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  /** Frosted bar behind footer block */
  blur?: boolean;
  showLoginLink?: boolean;
  /** Primary accent (turquoise) vs white secondary */
  variant?: 'accent' | 'secondary';
};

/**
 * Sticky footer block — last child of `FunnelStepForeground` (not absolute top:690).
 */
export function FunnelStepFooter({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  blur = true,
  showLoginLink = false,
  variant = 'accent',
}: FunnelStepFooterProps) {
  const buttonClass =
    variant === 'accent'
      ? 'bg-v03-accent text-[#031D15] hover:brightness-105'
      : 'bg-white text-v03-turquoise-950 hover:brightness-95';

  return (
    <div
      className={`relative z-[45] flex w-full shrink-0 flex-col items-center ${className}`}
      style={{
        gap: FUNNEL_FOOTER_INNER_GAP_PX,
        paddingTop: FUNNEL_FOOTER_SHELL_PAD_TOP_PX,
      }}
    >
      {blur ? (
        <div
          className="pointer-events-none absolute inset-x-[calc(-1*var(--v03-gutter))] bottom-0 top-0 bg-white/10 backdrop-blur-[5px]"
          aria-hidden
        />
      ) : null}

      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`relative z-[1] inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-v03-button px-[15px] py-2 text-center font-simpler text-[18px] font-bold leading-normal shadow-v03-button transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
        style={{ minHeight: FUNNEL_CTA_HEIGHT_PX }}
      >
        {children}
      </button>

      {showLoginLink ? (
        <p className="relative z-[1] w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
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
  );
}
