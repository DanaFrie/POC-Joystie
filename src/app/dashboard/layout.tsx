import type { Metadata } from 'next';
import { DashboardMobileOnlyGate } from '@/components/dashboard/DashboardMobileOnlyGate';

export const metadata: Metadata = {
  themeColor: '#061C1E',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

/** Full-viewport dashboard shell — mobile-only, true 100vw × 100dvh. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardMobileOnlyGate>
      <div
        dir="rtl"
        data-v03-dashboard
        className="v03-dashboard-root fixed inset-0 z-40 overflow-hidden bg-[#061C1E] font-simpler text-v03-text-on-dark"
        style={{
          width: '100vw',
          height: '100dvh',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="relative h-full w-full min-w-0">{children}</div>
      </div>
    </DashboardMobileOnlyGate>
  );
}
