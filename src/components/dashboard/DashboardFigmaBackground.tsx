'use client';

import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';

/** Figma 13465 — mint / cyan blur ellipses on #061C1E */
export function DashboardFigmaBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute rounded-full"
        style={{
          width: 176,
          height: 176,
          left: 100,
          top: -90,
          background: 'rgba(0, 231, 162, 0.45)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 252,
          height: 252,
          left: -116,
          top: '70%',
          background: PARENT_DASHBOARD_COLORS.cyanGlow,
          filter: 'blur(120px)',
          opacity: 0.55,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 176,
          height: 176,
          right: -40,
          bottom: -40,
          background: PARENT_DASHBOARD_COLORS.mint,
          filter: 'blur(100px)',
          opacity: 0.35,
        }}
      />
    </div>
  );
}
