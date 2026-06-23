'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import {
  ONBOARDING_FUNNEL_CTA_TOP_PX,
  ONBOARDING_FUNNEL_LOGIN_LEFT_PX,
  ONBOARDING_FUNNEL_LOGIN_TOP_PX,
} from '@/constants/onboarding-figma';
import { useOnboardingStackedFooterLayout } from '@/hooks/useOnboardingStackedFooterLayout';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

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
      className={`text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white ${className}`}
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

/**
 * Parent funnel footer — portaled; pins to viewport bottom when canvas overflows (width-fill + safe area).
 */
export function OnboardingFooterCta({
  children,
  onClick,
  disabled = false,
  variant = 'secondary',
  showLoginLink = false,
  layout = 'stacked',
}: OnboardingFooterCtaProps) {
  const { scale, offsetX, offsetY, viewportHeight } = useFunnelViewportMetrics();
  const stacked = useOnboardingStackedFooterLayout();

  const safeBottomPx = stacked.safeBottomPx;
  const canvasBottomPx = offsetY + V03_SCREEN_HEIGHT * scale;
  const pinToViewportBottom = canvasBottomPx > viewportHeight - safeBottomPx + 0.5;

  const buttonWidthPx = stacked.buttonWidthPx;
  const buttonLeftPx = stacked.buttonLeftPx;

  if (layout === 'landing') {
    const footer = pinToViewportBottom ? (
      <div
        className="fixed inset-x-0 bottom-0 z-[45] flex flex-col items-center gap-[15px] px-v03-gutter pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-5"
        style={{ width: stacked.viewportWidth }}
      >
        <div style={{ width: buttonWidthPx, maxWidth: 'calc(100vw - 48px)' }}>
          <FooterCtaButton onClick={onClick} disabled={disabled} variant={variant}>
            {children}
          </FooterCtaButton>
        </div>
        {showLoginLink ? <LoginLinkRow /> : null}
      </div>
    ) : (
      <>
        <div
          className="fixed z-[45]"
          style={{
            top: offsetY + ONBOARDING_FUNNEL_CTA_TOP_PX * scale,
            left: buttonLeftPx,
            width: buttonWidthPx,
          }}
        >
          <FooterCtaButton onClick={onClick} disabled={disabled} variant={variant}>
            {children}
          </FooterCtaButton>
        </div>
        {showLoginLink ? (
          <p
            className="fixed z-[45] w-[158px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white"
            style={{
              top: offsetY + ONBOARDING_FUNNEL_LOGIN_TOP_PX * scale,
              left: offsetX + ONBOARDING_FUNNEL_LOGIN_LEFT_PX * scale,
            }}
          >
            <span>יש לך חשבון? </span>
            <Link
              href="/login"
              className="font-normal text-white underline decoration-white decoration-solid"
            >
              להתחברות
            </Link>
          </p>
        ) : null}
      </>
    );

    return <FunnelRootPortal>{footer}</FunnelRootPortal>;
  }

  const footer = pinToViewportBottom ? (
    <div
      className="fixed inset-x-0 bottom-0 z-[45] flex flex-col items-center gap-[15px] bg-white/10 px-v03-gutter pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-5 backdrop-blur-[5px]"
      style={{ width: stacked.viewportWidth }}
    >
      <div style={{ width: buttonWidthPx, maxWidth: 'calc(100vw - 48px)' }}>
        <FooterCtaButton onClick={onClick} disabled={disabled} variant={variant}>
          {children}
        </FooterCtaButton>
      </div>
      {showLoginLink ? <LoginLinkRow className="text-v03-text-primary" /> : null}
    </div>
  ) : (
    <div
      className="fixed z-[45] flex flex-col gap-[15px] px-v03-gutter pt-5"
      style={{
        top: stacked.shellTopPx,
        left: buttonLeftPx,
        width: buttonWidthPx,
      }}
    >
      <FooterCtaButton onClick={onClick} disabled={disabled} variant={variant}>
        {children}
      </FooterCtaButton>
      {showLoginLink ? <LoginLinkRow className="text-v03-text-primary" /> : null}
    </div>
  );

  return <FunnelRootPortal>{footer}</FunnelRootPortal>;
}
