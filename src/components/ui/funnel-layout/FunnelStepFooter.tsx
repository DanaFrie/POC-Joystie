'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { FunnelBleedFooterBackdrop } from '@/components/ui/FunnelBleedFooterBackdrop';
import {
  useFunnelBleedBarBottomStyle,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import {
  FUNNEL_CTA_HEIGHT_PX,
  FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX,
  FUNNEL_FOOTER_INNER_GAP_PX,
  FUNNEL_FOOTER_SHELL_PAD_TOP_PX,
  getFunnelStackedFooterShellHeightPx,
  V03_CTA_LABEL_CLASS,
} from '@/constants/funnel-vertical-layout';


/** Figma stacked footer — frosted bar when content scrolls underneath. */
const SCROLL_FOOTER_BLUR_STYLE: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.10)',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
};

/** Break out of foreground gutter to full 375px canvas width. */
const FOOTER_GUTTER_BREAKOUT_STYLE: CSSProperties = {
  left: 'calc(-1 * var(--v03-gutter))',
  width: 'calc(100% + 2 * var(--v03-gutter))',
};

type FunnelStepFooterLink = {
  label: string;
  href: string;
};

type FunnelStepFooterProps = {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  /** Associate submit button with an external form (`form` attribute). */
  formId?: string;
  /** Render CTA as navigation link (success states). */
  ctaHref?: string;
  className?: string;
  /** Frosted bar on bottom frame — only when main content scrolls. */
  blur?: boolean;
  /** Pin footer over scroll main so backdrop-filter samples scrolled content. */
  overlay?: boolean;
  showLoginLink?: boolean;
  showSignupLink?: boolean;
  onSignupClick?: () => void;
  /** e.g. «חזרה להתחברות» on forgot / reset password. */
  secondaryLink?: FunnelStepFooterLink;
  /** Status text only — no CTA button. */
  statusOnly?: boolean;
  /** Replace default CTA + link rows (Help screen legacy slot). */
  customFooter?: ReactNode;
  /** Shell height hint when `customFooter` includes a secondary link row. */
  shellShowSecondaryLink?: boolean;
  errorMessage?: string;
  /** Primary accent (turquoise) vs white secondary */
  variant?: 'accent' | 'secondary';
};

/**
 * Bottom footer frame — Figma @ top 690, width 375: pt 20, column, gap 15.
 * CTA → optional login row (role) → 32px home-indicator spacer (always last).
 */
export function FunnelStepFooter({
  children,
  onClick,
  disabled = false,
  type = 'button',
  formId,
  ctaHref,
  className = '',
  blur = false,
  overlay = false,
  showLoginLink = false,
  showSignupLink = false,
  onSignupClick,
  secondaryLink,
  statusOnly = false,
  customFooter,
  shellShowSecondaryLink = false,
  errorMessage,
  variant = 'accent',
}: FunnelStepFooterProps) {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const shellHeightPx = getFunnelStackedFooterShellHeightPx({
    showLoginLink,
    showSignupLink,
    showSecondaryLink: !!secondaryLink || shellShowSecondaryLink,
    statusOnly,
  });
  const shellTopPx = usableCanvasHeightPx - shellHeightPx;
  const blurBackdropStyle = useFunnelBleedBarBottomStyle(shellHeightPx);
  const useCanvasBlur = blur && overlay;
  const buttonClass =
    variant === 'accent'
      ? 'bg-v03-accent text-v03-green-900 hover:brightness-105'
      : 'bg-white text-v03-turquoise-950 hover:brightness-95';

  const ctaClassName = `relative z-[1] inline-flex w-full max-w-v03-content items-center justify-center gap-2 overflow-hidden rounded-v03-button px-[15px] py-2 ${V03_CTA_LABEL_CLASS} shadow-v03-button transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`;

  return (
    <>
      {useCanvasBlur ? (
        <FunnelBleedFooterBackdrop shellTopPx={shellTopPx} />
      ) : null}

      <div
        className={`z-[45] flex w-full flex-col items-center justify-end ${
          overlay ? 'absolute' : 'relative shrink-0'
        } ${className}`}
        style={{
          gap: FUNNEL_FOOTER_INNER_GAP_PX,
          paddingTop: blur || overlay ? FUNNEL_FOOTER_SHELL_PAD_TOP_PX : 0,
          ...(overlay
            ? { top: shellTopPx, ...FOOTER_GUTTER_BREAKOUT_STYLE }
            : {}),
        }}
      >
        {blur && !useCanvasBlur ? (
          <div
            className="pointer-events-none absolute z-0"
            style={{
              ...blurBackdropStyle,
              ...SCROLL_FOOTER_BLUR_STYLE,
            }}
            aria-hidden
          />
        ) : null}

        {customFooter ? (
          <div className="relative z-[1] flex w-full max-w-v03-content flex-col items-center gap-[15px]">
            {customFooter}
            <div
              className="w-full shrink-0"
              style={{ height: FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX }}
              aria-hidden
            />
          </div>
        ) : (
          <>
            {errorMessage ? (
              <p className="relative z-[1] w-full max-w-v03-content text-center font-simpler text-sm text-red-300">
                {errorMessage}
              </p>
            ) : null}

            {statusOnly ? (
              <p className="relative z-[1] w-full max-w-v03-content text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
                {children}
              </p>
            ) : ctaHref ? (
              <Link
                href={ctaHref}
                className={`${ctaClassName} no-underline hover:brightness-95`}
                style={{ minHeight: FUNNEL_CTA_HEIGHT_PX }}
              >
                {children}
              </Link>
            ) : (
              <button
                type={type}
                form={formId}
                onClick={onClick}
                disabled={disabled}
                className={ctaClassName}
                style={{ minHeight: FUNNEL_CTA_HEIGHT_PX }}
              >
                {children}
              </button>
            )}

            {showLoginLink ? (
              <p className="relative z-[1] w-full max-w-v03-content text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
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
              <p className="relative z-[1] w-full max-w-v03-content text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
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

            {secondaryLink ? (
              <p className="relative z-[1] w-full max-w-v03-content text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
                <Link
                  href={secondaryLink.href}
                  className="font-normal text-white underline decoration-solid underline-offset-2"
                >
                  {secondaryLink.label}
                </Link>
              </p>
            ) : null}

            <div
              className="relative z-[1] w-full shrink-0"
              style={{ height: FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX }}
              aria-hidden
            />
          </>
        )}
      </div>
    </>
  );
}
