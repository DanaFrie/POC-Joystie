'use client';

import type { ReactNode } from 'react';

/**
 * Full-viewport funnel chrome. Safe-area insets belong on `FunnelViewport`
 * (`scroll` mode padding) — do not pad here or the canvas/blur get double-inset
 * and clip short of the screen bottom (e.g. Pixel 7).
 */
export function OnboardingFunnelRoot({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      data-v03-funnel
      className="v03-funnel-root fixed inset-0 z-40 overflow-visible bg-v03-green-900"
    >
      <div className="relative z-[10] h-full w-full">{children}</div>
    </div>
  );
}
