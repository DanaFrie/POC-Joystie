'use client';

import { useEffect, useState } from 'react';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';

type DashboardScreenTimeRingProps = {
  savedMinutes?: number;
  goalMinutes?: number;
  hasGoal?: boolean;
  variant?: 'parent' | 'child';
  dimmed?: boolean;
  /** Countdown to redemption day — days/hours/min/sec + ring progress. */
  countdownTarget?: Date | null;
  countdownStart?: Date | null;
};

function formatMinutesLabel(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded === 0) return '0 דקות';
  if (rounded < 60) return `${rounded} דקות`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m > 0 ? `${h} שעות ו-${m} דקות` : `${h} שעות`;
}

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

export function formatCountdown(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
}

export function DashboardScreenTimeRing({
  savedMinutes = 0,
  goalMinutes = 0,
  hasGoal = false,
  variant = 'parent',
  dimmed = false,
  countdownTarget,
  countdownStart,
}: DashboardScreenTimeRingProps) {
  const size = 219;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!countdownTarget) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [countdownTarget]);

  const countdownMode = Boolean(countdownTarget && countdownStart);
  const remainingMs = countdownTarget ? countdownTarget.getTime() - now : 0;
  const totalMs =
    countdownTarget && countdownStart
      ? countdownTarget.getTime() - countdownStart.getTime()
      : 0;
  const elapsedMs = countdownTarget && countdownStart ? now - countdownStart.getTime() : 0;

  const countdownProgress =
    countdownMode && totalMs > 0
      ? Math.min(1, Math.max(0, elapsedMs / totalMs))
      : 0;

  const progress =
    countdownMode && totalMs > 0
      ? countdownProgress
      : hasGoal && goalMinutes > 0
        ? Math.min(1, Math.max(0, savedMinutes / goalMinutes))
        : 0;

  const dashOffset = circumference * (1 - progress);
  const countdown = formatCountdown(remainingMs);

  const savedLabel = countdownMode ? (
    <>
      עד סוף
      <br />
      הדיל השבועי
    </>
  ) : variant === 'child' ? (
    <>
      זמן מסך
      <br />
      שחסכתי היום
    </>
  ) : (
    <>
      זמן מסך
      <br />
      שחסכנו היום
    </>
  );

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size, opacity: dimmed ? 0.4 : 1 }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={PARENT_DASHBOARD_COLORS.ringTrack}
          stroke={PARENT_DASHBOARD_COLORS.ringBorder}
          strokeWidth={0.75}
        />
        {(countdownMode || (hasGoal && progress > 0)) && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={PARENT_DASHBOARD_COLORS.mint}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        )}
      </svg>

      <div className="absolute left-[60.5px] top-[52px] flex w-[99px] flex-col items-center gap-[11px] text-center">
        <p
          className="font-simpler text-[16px] font-semibold leading-[18px]"
          style={{ color: PARENT_DASHBOARD_COLORS.mint }}
        >
          {savedLabel}
        </p>
        <div className="flex flex-col items-start">
          {countdownMode ? (
            <p className="w-full text-center font-simpler text-[22px] font-black leading-[26px] text-white" dir="ltr">
              {countdown.days}:{pad2(countdown.hours)}:{pad2(countdown.minutes)}:{pad2(countdown.seconds)}
            </p>
          ) : (
            <p className="font-simpler text-[34px] font-black leading-[39.84px] text-white">
              {formatMinutesLabel(savedMinutes)}
            </p>
          )}
          {!countdownMode ? (
            <p
              className="w-full text-center font-simpler text-[13px] font-normal leading-[16.9px]"
              style={{ color: PARENT_DASHBOARD_COLORS.textMuted }}
            >
              {hasGoal
                ? `מתוך יעד של ${formatMinutesLabel(goalMinutes)}`
                : 'עדיין לא נקבע יעד'}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
