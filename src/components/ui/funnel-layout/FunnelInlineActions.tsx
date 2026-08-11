'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  FUNNEL_CTA_HEIGHT_PX,
  FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX,
  FUNNEL_FOOTER_INNER_GAP_PX,
  V03_CTA_LABEL_CLASS,
} from '@/constants/funnel-vertical-layout';

type FunnelInlineActionsProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  formId?: string;
  /** Error shown directly above the CTA (password / form auth). */
  errorMessage?: string;
  showLoginLink?: boolean;
  showSignupLink?: boolean;
  onSignupClick?: () => void;
  variant?: 'accent' | 'secondary';
  className?: string;
};

/**
 * In-scroll CTA stack (replaces fixed FunnelStepFooter on form steps).
 * Password/form errors sit above the button; account link sits below.
 */
export function FunnelInlineActions({
  children,
  onClick,
  disabled = false,
  type = 'button',
  formId,
  errorMessage,
  showLoginLink = false,
  showSignupLink = false,
  onSignupClick,
  variant = 'accent',
  className = '',
}: FunnelInlineActionsProps) {
  const buttonClass =
    variant === 'accent'
      ? 'bg-v03-accent text-v03-green-900 hover:brightness-105'
      : 'bg-white text-v03-turquoise-950 hover:brightness-95';

  return (
    <div
      className={`flex w-full flex-col items-center ${className}`}
      style={{ gap: FUNNEL_FOOTER_INNER_GAP_PX }}
    >
      {errorMessage ? (
        <p className="w-full text-center font-simpler text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <button
        type={type}
        form={formId}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-v03-button px-[15px] py-2 ${V03_CTA_LABEL_CLASS} shadow-v03-button transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
        style={{ minHeight: FUNNEL_CTA_HEIGHT_PX }}
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

      {showSignupLink ? (
        <p className="w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
          <span>עדיין אין לך חשבון? </span>
          <Link
            href="/onboarding"
            onClick={(e) => {
              if (!onSignupClick) return;
              e.preventDefault();
              onSignupClick();
            }}
            className="font-normal text-white underline decoration-solid underline-offset-2"
          >
            להרשמה
          </Link>
        </p>
      ) : null}

      <div
        className="w-full shrink-0"
        style={{ height: FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX }}
        aria-hidden
      />
    </div>
  );
}
