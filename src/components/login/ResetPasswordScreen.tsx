'use client';

import {
  AuthFunnelScreenShell,
  authFunnelInputClass,
  authFunnelLabelClass,
} from '@/components/login/AuthFunnelScreenShell';

const FORM_ID = 'reset-password-form';

type ResetPasswordScreenProps = {
  password: string;
  confirmPassword: string;
  error?: string;
  success: boolean;
  isSubmitting: boolean;
  validationError?: string;
  isValidating: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

function AuthField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-0.5">
      <label htmlFor={id} className={authFunnelLabelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="password"
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={id === 'password' ? 'new-password' : 'new-password'}
        className={`${authFunnelInputClass} ${disabled ? 'opacity-50' : ''}`}
        dir="ltr"
        style={{ textAlign: 'right' }}
      />
    </div>
  );
}

export function ResetPasswordScreen({
  password,
  confirmPassword,
  error,
  success,
  isSubmitting,
  validationError,
  isValidating,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ResetPasswordScreenProps) {
  if (isValidating) {
    return (
      <AuthFunnelScreenShell
        title="איפוס סיסמה"
        footerCtaLabel="בודק קישור..."
        footerStatusOnly
      >
        <p className="w-full text-center font-simpler text-[14px] leading-[17.5px] text-v03-green-100">
          רגע אחד, מאמתים את הקישור מהאימייל.
        </p>
      </AuthFunnelScreenShell>
    );
  }

  if (validationError) {
    return (
      <AuthFunnelScreenShell
        title="איפוס סיסמה"
        footerCtaLabel="בקשו קישור חדש"
        footerCtaHref="/login/forgot-password"
        footerSecondaryLink={{ label: 'חזרה להתחברות', href: '/login' }}
      >
        <p className="w-full rounded-[18px] border border-red-300/40 bg-red-400/10 px-4 py-4 text-center font-simpler text-sm text-red-300">
          {validationError}
        </p>
      </AuthFunnelScreenShell>
    );
  }

  return (
    <AuthFunnelScreenShell
      title="איפוס סיסמה"
      formId={success ? undefined : FORM_ID}
      onSubmit={onSubmit}
      footerCtaLabel={
        success ? 'להתחברות' : isSubmitting ? 'מאפס...' : 'איפוס סיסמה'
      }
      footerCtaHref={success ? '/login' : undefined}
      footerCtaType="submit"
      footerCtaFormId={success ? undefined : FORM_ID}
      footerCtaDisabled={isSubmitting}
      footerSecondaryLink={success ? undefined : { label: 'חזרה להתחברות', href: '/login' }}
      errorMessage={!success ? error : undefined}
    >
      {success ? (
        <div className="w-full rounded-[18px] border border-white/20 bg-white/5 px-4 py-4 text-center font-simpler text-[16px] leading-[21.6px] text-[#E3EDEA]">
          הסיסמה עודכנה בהצלחה! אפשר להתחבר עם הסיסמה החדשה.
        </div>
      ) : (
        <div className="flex w-full flex-col gap-5">
          <p className="w-full px-2.5 text-center font-simpler text-[14px] font-normal leading-[17.5px] text-v03-green-100">
            בחרו סיסמה חדשה (לפחות 6 תווים).
          </p>
          <AuthField
            id="password"
            label="סיסמה חדשה"
            value={password}
            onChange={onPasswordChange}
            disabled={isSubmitting}
          />
          <AuthField
            id="confirmPassword"
            label="אישור סיסמה"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            disabled={isSubmitting}
          />
        </div>
      )}
    </AuthFunnelScreenShell>
  );
}
