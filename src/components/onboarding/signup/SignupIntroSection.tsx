'use client';

import { GoogleIcon, AppleIcon } from '@/components/onboarding/signup/SignupOAuthIcons';
import {
  getOnboardingParentExternalUrl,
  isRestrictedOAuthEnvironment,
} from '@/utils/auth-oauth';

const oauthButtonClass =
  'inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] border border-white px-[15px] py-2 font-simpler text-[16px] font-bold leading-[21.6px] text-white shadow-v03-button';

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

type SignupIntroSectionProps = {
  onOAuthGoogle?: () => void;
  onOAuthApple?: () => void;
  oauthDisabled?: boolean;
  oauthLoading?: 'google' | 'apple' | null;
};

/** Title + OAuth — starts on ellipse 391 baseline (Figma gap 16 / 12). */
export function SignupIntroSection({
  onOAuthGoogle,
  onOAuthApple,
  oauthDisabled = false,
  oauthLoading = null,
}: SignupIntroSectionProps) {
  const oauthBlocked = isRestrictedOAuthEnvironment();

  return (
    <div className="flex w-full flex-col items-stretch gap-4 v03-funnel-enter-1">
      <div className="flex w-full flex-col items-end">
        <div className="flex w-full flex-col items-end gap-1 self-stretch">
          <h1 className="w-full text-center font-simpler text-[30px] font-black leading-[34.5px] text-white">
            יצירת חשבון בגו׳יסטי
          </h1>
        </div>
        <p className="w-full self-stretch text-center font-simpler text-[18px] font-normal leading-[24.3px] text-white">
          הצטרפו להורים שכבר עשו את השינוי
        </p>
      </div>

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

      <div className="flex w-full flex-col items-stretch gap-3">
        <OAuthButton
          label={oauthLoading === 'google' ? 'מתחבר...' : 'המשך עם Google'}
          icon={<GoogleIcon />}
          onClick={onOAuthGoogle}
          disabled={oauthDisabled || oauthLoading !== null || oauthBlocked}
        />
        <OAuthButton
          label={oauthLoading === 'apple' ? 'מתחבר...' : 'המשך עם Apple'}
          icon={<AppleIcon />}
          onClick={onOAuthApple}
          disabled={oauthDisabled || oauthLoading !== null || oauthBlocked}
        />
      </div>
    </div>
  );
}
