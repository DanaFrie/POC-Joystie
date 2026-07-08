'use client';

import type { WeekDay } from '@/types/dashboard';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';

type DashboardDailyAverageCardProps = {
  childName: string;
  week: WeekDay[];
  weekOverWeekPercent?: number | null;
};

function averageDailyMinutes(week: WeekDay[]): number {
  const tracked = week.filter(
    (day) =>
      day.status !== 'future' &&
      day.status !== 'missing' &&
      (day.screenTimeMinutes != null || day.screenTimeUsed > 0)
  );
  if (tracked.length === 0) return 90;
  const total = tracked.reduce(
    (sum, day) => sum + (day.screenTimeMinutes ?? Math.round(day.screenTimeUsed * 60)),
    0
  );
  return Math.round(total / tracked.length);
}

function TrendIcon() {
  return (
    <span className="relative size-4 shrink-0 overflow-hidden" aria-hidden>
      <span
        className="absolute left-[2.2px] top-[5.96px] block h-[9.33px] w-2 origin-top-left"
        style={{ transform: 'rotate(-30deg)' }}
      >
        <span className="absolute left-[3.46px] top-[2px] block h-[8.08px] w-[4.67px] outline outline-[1.2px] outline-[#787878] -outline-offset-[0.6px]" />
        <span className="absolute left-[3.46px] top-0 block size-[5.46px] outline outline-[1.2px] outline-[#787878] -outline-offset-[0.6px]" />
        <span className="absolute left-0 top-[2px] block size-[5.46px] outline outline-[1.2px] outline-[#787878] -outline-offset-[0.6px]" />
      </span>
    </span>
  );
}

export function DashboardDailyAverageCard({
  childName,
  week,
  weekOverWeekPercent = null,
}: DashboardDailyAverageCardProps) {
  const averageMinutes = averageDailyMinutes(week);
  const comparison =
    weekOverWeekPercent == null
      ? "0% ביחס לשבוע שעבר"
      : `${weekOverWeekPercent > 0 ? '+' : ''}${weekOverWeekPercent}% ביחס לשבוע שעבר`;

  return (
    <div
      className="flex w-full flex-col items-center justify-center rounded-[32px] py-5"
      style={{ background: 'rgba(255, 255, 255, 0.10)' }}
    >
      <div className="flex w-full flex-col items-center gap-0">
        <p
          className="whitespace-nowrap text-center font-simpler text-[14px] font-semibold leading-[18px]"
          style={{ color: PARENT_DASHBOARD_COLORS.mint }}
        >
          {childName ? `ממוצע דק׳ יומי של ${childName}` : 'ממוצע דק׳ יומי'}
        </p>

        <p className="whitespace-nowrap font-simpler text-[34px] font-black leading-[39.84px] text-white">
          {averageMinutes} דק׳
        </p>

        <div
          className="inline-flex items-center gap-1.5 rounded-[9.19px] px-1.5 py-0.5 opacity-40"
          style={{ background: '#172A2C' }}
        >
          <TrendIcon />
          <p className="whitespace-nowrap text-center font-simpler text-[13px] font-normal leading-[16.9px] text-white">
            {comparison}
          </p>
        </div>
      </div>
    </div>
  );
}
