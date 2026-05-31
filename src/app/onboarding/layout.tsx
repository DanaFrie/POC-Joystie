import type { Metadata } from 'next';
import { OnboardingFunnelFrame } from '@/components/onboarding/OnboardingFunnelFrame';

/** Onboarding funnel — full viewport from first paint (SSR-safe) */
export const metadata: Metadata = {
  themeColor: '#092125',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      dir="rtl"
      data-v03-funnel
      className="v03-funnel-root fixed inset-0 z-40 overflow-visible bg-v03-green-900"
    >
      <OnboardingFunnelFrame>{children}</OnboardingFunnelFrame>
    </div>
  );
}
