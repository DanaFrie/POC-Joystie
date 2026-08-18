'use client';

import type { ReactNode } from 'react';
import {
  DashboardFigmaBackground,
  DashboardBottomGlows,
} from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardDailyAverageCard } from '@/components/dashboard/DashboardDailyAverageCard';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';
import type { WeekDay } from '@/types/dashboard';

type ChallengeTestShellProps = {
  title: string;
  subtitle?: string;
  averageMinutes: number;
  childName: string;
  children: ReactNode;
  /** Dim the shell slightly so the overlay card reads clearly. */
  dimmed?: boolean;
};

/** Blurred-underlay frame for challenge UI test routes (paid dashboard mock). */
export function ChallengeTestShell({
  title,
  subtitle,
  averageMinutes,
  childName,
  children,
  dimmed = true,
}: ChallengeTestShellProps) {
  const weekStub: WeekDay[] = [
    {
      dayName: 'א',
      date: '01/01',
      status: 'success',
      coinsEarned: 0,
      screenTimeUsed: averageMinutes / 60,
      screenTimeGoal: 2,
      isRedemptionDay: false,
      screenTimeMinutes: averageMinutes,
    },
  ];

  return (
    <div
      className="absolute inset-0 flex h-full w-full flex-col overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      dir="rtl"
    >
      <div className={dimmed ? 'pointer-events-none select-none' : undefined}>
        <DashboardFigmaBackground showBottomGlows={false} />
        <DashboardTopBar balance={0} menuSlot={<DashboardHeaderMenu />} />
        <div className="absolute inset-0 overflow-hidden">
          <DashboardBottomGlows />
          <div className="relative z-[2] mx-auto flex w-[328px] max-w-full flex-col items-center gap-6 px-0 pt-[97px]">
            <div className="w-full text-center">
              <p className="font-simpler text-[12px] font-semibold uppercase tracking-wide text-[#00E7A2]/70">
                {title}
              </p>
              {subtitle ? (
                <p className="mt-1 font-simpler text-[13px] text-white/50">{subtitle}</p>
              ) : null}
            </div>
            <DashboardDailyAverageCard childName={childName} week={weekStub} />
            <div className="h-40 w-full rounded-[32px] bg-white/5 outline outline-1 outline-white/10" />
            <div className="h-24 w-full rounded-[24px] bg-white/5 outline outline-1 outline-white/10" />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
