'use client';

import { SignupIntroSection } from '@/components/onboarding/signup/SignupIntroSection';
import { SignupTermsConsent } from '@/components/onboarding/signup/SignupTermsConsent';
import { getOnboardingParentExternalUrl } from '@/utils/auth-oauth';

export type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

type OnboardingSignupFormProps = {
  values: SignupFormValues;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTermsAcceptedChange: (accepted: boolean) => void;
  onOAuthGoogle?: () => void;
  onOAuthApple?: () => void;
  oauthDisabled?: boolean;
  /** Google/Apple picker open — disable form, keep signup screen visible */
  oauthPickerOpen?: 'google' | 'apple' | null;
};

const fieldWrapClass = 'flex w-full flex-col items-start gap-0.5';

const labelClass =
  'px-2.5 text-left font-simpler text-[16px] font-normal leading-[21.6px] text-white';

const inputClass =
  'h-[49px] w-full rounded-[18px] border border-white/20 bg-white/5 px-[15px] py-[14px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white outline-none focus:border-white/40';

function SignupField({
  id,
  label,
  type = 'text',
  value,
  error,
  onChange,
  autoComplete,
  disabled = false,
}: {
  id: keyof SignupFormValues;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div className={fieldWrapClass}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`${inputClass} ${disabled ? 'opacity-50' : ''}`}
        dir={type === 'email' || type === 'password' ? 'ltr' : 'rtl'}
        style={{ textAlign: 'right' }}
      />
      {error ? (
        <p className="px-2.5 text-left font-simpler text-sm text-red-300">{error}</p>
      ) : null}
    </div>
  );
}

/** Divider + email/password fields (below intro). */
export function OnboardingSignupForm({
  values,
  errors,
  onChange,
  onTermsAcceptedChange,
  onOAuthGoogle,
  onOAuthApple,
  oauthDisabled = false,
  oauthPickerOpen = null,
}: OnboardingSignupFormProps) {
  const formLocked = oauthPickerOpen !== null;

  return (
    <div className={formLocked ? 'pointer-events-none opacity-50' : undefined}>
      <SignupIntroSection
        onOAuthGoogle={onOAuthGoogle}
        onOAuthApple={onOAuthApple}
        oauthDisabled={oauthDisabled}
        oauthLoading={oauthPickerOpen}
      />

      <div className="mt-5 flex w-full flex-col items-stretch gap-5">
        <div className="flex w-full items-center gap-5">
          <div className="h-0 flex-1 border-t-[0.7px] border-v03-green-300" />
          <span className="font-simpler text-[14px] font-normal uppercase leading-5 text-v03-green-300">
            או
          </span>
          <div className="h-0 flex-1 border-t-[0.7px] border-v03-green-300" />
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full flex-col gap-5">
            <SignupField
              id="firstName"
              label="שם פרטי"
              value={values.firstName}
              error={errors.firstName}
              onChange={onChange}
              autoComplete="given-name"
              disabled={formLocked}
            />
            <SignupField
              id="lastName"
              label="שם משפחה"
              value={values.lastName}
              error={errors.lastName}
              onChange={onChange}
              autoComplete="family-name"
              disabled={formLocked}
            />
            <SignupField
              id="email"
              label="אימייל"
              type="email"
              value={values.email}
              error={errors.email}
              onChange={onChange}
              autoComplete="email"
              disabled={formLocked}
            />
            <SignupField
              id="password"
              label="סיסמה"
              type="password"
              value={values.password}
              error={errors.password}
              onChange={onChange}
              autoComplete="new-password"
              disabled={formLocked}
            />
            <SignupField
              id="confirmPassword"
              label="אימות סיסמה"
              type="password"
              value={values.confirmPassword}
              error={errors.confirmPassword}
              onChange={onChange}
              autoComplete="new-password"
              disabled={formLocked}
            />

            <SignupTermsConsent
              accepted={values.termsAccepted}
              onAcceptedChange={onTermsAcceptedChange}
              error={errors.termsAccepted}
              disabled={formLocked}
            />
          </div>

          {errors._general ? (
            <div className="w-full text-center font-simpler text-sm text-red-300">
              <p>{errors._general}</p>
              {errors._general.includes('Google') || errors._general.includes('מוטמע') ? (
                <a
                  href={getOnboardingParentExternalUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-bold text-white underline"
                >
                  פתחו ב-Chrome / Safari
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
