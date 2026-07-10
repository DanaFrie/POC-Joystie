import type { Metadata } from 'next';
import { OnboardingFunnelRoot } from '@/components/onboarding/OnboardingFunnelRoot';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import {
  FunnelHeroPortalMount,
  FunnelStepContentLayer,
} from '@/components/ui/FunnelHeroPortalMount';

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  themeColor: '#092125',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

/** `/terms` — same funnel chrome + desktop mobile-only gate as login. */
export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingFunnelRoot>
      <FunnelViewport
        surface="dark"
        scaleMode="scroll"
        className="font-simpler text-v03-text-on-dark"
      >
        <div className="relative h-full w-full">
          <FunnelHeroPortalMount />
          <FunnelStepContentLayer>{children}</FunnelStepContentLayer>
        </div>
      </FunnelViewport>
    </OnboardingFunnelRoot>
  );
}
