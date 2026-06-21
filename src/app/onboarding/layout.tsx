import type { Metadata } from 'next';
import { OnboardingFunnelFrame } from '@/components/onboarding/OnboardingFunnelFrame';
import { OnboardingFunnelRoot } from '@/components/onboarding/OnboardingFunnelRoot';

/** Onboarding funnel — full viewport from first paint (SSR-safe) */
export const metadata: Metadata = {
  themeColor: '#092125',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingFunnelRoot>
      <OnboardingFunnelFrame>{children}</OnboardingFunnelFrame>
    </OnboardingFunnelRoot>
  );
}
