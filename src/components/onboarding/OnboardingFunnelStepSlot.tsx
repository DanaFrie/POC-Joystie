'use client';

import type { ReactNode } from 'react';

type OnboardingFunnelStepSlotProps = {
  /** Unique step id — remounts content on change */
  stepKey: string;
  children: ReactNode;
  className?: string;
};

/**
 * Single visible step shell — overflow clip + keyed remount so absolute
 * step layers do not stack when advancing the funnel.
 */
export function OnboardingFunnelStepSlot({
  stepKey,
  children,
  className = '',
}: OnboardingFunnelStepSlotProps) {
  return (
    <div
      className={`absolute inset-0 z-[10] overflow-hidden ${className}`}
      aria-live="polite"
    >
      <div key={stepKey} className="v03-funnel-screen relative h-full w-full">
        {children}
      </div>
    </div>
  );
}
