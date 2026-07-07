'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { JoystieCompactMark } from '@/components/brand/JoystieCompactMark';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import {
  FunnelStepFooter,
  FunnelStepForeground,
  FunnelStepMain,
  FunnelStepRoot,
} from '@/components/ui/funnel-layout';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { getFunnelScrollFrameBottomInsetPx } from '@/constants/funnel-vertical-layout';
import { LOGIN_SCROLL_TOP_PX } from '@/constants/login-layout';
import { useScrollOverflow } from '@/hooks/useScrollOverflow';

export const authFunnelInputClass =
  'h-[49px] w-full rounded-[18px] border border-white/20 bg-white/5 px-[15px] py-[14px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white outline-none focus:border-white/40';

export const authFunnelLabelClass =
  'px-2.5 text-left font-simpler text-[16px] font-normal leading-[21.6px] text-white';

/** @deprecated Use `FunnelStepFooter` variant secondary — kept for legacy `footer` slot (Help). */
export const authFunnelFooterButtonClass =
  'inline-flex h-[55px] w-v03-content max-w-[calc(100vw-48px)] items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-white px-[15px] py-2 text-center font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-v03-button transition hover:brightness-95';

type AuthFunnelFooterLink = {
  label: string;
  href: string;
};

type AuthFunnelScreenShellProps = {
  title: string;
  children: ReactNode;
  'aria-label'?: string;
  /** Wrap body in a form element (forgot / reset password). */
  formId?: string;
  onSubmit?: (e: React.FormEvent) => void;
  scrollPadTopPx?: number;
  /** Structured footer — CTA label or status text. */
  footerCtaLabel?: ReactNode;
  footerCtaHref?: string;
  footerCtaType?: 'submit' | 'button';
  footerCtaFormId?: string;
  footerCtaDisabled?: boolean;
  footerCtaOnClick?: () => void;
  footerSecondaryLink?: AuthFunnelFooterLink;
  /** Status-only footer (no CTA button). */
  footerStatusOnly?: boolean;
  errorMessage?: string;
  /** Legacy custom footer slot — Help screen etc. */
  footer?: ReactNode;
  /** Legacy footer shell inset — default assumes secondary link row. */
  footerHasSecondaryRow?: boolean;
};

export function AuthFunnelScreenShell({
  title,
  children,
  'aria-label': ariaLabel,
  formId,
  onSubmit,
  scrollPadTopPx = LOGIN_SCROLL_TOP_PX,
  footerCtaLabel,
  footerCtaHref,
  footerCtaType = 'button',
  footerCtaFormId,
  footerCtaDisabled = false,
  footerCtaOnClick,
  footerSecondaryLink,
  footerStatusOnly = false,
  errorMessage,
  footer,
  footerHasSecondaryRow = true,
}: AuthFunnelScreenShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollOverflows = useScrollOverflow(scrollRef, [title, children, footer, footerCtaLabel]);
  const padTopPx = useFunnelProportionalTopPx(scrollPadTopPx);

  const usesLegacyFooter = footer !== undefined;
  const padBottomPx = getFunnelScrollFrameBottomInsetPx(
    usesLegacyFooter
      ? { showSecondaryLink: footerHasSecondaryRow }
      : footerStatusOnly
        ? { statusOnly: true }
        : { showSecondaryLink: !!footerSecondaryLink }
  );

  const body = (
    <div className="flex w-full flex-col items-center gap-5">
      <JoystieCompactMark width={45.47} height={45.04} />
      <div className="flex w-full flex-col items-end gap-[19px]">
        <h1 className="w-full text-center font-simpler text-[30px] font-black leading-[33px] text-white">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );

  const scrollContent = formId ? (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="relative z-[20] mx-auto flex w-full flex-col items-stretch gap-[15px]"
    >
      {body}
    </form>
  ) : (
    <div className="relative z-[20] mx-auto flex w-full flex-col items-stretch gap-[15px]">
      {body}
    </div>
  );

  const structuredFooter =
    !usesLegacyFooter && footerCtaLabel !== undefined ? (
      <FunnelStepFooter
        variant="secondary"
        overlay
        blur={scrollOverflows}
        statusOnly={footerStatusOnly}
        type={footerCtaType}
        formId={footerCtaFormId}
        ctaHref={footerCtaHref}
        disabled={footerCtaDisabled}
        onClick={footerCtaOnClick}
        secondaryLink={footerSecondaryLink}
        errorMessage={errorMessage}
      >
        {footerCtaLabel}
      </FunnelStepFooter>
    ) : null;

  const legacyFooter =
    usesLegacyFooter ? (
      <FunnelStepFooter
        variant="secondary"
        overlay
        blur={scrollOverflows}
        customFooter={footer}
        shellShowSecondaryLink={footerHasSecondaryRow}
      />
    ) : null;

  return (
    <FunnelStepRoot fitViewport aria-label={ariaLabel ?? title}>
      <SignupHeroFrame />
      <FunnelStepForeground
        distribution="between"
        padTopPx={padTopPx}
        padBottomPx={padBottomPx}
        fitViewport
      >
        <FunnelStepMain
          scroll
          scrollRef={scrollRef}
          className="relative min-h-0 w-full flex-1"
        >
          {scrollContent}
        </FunnelStepMain>
        {structuredFooter}
        {legacyFooter}
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}
