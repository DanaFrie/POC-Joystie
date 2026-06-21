'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { OnboardingLoginRow } from '@/components/onboarding/OnboardingLoginRow';
import { ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX } from '@/constants/onboarding-footer';
import { ONBOARDING_FUNNEL_CTA_TOP_PX } from '@/constants/onboarding-figma';

type FooterLayout = 'stacked' | 'landing';

type OnboardingFooterCtaProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** White secondary CTA (parent funnel steps) vs primary purple (landing) */
  variant?: 'primary' | 'secondary';
  /** «יש לך חשבון? להתחברות» — landing layout only */
  showLoginLink?: boolean;
  /** `landing` = CTA at 661px + login at 738px (role screen); `stacked` = 690px shell */
  layout?: FooterLayout;
};

function FooterCtaButton({
  children,
  onClick,
  disabled,
  variant,
}: Pick<
  OnboardingFooterCtaProps,
  'children' | 'onClick' | 'disabled' | 'variant'
>) {
  if (variant === 'secondary') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex h-[55px] w-full items-center justify-center gap-2 rounded-v03-button bg-white px-[15px] py-2 text-center font-simpler text-[18px] font-bold text-v03-turquoise-950 shadow-v03-button transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
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
      className="w-full shadow-v03-cta"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

/**
 * Parent funnel footer CTA — `layout="landing"` matches `/onboarding` + role screen
 * (Figma 12703:41524 / 13160:501).
 */
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
          <FooterCtaButton
            onClick={onClick}
            disabled={disabled}
            variant={variant}
          >
            {children}
          </FooterCtaButton>
        </div>
        {showLoginLink ? <OnboardingLoginRow /> : null}
      </>
    );
  }

  return (
    <div
      className="absolute left-v03-gutter z-[11] flex w-v03-content flex-col gap-[15px] pt-5"
      style={{ top: ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX }}
    >
      <FooterCtaButton onClick={onClick} disabled={disabled} variant={variant}>
        {children}
      </FooterCtaButton>
      {showLoginLink ? (
        <p className="text-center font-v03-body text-v03-body text-v03-text-primary">
          יש לך חשבון?{' '}
          <Link
            href="/login"
            className="font-v03-button text-v03-text-primary underline decoration-solid underline-offset-2"
          >
            להתחברות
          </Link>
        </p>
      ) : null}
    </div>
  );
}
