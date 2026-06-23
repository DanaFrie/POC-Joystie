'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  ONBOARDING_FUNNEL_CTA_TOP_PX,
  ONBOARDING_FUNNEL_LOGIN_TOP_PX,
} from '@/constants/onboarding-figma';
import {
  ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX,
  ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX,
} from '@/constants/onboarding-footer';

type FooterLayout = 'stacked' | 'landing';

type OnboardingFooterCtaProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  showLoginLink?: boolean;
  layout?: FooterLayout;
};

function FooterCtaButton({
  children,
  onClick,
  disabled,
  variant,
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  if (variant === 'secondary') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex h-[55px] w-full items-center justify-center gap-2 rounded-v03-button bg-white px-[15px] py-2 text-center font-simpler text-[18px] font-bold text-v03-turquoise-950 shadow-v03-button transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      className={`w-full shadow-v03-cta ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

function LoginLinkRow({ className = '' }: { className?: string }) {
  return (
    <p
      className={`w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white ${className}`}
    >
      <span>יש לך חשבון? </span>
      <Link
        href="/login"
        className="font-normal text-white underline decoration-solid underline-offset-2"
      >
        להתחברות
      </Link>
    </p>
  );
}

/** Parent funnel footer — in-canvas Figma coords; scales with transform (no portal). */
export function OnboardingFooterCta({
  children,
  onClick,
  disabled = false,
  variant = 'secondary',
  showLoginLink = false,
  layout = 'stacked',
}: OnboardingFooterCtaProps) {
  if (layout === 'landing') {
    return (
      <>
        <div
          className="absolute left-v03-gutter z-[11] w-v03-content"
          style={{ top: ONBOARDING_FUNNEL_CTA_TOP_PX }}
        >
          <FooterCtaButton onClick={onClick} disabled={disabled} variant={variant}>
            {children}
          </FooterCtaButton>
        </div>
        {showLoginLink ? (
          <div
            className="absolute left-v03-gutter z-[11] w-v03-content"
            style={{ top: ONBOARDING_FUNNEL_LOGIN_TOP_PX }}
          >
            <LoginLinkRow />
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div
      className="absolute left-v03-gutter z-[45] flex w-v03-content flex-col items-center gap-[15px] pt-5"
      style={{ top: ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX }}
    >
      <FooterCtaButton onClick={onClick} disabled={disabled} variant={variant}>
        {children}
      </FooterCtaButton>
      {showLoginLink ? <LoginLinkRow className="text-v03-text-primary" /> : null}
    </div>
  );
}
