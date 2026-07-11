'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { JoystieCompactMark } from '@/components/brand/JoystieCompactMark';
import { GoogleIcon, AppleIcon } from '@/components/onboarding/signup/SignupOAuthIcons';
import { SignupHeroFrame } from '@/components/onboarding/signup/SignupHeroFrame';
import {
  FunnelStepFooter,
  FunnelStepForeground,
  FunnelStepMain,
  FunnelStepRoot,
} from '@/components/ui/funnel-layout';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { getFunnelScrollFrameBottomInsetPx } from '@/constants/funnel-vertical-layout';
import { getLoginScrollTopPx } from '@/constants/login-layout';
import { useScrollOverflow } from '@/hooks/useScrollOverflow';
import { getForgotPasswordPath } from '@/lib/auth/postLoginNavigation';
import {
  getOnboardingParentExternalUrl,
  isRestrictedOAuthEnvironment,
} from '@/utils/auth-oauth';

const LOGIN_FORM_ID = 'login-form';

const oauthButtonClass =
  'inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] border border-white px-[15px] py-2 font-simpler text-[16px] font-bold leading-[21.6px] text-white shadow-v03-button';

const fieldWrapClass = 'flex w-full flex-col items-start gap-0.5';

const labelClass =
  'px-2.5 text-left font-simpler text-[16px] font-normal leading-[21.6px] text-white';

const inputClass =
  'h-[49px] w-full rounded-[18px] border border-white/20 bg-white/5 px-[15px] py-[14px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white outline-none focus:border-white/40';

type LoginScreenProps = {
  email: string;
  password: string;
  errors: Record<string, string>;
  loginError?: string;
  showResumeSignupBanner?: boolean;
  showPasswordProviderBanner?: boolean;
  isSubmitting: boolean;
  oauthLoading?: 'google' | 'apple' | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOAuthGoogle?: () => void;
  onOAuthApple?: () => void;
  onSignupClick?: () => void;
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

function LoginResumeSignupBanner() {
  return (
    <div className="flex h-[72px] w-full shrink-0 items-center justify-center gap-2.5 self-stretch rounded-[20px] bg-white/5 backdrop-blur-[7.5px]">
      <p className="flex-1 text-center font-simpler text-[18px] font-normal leading-[125%] tracking-[-0.27px] text-white">
        התחלת את התהליך ועוד לא סיימנו,
        <br />
        שנשלים יחד את ההצטרפות?
      </p>
    </div>
  );
}

function LoginPasswordProviderBanner() {
  return (
    <div className="flex h-[72px] w-full shrink-0 items-center justify-center gap-2.5 self-stretch rounded-[20px] bg-white/5 backdrop-blur-[7.5px]">
      <p className="flex-1 text-center font-simpler text-[18px] font-normal leading-[125%] tracking-[-0.27px] text-white">
        החשבון נוצר עם אימייל וסיסמה, התחברו כך
      </p>
    </div>
  );
}

export function LoginScreen({
  email,
  password,
  errors,
  loginError,
  showResumeSignupBanner = false,
  showPasswordProviderBanner = false,
  isSubmitting,
  oauthLoading = null,
  onChange,
  onSubmit,
  onOAuthGoogle,
  onOAuthApple,
  onSignupClick,
}: LoginScreenProps) {
  const oauthBlocked = isRestrictedOAuthEnvironment();
  const formLocked = isSubmitting || oauthLoading !== null;
  const showTopBanner = showResumeSignupBanner || showPasswordProviderBanner;
  const loginScrollRef = useRef<HTMLDivElement>(null);
  const scrollOverflows = useScrollOverflow(loginScrollRef, [
    showResumeSignupBanner,
    showPasswordProviderBanner,
    loginError,
    errors,
    email,
    password,
    oauthBlocked,
    oauthLoading,
  ]);
  const loginPadTopPx = useFunnelProportionalTopPx(getLoginScrollTopPx(showTopBanner));
  const forgotPasswordHref = getForgotPasswordPath({
    email,
    existing: showResumeSignupBanner,
    method: showPasswordProviderBanner ? 'password' : undefined,
  });

  return (
    <FunnelStepRoot fitViewport aria-label="התחברות">
      <SignupHeroFrame />
      <FunnelStepForeground
        distribution="between"
        padTopPx={loginPadTopPx}
        padBottomPx={getFunnelScrollFrameBottomInsetPx({ showSignupLink: true })}
        fitViewport
      >
        <FunnelStepMain
          scroll
          scrollRef={loginScrollRef}
          className="relative min-h-0 w-full flex-1"
        >
          <form
            id={LOGIN_FORM_ID}
            onSubmit={onSubmit}
            className="relative z-[20] mx-auto flex w-full flex-col items-stretch gap-[15px]"
          >
            <div className="flex w-full flex-col items-center gap-5">
              <JoystieCompactMark width={45.47} height={45.04} />

              <div className="flex w-full flex-col items-end justify-center gap-[15px]">
                <h1 className="w-full text-center font-simpler text-[30px] font-black leading-[33px] text-white">
                  התחברות לג׳ויסטי
                </h1>

                {showPasswordProviderBanner ? (
                  <LoginPasswordProviderBanner />
                ) : showResumeSignupBanner ? (
                  <LoginResumeSignupBanner />
                ) : null}
              </div>

              <div className="flex w-full flex-col items-end gap-[19px]">
                <div className="flex w-full flex-col items-center gap-5">
                  <div className="flex w-full flex-col items-start gap-5">
                    {oauthBlocked ? (
                      <div className="w-full rounded-[18px] border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-center font-simpler text-sm leading-[1.4] text-amber-100">
                        <p>התחברות עם Google או Apple לא עובדת מתוך Cursor.</p>
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
                        disabled={formLocked || oauthBlocked}
                      />
                      <OAuthButton
                        label={oauthLoading === 'apple' ? 'מתחבר...' : 'המשך עם Apple'}
                        icon={<AppleIcon />}
                        onClick={onOAuthApple}
                        disabled={formLocked || oauthBlocked}
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
                        <p className="relative z-[30] w-full px-2.5 text-right">
                          <Link
                            href={forgotPasswordHref}
                            prefetch={false}
                            className="pointer-events-auto font-simpler text-[14px] font-normal leading-[17.5px] text-v03-green-100 underline decoration-solid underline-offset-2"
                          >
                            שכחתי סיסמה
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </FunnelStepMain>

        <FunnelStepFooter
          variant="secondary"
          showSignupLink
          overlay
          blur={scrollOverflows}
          disabled={formLocked}
          type="submit"
          formId={LOGIN_FORM_ID}
          errorMessage={loginError}
          onSignupClick={onSignupClick}
        >
          {isSubmitting ? 'מתחבר...' : 'התחברות'}
        </FunnelStepFooter>
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}
