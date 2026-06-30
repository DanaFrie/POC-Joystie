'use client';

import Link from 'next/link';
import {
  AuthFunnelScreenShell,
  authFunnelFooterButtonClass,
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
        footer={
          <p className="w-full text-center font-simpler text-[16px] text-white">
            בודק קישור...
          </p>
        }
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
        footer={
          <>
            <Link
              href="/login/forgot-password"
              className={`${authFunnelFooterButtonClass} text-center no-underline`}
            >
              בקשו קישור חדש
            </Link>
            <p className="w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
              <Link
                href="/login"
                className="font-normal text-white underline decoration-solid underline-offset-2"
              >
                חזרה להתחברות
              </Link>
            </p>
          </>
        }
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
      footer={
        success ? (
          <Link
            href="/login"
            className={`${authFunnelFooterButtonClass} text-center no-underline`}
          >
            להתחברות
          </Link>
        ) : (
          <>
            <button
              type="submit"
              form={FORM_ID}
              disabled={isSubmitting}
              className={`${authFunnelFooterButtonClass} ${
                isSubmitting ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {isSubmitting ? 'מאפס...' : 'איפוס סיסמה'}
            </button>
            <p className="w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
              <Link
                href="/login"
                className="font-normal text-white underline decoration-solid underline-offset-2"
              >
                חזרה להתחברות
              </Link>
            </p>
          </>
        )
      }
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
          {error ? (
            <p className="w-full px-2.5 text-center font-simpler text-sm text-red-300">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </AuthFunnelScreenShell>
  );
}
