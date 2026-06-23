import type { Metadata } from 'next';
import { OAuthEarlyCapture } from '@/components/onboarding/OAuthEarlyCapture';
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
      <link
        rel="preload"
        href="/onboarding/landing/kingdom.webp"
        as="image"
        type="image/webp"
      />
      <link
        rel="preload"
        href="/brand/logo-joystie.png"
        as="image"
        type="image/png"
      />
      <OAuthEarlyCapture />
      <OnboardingFunnelFrame>{children}</OnboardingFunnelFrame>
    </OnboardingFunnelRoot>
  );
}
