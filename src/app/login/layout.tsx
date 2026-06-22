import type { Metadata } from 'next';
import { OnboardingFunnelRoot } from '@/components/onboarding/OnboardingFunnelRoot';
import { FunnelViewport } from '@/components/ui/FunnelViewport';

export const metadata: Metadata = {
  themeColor: '#092125',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingFunnelRoot>
      <FunnelViewport
        surface="dark"
        scaleMode="width"
        className="font-simpler text-v03-text-on-dark"
      >
        <div className="relative h-full w-full">{children}</div>
      </FunnelViewport>
    </OnboardingFunnelRoot>
  );
}
