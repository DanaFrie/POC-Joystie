'use client';

import type { ReactNode } from 'react';

/**
 * Full-viewport funnel chrome. Safe-area insets belong on `FunnelViewport`
 * (`scroll` mode padding) — do not pad here or the canvas/blur get double-inset
 * and clip short of the screen bottom (e.g. Pixel 7).
 * `overflow-hidden` — bleed layers must not create a scrollable bottom strip.
 */
export function OnboardingFunnelRoot({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      data-v03-funnel
      className="v03-funnel-root fixed inset-0 z-40 overflow-hidden overscroll-none bg-v03-green-900"
    >
      <div className="relative z-[10] h-full w-full overflow-hidden">{children}</div>
    </div>
  );
}
