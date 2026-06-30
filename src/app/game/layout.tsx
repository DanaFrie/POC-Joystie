import type { Metadata } from 'next';
import { GameFunnelShell } from '@/components/onboarding/GameFunnelShell';

export const metadata: Metadata = {
  themeColor: '#092125',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

/** Onboarding ball game — same 375×812 funnel chrome as `/onboarding`. */
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <GameFunnelShell>{children}</GameFunnelShell>;
}
