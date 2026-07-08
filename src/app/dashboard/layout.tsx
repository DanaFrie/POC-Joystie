import type { Metadata } from 'next';

export const metadata: Metadata = {
  themeColor: '#061C1E',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

/** Full-viewport dashboard shell — true viewport width × 100dvh (no FunnelViewport). */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      dir="rtl"
      data-v03-dashboard
      className="v03-dashboard-root fixed inset-0 z-40 overflow-hidden bg-[#061C1E] font-simpler text-v03-text-on-dark"
      style={{
        width: '100%',
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="relative h-full w-full min-w-0 max-w-none">{children}</div>
    </div>
  );
}
