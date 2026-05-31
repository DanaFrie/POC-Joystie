import type { ReactNode } from 'react';
import { OnboardingFunnelFrame } from '@/components/onboarding/OnboardingFunnelFrame';

type ScreenShellProps = {
  children: ReactNode;
  className?: string;
};

/** @deprecated Prefer OnboardingFunnelFrame via onboarding/layout */
export function ScreenShell({ children, className = '' }: ScreenShellProps) {
  return <OnboardingFunnelFrame className={className}>{children}</OnboardingFunnelFrame>;
}
