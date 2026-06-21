'use client';

import type { ReactNode } from 'react';

export function OnboardingFunnelRoot({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      data-v03-funnel
      className="v03-funnel-root fixed inset-0 z-40 overflow-visible bg-v03-green-900"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="relative z-[10] h-full w-full">{children}</div>
    </div>
  );
}
