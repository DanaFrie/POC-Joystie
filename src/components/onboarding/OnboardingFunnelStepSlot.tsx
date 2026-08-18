'use client';

import type { ReactNode } from 'react';

type OnboardingFunnelStepSlotProps = {
  /** Unique step id — remounts content on change */
  stepKey: string;
  children: ReactNode;
  className?: string;
  /** Applied on the keyed inner screen (e.g. reveal animation scope) */
  innerClassName?: string;
  /** When false, layers may bleed into contain letterbox (child funnel). */
  clipOverflow?: boolean;
};

/**
 * Single visible step shell — overflow clip + keyed remount so absolute
 * step layers do not stack when advancing the funnel.
 */
export function OnboardingFunnelStepSlot({
  stepKey,
  children,
  className = '',
  innerClassName = '',
  clipOverflow = true,
}: OnboardingFunnelStepSlotProps) {
  return (
    <div
      className={`absolute inset-0 z-[10] ${clipOverflow ? 'overflow-hidden' : 'overflow-visible'} ${className}`}
      aria-live="polite"
    >
      <div
        key={stepKey}
        className={`v03-funnel-screen relative h-full w-full ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
