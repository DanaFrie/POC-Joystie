import type { Metadata } from 'next';
import { OnboardingFunnelRoot } from '@/components/onboarding/OnboardingFunnelRoot';
import { FunnelViewport } from '@/components/ui/FunnelViewport';

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  themeColor: '#092125',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

/** `/terms` — same funnel chrome as help; overflow-visible so tall legal copy page-scrolls. */
export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingFunnelRoot>
      <FunnelViewport
        surface="dark"
        scaleMode="scroll"
        className="font-simpler text-v03-text-on-dark"
      >
        <div className="relative min-h-full w-full overflow-visible">{children}</div>
      </FunnelViewport>
    </OnboardingFunnelRoot>
  );
}
