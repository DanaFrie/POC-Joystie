'use client';

import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';

type DashboardComboBannerProps = {
  weeklyBudget: number;
};

export function DashboardComboBanner({ weeklyBudget }: DashboardComboBannerProps) {
  const hasPrize = weeklyBudget > 0;

  return (
    <div
      className="flex h-7 items-center justify-center gap-1 rounded-[26px] px-2"
      style={{
        background: PARENT_DASHBOARD_COLORS.cardBg,
        boxShadow: '0px 0px 6.7px rgba(0, 0, 0, 0.08)',
        outline: `0.9px solid ${PARENT_DASHBOARD_COLORS.comboOutline}`,
        outlineOffset: -0.9,
      }}
    >
      <span className="text-base leading-none" aria-hidden>
        🏆
      </span>
      <p className="font-simpler text-[12px] font-normal tracking-[0.24px] text-white">
        {hasPrize
          ? `פרס שבועי: עד ₪${Math.round(weeklyBudget)}`
          : 'הפרס על קומבו שבועי עדיין לא נקבע'}
      </p>
    </div>
  );
}
