'use client';

import type { ReactNode, Ref } from 'react';
import { ONBOARDING_BLUR_FOOTER_HEIGHT_PX } from '@/components/onboarding/OnboardingBlurFooter';

type OnboardingFunnelScrollBodyProps = {
  scrollRef: Ref<HTMLDivElement>;
  children: ReactNode;
  /** Reserve space for fixed footer CTA (blur or plain) */
  footerReserve?: boolean;
  className?: string;
};

/**
 * Scrollable funnel content — back chevron and step body scroll together.
 */
export function OnboardingFunnelScrollBody({
  scrollRef,
  children,
  footerReserve = true,
  className = '',
}: OnboardingFunnelScrollBodyProps) {
  return (
    <div
      ref={scrollRef}
      className={`v03-funnel-screen absolute inset-x-0 top-0 z-[10] overflow-y-auto overflow-x-hidden v03-scroll-hidden ${className}`}
      style={{
        bottom: footerReserve ? ONBOARDING_BLUR_FOOTER_HEIGHT_PX : 0,
      }}
    >
      {children}
    </div>
  );
}
