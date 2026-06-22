'use client';

import Link from 'next/link';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import { JoystieCompactMark } from '@/components/brand/JoystieCompactMark';
import { GoogleIcon, AppleIcon } from '@/components/onboarding/signup/SignupOAuthIcons';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import { ONBOARDING_BLUR_FOOTER_HEIGHT_PX } from '@/components/onboarding/OnboardingBlurFooter';
import {
  getOnboardingParentExternalUrl,
  isRestrictedOAuthEnvironment,
} from '@/utils/auth-oauth';
import { SIGNUP_FORM_CONTENT_MARGIN_TOP_PX } from '@/constants/signup-layout';

const LOGIN_FORM_ID = 'login-form';

const oauthButtonClass =
  'inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] border border-white px-[15px] py-2 font-simpler text-[16px] font-bold leading-[21.6px] text-white shadow-v03-button';

const fieldWrapClass = 'flex w-full flex-col items-start gap-0.5';

const labelClass =
  'px-2.5 text-left font-simpler text-[16px] font-normal leading-[21.6px] text-white';

const inputClass =
  'h-[49px] w-full rounded-[18px] border border-white/20 bg-white/5 px-[15px] py-[14px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white outline-none focus:border-white/40';

const footerButtonClass =
  'inline-flex h-[55px] w-v03-content max-w-[calc(100vw-48px)] items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-white px-[15px] py-2 text-center font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-v03-button transition hover:brightness-95';

type LoginScreenProps = {
  email: string;
  password: string;
  errors: Record<string, string>;
  loginError?: string;
  isSubmitting: boolean;
  oauthLoading?: 'google' | 'apple' | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOAuthGoogle?: () => void;
  onOAuthApple?: () => void;
};

function OAuthButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      dir="rtl"
      className={`${oauthButtonClass} ${disabled ? 'opacity-50' : 'hover:bg-white/5'}`}
    >
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="shrink-0 text-center">{label}</span>
    </button>
  );
}

function LoginField({
  id,
  label,
  type = 'text',
  value,
  error,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        disabled={disabled}
        autoComplete={id === 'email' ? 'email' : 'current-password'}
        className={`${inputClass} ${disabled ? 'opacity-50' : ''}`}
        dir={type === 'email' || type === 'password' ? 'ltr' : 'rtl'}
        style={{ textAlign: 'right' }}
      />
      {error ? (
        <p className="px-2.5 text-right font-simpler text-sm text-red-300">{error}</p>
      ) : null}
    </div>
  );
}

function LoginPortaledFooter({
  loginError,
  isSubmitting,
  formLocked,
}: {
  loginError?: string;
  isSubmitting: boolean;
  formLocked: boolean;
}) {
  const footer = (
    <div className="absolute inset-x-0 bottom-0 z-[45] flex w-full flex-col items-center justify-end gap-[15px] overflow-hidden bg-white/10 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] backdrop-blur-[5px]">
      {loginError ? (
        <p className="w-v03-content max-w-[calc(100vw-48px)] text-center font-simpler text-sm text-red-300">
          {loginError}
        </p>
      ) : null}

      <button
        type="submit"
        form={LOGIN_FORM_ID}
        disabled={formLocked}
        className={`${footerButtonClass} ${formLocked ? 'pointer-events-none opacity-50' : ''}`}
      >
        {isSubmitting ? 'מתחבר...' : 'התחברות'}
      </button>

      <p className="w-v03-content max-w-[calc(100vw-48px)] text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
        <span>עדיין אין לך חשבון? </span>
        <Link
          href="/onboarding"
          className="font-normal text-white underline decoration-solid underline-offset-2"
        >
          להרשמה
        </Link>
      </p>
    </div>
  );

  return <FunnelRootPortal>{footer}</FunnelRootPortal>;
}

export function LoginScreen({
  email,
  password,
  errors,
  loginError,
  isSubmitting,
  oauthLoading = null,
  onChange,
  onSubmit,
  onOAuthGoogle,
  onOAuthApple,
}: LoginScreenProps) {
  const googleBlocked = isRestrictedOAuthEnvironment();
  const formLocked = isSubmitting || oauthLoading !== null;

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
            id={LOGIN_FORM_ID}
            onSubmit={onSubmit}
            className="relative z-[20] mx-auto flex w-v03-content flex-col items-center gap-[15px] pb-8"
            style={{ marginTop: SIGNUP_FORM_CONTENT_MARGIN_TOP_PX }}
          >
            <div className="flex w-full flex-col items-center gap-5">
              <JoystieCompactMark width={45.47} height={45.04} />

              <div className="flex w-full flex-col items-end gap-[19px]">
                <div className="flex w-full flex-col items-center gap-5">
                  <div className="flex w-full flex-col items-start gap-5">
                    <div className="flex w-full flex-col items-end">
                      <h1 className="w-full text-center font-simpler text-[30px] font-black leading-[33px] text-white">
                        התחברות לג׳ויסטי
                      </h1>
                    </div>

                    {googleBlocked ? (
                      <div className="w-full rounded-[18px] border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-center font-simpler text-sm leading-[1.4] text-amber-100">
                        <p>התחברות עם Google לא עובדת מתוך Cursor.</p>
                        <a
                          href={getOnboardingParentExternalUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block font-bold text-white underline"
                        >
                          פתחו ב-Chrome / Safari
                        </a>
                      </div>
                    ) : null}

                    <div className="flex w-full flex-col gap-3">
                      <OAuthButton
                        label={oauthLoading === 'google' ? 'מתחבר...' : 'המשך עם Google'}
                        icon={<GoogleIcon />}
                        onClick={onOAuthGoogle}
                        disabled={formLocked || googleBlocked}
                      />
                      <OAuthButton
                        label={oauthLoading === 'apple' ? 'מתחבר...' : 'המשך עם Apple'}
                        icon={<AppleIcon />}
                        onClick={onOAuthApple}
                        disabled={formLocked}
                      />
                    </div>
                  </div>

                  <div className="flex w-full items-center gap-5">
                    <div className="h-0 flex-1 border-t-[0.7px] border-v03-green-300" />
                    <span className="font-simpler text-[14px] font-normal uppercase leading-5 text-v03-green-300">
                      או
                    </span>
                    <div className="h-0 flex-1 border-t-[0.7px] border-v03-green-300" />
                  </div>

                  <div className="flex w-full flex-col gap-3">
                    <div className="flex w-full flex-col gap-[25px]">
                      <div className="flex w-full flex-col items-start gap-5">
                        <LoginField
                          id="email"
                          label="אימייל"
                          type="email"
                          value={email}
                          error={errors.email}
                          onChange={onChange}
                          disabled={formLocked}
                        />
                        <LoginField
                          id="password"
                          label="סיסמה"
                          type="password"
                          value={password}
                          error={errors.password}
                          onChange={onChange}
                          disabled={formLocked}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <LoginPortaledFooter
        loginError={loginError}
        isSubmitting={isSubmitting}
        formLocked={formLocked}
      />
    </>
  );
}
