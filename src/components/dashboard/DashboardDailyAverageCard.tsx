'use client';

import Image from 'next/image';
import type { WeekDay } from '@/types/dashboard';
import {
  PARENT_DASHBOARD_ASSETS,
  PARENT_DASHBOARD_COLORS,
} from '@/constants/parent-dashboard-layout';

type DashboardDailyAverageCardProps = {
  childName: string;
  week: WeekDay[];
  weekOverWeekPercent?: number | null;
  /** When set, overrides week-derived average (baseline / last redemption). */
  averageMinutes?: number;
  /** Active-deal hero — Dori + RTL copy block (Figma 14293:26363). */
  withDori?: boolean;
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
  averageMinutes: averageMinutesProp,
  withDori = false,
}: DashboardDailyAverageCardProps) {
  const averageMinutes = averageMinutesProp ?? averageDailyMinutes(week);
  const comparison =
    weekOverWeekPercent == null || weekOverWeekPercent === 0
      ? '0% ביחס לשבוע שעבר'
      : `${weekOverWeekPercent > 0 ? '+' : ''}${weekOverWeekPercent}% ביחס לשבוע שעבר`;

  const title = withDori
    ? childName
      ? `זמן מסך יומי של ${childName} השבוע`
      : 'זמן מסך יומי השבוע'
    : childName
      ? `ממוצע דק׳ יומי של ${childName}`
      : 'ממוצע דק׳ יומי';

  if (withDori) {
    return (
      <div
        className="relative mt-10 flex w-full flex-col items-start justify-center overflow-visible rounded-[32px] px-6 py-5"
        style={{ background: 'rgba(255, 255, 255, 0.10)', minHeight: 142 }}
        dir="rtl"
      >
        {/* Figma 14339:38608/38609 — 180px art, left -19 / top overhang so Dori exceeds the card. */}
        <div
          className="pointer-events-none absolute z-[2] size-[180px] overflow-visible"
          style={{ left: -19, top: -70 }}
          aria-hidden
        >
          <Image
            src={PARENT_DASHBOARD_ASSETS.doriNotepad}
            alt=""
            width={180}
            height={180}
            className="size-[180px] max-w-none object-contain object-center"
            sizes="180px"
            priority
          />
        </div>

        {/* RTL start = physical right — matches Figma items-end text stack. */}
        <div className="relative z-[1] flex w-full max-w-[calc(100%-120px)] flex-col items-start gap-2 self-start">
          <p
            className="w-full text-right font-simpler text-[14px] font-semibold leading-[18px] tracking-[-0.28px]"
            style={{ color: PARENT_DASHBOARD_COLORS.mint }}
          >
            {title}
          </p>
          <div className="flex flex-col items-start gap-[5px]">
            <p className="text-right font-simpler text-[36px] font-bold leading-[1.1] tracking-[-1.08px] text-white">
              {averageMinutes} דק׳
            </p>
            <div
              className="inline-flex items-center gap-1.5 rounded-[9.19px] px-1.5 py-0.5 opacity-40"
              style={{ background: '#172A2C' }}
            >
              <TrendIcon />
              <p className="whitespace-nowrap text-right font-simpler text-[13px] font-normal leading-[16.9px] text-white">
                {comparison}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col items-center justify-center rounded-[32px] py-5"
      style={{ background: 'rgba(255, 255, 255, 0.10)' }}
    >
      <div className="flex w-full flex-col items-center gap-[11px]">
        <p
          className="whitespace-nowrap text-center font-simpler text-[14px] font-semibold leading-[18px]"
          style={{ color: PARENT_DASHBOARD_COLORS.mint }}
        >
          {title}
        </p>

        <div className="flex flex-col items-center justify-center gap-[3px]">
          <p className="whitespace-nowrap font-simpler text-[36px] font-bold leading-[1.1] tracking-[-1.08px] text-white">
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
    </div>
  );
}
