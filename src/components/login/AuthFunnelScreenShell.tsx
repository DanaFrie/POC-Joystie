'use client';

import type { ReactNode } from 'react';
import { JoystieCompactMark } from '@/components/brand/JoystieCompactMark';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import { ONBOARDING_BLUR_FOOTER_HEIGHT_PX } from '@/components/onboarding/OnboardingBlurFooter';
import { FunnelBleedFooterBackdrop } from '@/components/ui/FunnelBleedFooterBackdrop';
import { ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX } from '@/constants/onboarding-footer';
import { SIGNUP_FORM_CONTENT_MARGIN_TOP_PX } from '@/constants/signup-layout';

export const authFunnelFooterButtonClass =
  'inline-flex h-[55px] w-v03-content max-w-[calc(100vw-48px)] items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-white px-[15px] py-2 text-center font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-v03-button transition hover:brightness-95';

export const authFunnelInputClass =
  'h-[49px] w-full rounded-[18px] border border-white/20 bg-white/5 px-[15px] py-[14px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white outline-none focus:border-white/40';

export const authFunnelLabelClass =
  'px-2.5 text-left font-simpler text-[16px] font-normal leading-[21.6px] text-white';

type AuthFunnelScreenShellProps = {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  /** Wrap body in a form element (forgot / reset password). */
  formId?: string;
  onSubmit?: (e: React.FormEvent) => void;
};

export function AuthFunnelScreenShell({
  title,
  children,
  footer,
  formId,
  onSubmit,
}: AuthFunnelScreenShellProps) {
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

  return (
    <>
      <div
        dir="rtl"
        className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-visible"
        style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
      >
        <div className="absolute inset-0 isolate overflow-y-auto v03-scroll-hidden">
          <SignupHeroFrame scrollTop={0} />
          {formId ? (
            <form
              id={formId}
              onSubmit={onSubmit}
              className="relative z-[20] mx-auto flex w-v03-content flex-col items-center gap-[15px] pb-8"
              style={{ marginTop: SIGNUP_FORM_CONTENT_MARGIN_TOP_PX }}
            >
              {body}
            </form>
          ) : (
            <div
              className="relative z-[20] mx-auto flex w-v03-content flex-col items-center gap-[15px] pb-8"
              style={{ marginTop: SIGNUP_FORM_CONTENT_MARGIN_TOP_PX }}
            >
              {body}
            </div>
          )}
        </div>
      </div>

      <FunnelBleedFooterBackdrop shellTopPx={ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX} />

      <div
        className="absolute left-v03-gutter z-[45] flex w-v03-content flex-col items-center gap-[15px] pt-5"
        style={{ top: ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX }}
      >
        {footer}
      </div>
    </>
  );
}
