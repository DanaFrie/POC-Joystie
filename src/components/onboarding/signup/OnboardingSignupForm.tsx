'use client';

import { SignupIntroSection } from '@/components/onboarding/signup/SignupIntroSection';

export type SignupFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type OnboardingSignupFormProps = {
  values: SignupFormValues;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOAuthGoogle?: () => void;
  onOAuthApple?: () => void;
  oauthDisabled?: boolean;
};

const fieldWrapClass = 'flex w-full max-w-v03-content flex-col items-start gap-0.5';

const labelClass =
  'px-2.5 text-left font-simpler text-[16px] font-normal leading-[21.6px] text-white';

const inputClass =
  'h-[49px] w-full rounded-[18px] border border-white/20 bg-white/5 px-[15px] py-[14px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white outline-none placeholder:text-v03-green-400 focus:border-white/40';

function SignupField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  onChange,
  autoComplete,
}: {
  id: keyof SignupFormValues;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
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
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass}
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
  onOAuthGoogle,
  onOAuthApple,
  oauthDisabled = false,
}: OnboardingSignupFormProps) {
  return (
    <>
      <SignupIntroSection
        onOAuthGoogle={onOAuthGoogle}
        onOAuthApple={onOAuthApple}
        oauthDisabled={oauthDisabled}
      />

      <div className="flex w-full max-w-v03-content flex-col items-start gap-5">
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
              id="fullName"
              label="שם מלא"
              value={values.fullName}
              error={errors.fullName}
              onChange={onChange}
              autoComplete="name"
            />
            <SignupField
              id="email"
              label="אימייל"
              type="email"
              placeholder="Example@mail.com"
              value={values.email}
              error={errors.email}
              onChange={onChange}
              autoComplete="email"
            />
            <SignupField
              id="password"
              label="סיסמה"
              type="password"
              placeholder="xxxxxxxxxx"
              value={values.password}
              error={errors.password}
              onChange={onChange}
              autoComplete="new-password"
            />
            <SignupField
              id="confirmPassword"
              label="אימות סיסמה"
              type="password"
              placeholder="xxxxxxxxxx"
              value={values.confirmPassword}
              error={errors.confirmPassword}
              onChange={onChange}
              autoComplete="new-password"
            />
          </div>
          {errors._general ? (
            <p className="w-full text-center font-simpler text-sm text-red-300">
              {errors._general}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
