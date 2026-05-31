'use client';

import { GoogleIcon, AppleIcon } from '@/components/onboarding/signup/SignupOAuthIcons';

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
      className={`${oauthButtonClass} ${disabled ? 'opacity-50' : 'hover:bg-white/5'}`}
    >
      <span className="flex-1 text-right">{label}</span>
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        {icon}
      </span>
    </button>
  );
}

type SignupIntroSectionProps = {
  onOAuthGoogle?: () => void;
  onOAuthApple?: () => void;
  oauthDisabled?: boolean;
};

/** Title + OAuth — starts on ellipse 391 baseline (Figma gap 16 / 12). */
export function SignupIntroSection({
  onOAuthGoogle,
  onOAuthApple,
  oauthDisabled = false,
}: SignupIntroSectionProps) {
  return (
    <div className="flex w-full max-w-v03-content flex-col items-start gap-4">
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

      <div className="flex w-full flex-col items-start gap-3">
        <OAuthButton
          label="המשך עם Google"
          icon={<GoogleIcon />}
          onClick={onOAuthGoogle}
          disabled={oauthDisabled}
        />
        <OAuthButton
          label="המשך עם Apple"
          icon={<AppleIcon />}
          onClick={onOAuthApple}
          disabled={oauthDisabled}
        />
      </div>
    </div>
  );
}
