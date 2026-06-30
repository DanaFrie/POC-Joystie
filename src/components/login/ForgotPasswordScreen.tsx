'use client';

import Link from 'next/link';
import { JoystieCompactMark } from '@/components/brand/JoystieCompactMark';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import { ONBOARDING_BLUR_FOOTER_HEIGHT_PX } from '@/components/onboarding/OnboardingBlurFooter';
import { FunnelBleedFooterBackdrop } from '@/components/ui/FunnelBleedFooterBackdrop';
import { ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX } from '@/constants/onboarding-footer';
import { SIGNUP_FORM_CONTENT_MARGIN_TOP_PX } from '@/constants/signup-layout';

const FORM_ID = 'forgot-password-form';

const fieldWrapClass = 'flex w-full flex-col items-start gap-0.5';

const labelClass =
  'px-2.5 text-left font-simpler text-[16px] font-normal leading-[21.6px] text-white';

const inputClass =
  'h-[49px] w-full rounded-[18px] border border-white/20 bg-white/5 px-[15px] py-[14px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white outline-none focus:border-white/40';

const footerButtonClass =
  'inline-flex h-[55px] w-v03-content max-w-[calc(100vw-48px)] items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-white px-[15px] py-2 text-center font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-v03-button transition hover:brightness-95';

type ForgotPasswordScreenProps = {
  email: string;
  error?: string;
  success: boolean;
  isSubmitting: boolean;
  loginReturnHref?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function ForgotPasswordScreen({
  email,
  error,
  success,
  isSubmitting,
  loginReturnHref = '/login',
  onChange,
  onSubmit,
}: ForgotPasswordScreenProps) {
  return (
    <>
      <div
        dir="rtl"
        className="v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-visible"
        style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
      >
        <div className="absolute inset-0 isolate overflow-y-auto v03-scroll-hidden">
          <SignupHeroFrame scrollTop={0} />

          <form
            id={FORM_ID}
            onSubmit={onSubmit}
            className="relative z-[20] mx-auto flex w-v03-content flex-col items-center gap-[15px] pb-8"
            style={{ marginTop: SIGNUP_FORM_CONTENT_MARGIN_TOP_PX }}
          >
            <div className="flex w-full flex-col items-center gap-5">
              <JoystieCompactMark width={45.47} height={45.04} />

              <div className="flex w-full flex-col items-end gap-[19px]">
                <div className="flex w-full flex-col items-center gap-5">
                  <div className="flex w-full flex-col items-start gap-5">
                    <h1 className="w-full text-center font-simpler text-[30px] font-black leading-[33px] text-white">
                      שחזור סיסמה
                    </h1>

                    {success ? (
                      <div className="w-full rounded-[18px] border border-white/20 bg-white/5 px-4 py-4 text-center font-simpler text-[16px] leading-[21.6px] text-[#E3EDEA]">
                        נשלח אימייל עם קישור לשחזור הסיסמה. אנא בדקו את תיבת הדואר הנכנס.
                      </div>
                    ) : (
                      <div className={fieldWrapClass}>
                        <label htmlFor="email" className={labelClass}>
                          אימייל
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={onChange}
                          disabled={isSubmitting}
                          autoComplete="email"
                          className={`${inputClass} ${isSubmitting ? 'opacity-50' : ''}`}
                          dir="ltr"
                          style={{ textAlign: 'right' }}
                        />
                        {error ? (
                          <p className="px-2.5 text-right font-simpler text-sm text-red-300">
                            {error}
                          </p>
                        ) : null}
                      </div>
                    )}

                    {!success ? (
                      <p className="w-full px-2.5 text-center font-simpler text-[14px] font-normal leading-[17.5px] text-v03-green-100">
                        נשלח אליכם קישור לאיפוס הסיסמה לכתובת האימייל שהזנתם.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <FunnelBleedFooterBackdrop shellTopPx={ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX} />

      <div
        className="pointer-events-none absolute left-v03-gutter z-[45] flex w-v03-content flex-col items-center gap-[15px] pt-5"
        style={{ top: ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX }}
      >
        {success ? (
          <Link
            href={loginReturnHref}
            className={`${footerButtonClass} pointer-events-auto text-center no-underline`}
          >
            חזרה להתחברות
          </Link>
        ) : (
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className={`pointer-events-auto ${footerButtonClass} ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? 'שולח...' : 'שליחת קישור שחזור'}
          </button>
        )}

        <p className="pointer-events-auto w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
          <Link
            href={loginReturnHref}
            className="font-normal text-white underline decoration-solid underline-offset-2"
          >
            חזרה להתחברות
          </Link>
        </p>
      </div>
    </>
  );
}
