'use client';

import {
  AuthFunnelScreenShell,
  authFunnelInputClass,
  authFunnelLabelClass,
} from '@/components/login/AuthFunnelScreenShell';

const FORM_ID = 'forgot-password-form';

const fieldWrapClass = 'flex w-full flex-col items-start gap-0.5';

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
    <AuthFunnelScreenShell
      title="שחזור סיסמה"
      formId={success ? undefined : FORM_ID}
      onSubmit={onSubmit}
      footerCtaLabel={
        success
          ? 'חזרה להתחברות'
          : isSubmitting
            ? 'שולח...'
            : 'שליחת קישור שחזור'
      }
      footerCtaHref={success ? loginReturnHref : undefined}
      footerCtaType="submit"
      footerCtaFormId={success ? undefined : FORM_ID}
      footerCtaDisabled={isSubmitting}
      footerSecondaryLink={
        success
          ? undefined
          : { label: 'חזרה להתחברות', href: loginReturnHref }
      }
      errorMessage={!success ? error : undefined}
    >
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex w-full flex-col items-start gap-5">
          {success ? (
            <div className="w-full rounded-[18px] border border-white/20 bg-white/5 px-4 py-4 text-center font-simpler text-[16px] leading-[21.6px] text-[#E3EDEA]">
              נשלח אימייל עם קישור לשחזור הסיסמה. אנא בדקו את תיבת הדואר הנכנס.
            </div>
          ) : (
            <div className={fieldWrapClass}>
              <label htmlFor="email" className={authFunnelLabelClass}>
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
                className={`${authFunnelInputClass} ${isSubmitting ? 'opacity-50' : ''}`}
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
            </div>
          )}

          {!success ? (
            <p className="w-full px-2.5 text-center font-simpler text-[14px] font-normal leading-[17.5px] text-v03-green-100">
              נשלח אליכם קישור לאיפוס הסיסמה לכתובת האימייל שהזנתם.
            </p>
          ) : null}
        </div>
      </div>
    </AuthFunnelScreenShell>
  );
}
