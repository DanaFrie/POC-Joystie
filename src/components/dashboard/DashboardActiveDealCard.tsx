'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatCountdown } from '@/components/dashboard/DashboardScreenTimeRing';
import { PARENT_DASHBOARD_ASSETS } from '@/constants/parent-dashboard-layout';
import { formatNumber } from '@/utils/formatting';

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

type DashboardActiveDealCardProps = {
  hourlyRate: number;
  countdownTarget?: Date | null;
};

/** Active deal frame — countdown + ₪/screen-hour only. */
export function DashboardActiveDealCard({
  hourlyRate,
  countdownTarget = null,
}: DashboardActiveDealCardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!countdownTarget) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [countdownTarget]);

  const remainingMs = countdownTarget
    ? Math.max(0, countdownTarget.getTime() - now)
    : 0;
  const countdown = formatCountdown(remainingMs);
  const countdownLabel = `${countdown.days}:${pad2(countdown.hours)}:${pad2(countdown.minutes)}:${pad2(countdown.seconds)}`;

  return (
    <div
      className="relative flex w-full items-center justify-between gap-2 rounded-[32px] border border-[#40626A] bg-white/5 py-[25px] pe-3 ps-6"
      dir="rtl"
    >
      <div className="flex flex-col items-center justify-center gap-[3px]">
        <div className="flex items-center justify-center gap-[3px]">
          <span className="relative size-[18px] shrink-0 overflow-hidden">
            <Image
              src={PARENT_DASHBOARD_ASSETS.timeCircle}
              alt=""
              width={18}
              height={18}
              className="size-[18px]"
              unoptimized
            />
          </span>
          <p className="whitespace-nowrap text-center font-simpler text-[14px] font-normal leading-[1.25] tracking-[-0.28px] text-[#97ABB1]">
            ספירה לאחור
          </p>
        </div>
        <p
          className="whitespace-nowrap text-right font-simpler text-[16px] font-bold leading-[1.28] tracking-[-0.32px] text-white"
          dir="ltr"
        >
          {countdownLabel}
        </p>
      </div>

      <div className="flex flex-col items-start justify-center gap-[3px]">
        <div className="flex items-center justify-start gap-[3px]">
          <p className="whitespace-nowrap text-right font-simpler text-[14px] font-normal leading-[1.25] tracking-[-0.28px] text-[#97ABB1]">
            מחיר שעת מסך
          </p>
          <span className="relative size-[18px] shrink-0 overflow-hidden">
            <Image
              src={PARENT_DASHBOARD_ASSETS.dealHourInfo}
              alt=""
              width={18}
              height={18}
              className="size-[18px]"
              unoptimized
            />
          </span>
        </div>
        <p className="whitespace-nowrap text-right font-simpler text-[16px] font-bold leading-[1.28] tracking-[-0.32px] text-white">
          ₪{formatNumber(hourlyRate, 1)} לשעה
        </p>
      </div>
    </div>
  );
}

type DashboardCompletedDealCardProps = {
  childName: string;
  dateLabel: string;
  weeklyBudget: number;
  remaining: number;
};

/** Compact completed-deal row used in summary list. */
export function DashboardCompletedDealCard({
  childName,
  dateLabel,
  weeklyBudget,
  remaining,
}: DashboardCompletedDealCardProps) {
  const progress =
    weeklyBudget > 0 ? Math.min(1, Math.max(0, remaining / weeklyBudget)) : 0;

  return (
    <div
      className="relative flex w-full flex-col rounded-[32px] border border-[#40626A] bg-white/5 px-6 pb-5 pt-6"
      dir="rtl"
    >
      {dateLabel ? (
        <div className="absolute -top-[13px] right-[17px] flex h-[23px] items-center justify-center rounded-[32px] border border-[#40626A] bg-[#122729] px-3">
          <p className="whitespace-nowrap text-center font-simpler text-[13px] font-normal leading-[1.3] text-white">
            {dateLabel}
          </p>
        </div>
      ) : null}

      <div className="flex w-full flex-col items-stretch gap-1.5">
        <div className="flex w-full flex-col items-end gap-0.5 text-right">
          <p className="font-simpler text-[14px] font-normal leading-[1.25] text-white">
            {childName ? `נותרו ל${childName}` : 'נותרו'}
          </p>
          <p className="font-simpler text-[14px] font-normal leading-[1.25] text-[#00E7A2]">
            מתוך דמי כיס
          </p>
        </div>
        <div className="relative h-[5px] w-full overflow-hidden rounded-[300px]">
          <div className="absolute inset-0 bg-[#2C4B51]" />
          <div
            className="absolute inset-y-0 end-0 rounded-[300px] bg-[#00FFB3]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex w-full items-start justify-between font-simpler text-[16px] font-bold leading-[1.28] text-white">
          <span>₪{formatNumber(weeklyBudget, weeklyBudget % 1 === 0 ? 0 : 1)}</span>
          <span>₪{formatNumber(remaining, remaining % 1 === 0 ? 0 : 1)}</span>
        </div>
      </div>
    </div>
  );
}
