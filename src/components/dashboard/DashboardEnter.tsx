'use client';

import type { ReactNode } from 'react';

type DashboardEnterProps = {
  children: ReactNode;
  className?: string;
  /** Stagger step (0–6). */
  index?: number;
  /**
   * `card` — slide up + fade (dashboard cards)
   * `frame` — soft rise for the main content column
   * `fade` — opacity only (top bar / transformed layers)
   */
  variant?: 'card' | 'frame' | 'fade';
};

/**
 * One-shot dashboard entrance. Stagger with `index`; respects prefers-reduced-motion via CSS.
 */
export function DashboardEnter({
  children,
  className = '',
  index = 0,
  variant = 'card',
}: DashboardEnterProps) {
  const delay = Math.max(0, Math.min(6, Math.round(index)));
  return (
    <div
      className={`dashboard-enter dashboard-enter-${variant} dashboard-enter-d${delay} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
