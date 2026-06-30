'use client';

import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';

type DashboardScreenTimeRingProps = {
  savedMinutes: number;
  goalMinutes: number;
  hasGoal: boolean;
};

function formatMinutesLabel(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded === 0) return '0 דקות';
  if (rounded < 60) return `${rounded} דקות`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m > 0 ? `${h} שעות ו-${m} דקות` : `${h} שעות`;
}

export function DashboardScreenTimeRing({
  savedMinutes,
  goalMinutes,
  hasGoal,
}: DashboardScreenTimeRingProps) {
  const size = 219;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress =
    hasGoal && goalMinutes > 0 ? Math.min(1, Math.max(0, savedMinutes / goalMinutes)) : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={PARENT_DASHBOARD_COLORS.ringTrack}
          stroke={PARENT_DASHBOARD_COLORS.ringBorder}
          strokeWidth={0.75}
        />
        {hasGoal && progress > 0 && (
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

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p
          className="mb-2 font-simpler text-[16px] font-semibold leading-[18px]"
          style={{ color: PARENT_DASHBOARD_COLORS.mint }}
        >
          זמן מסך
          <br />
          שחסכנו היום
        </p>
        <p className="font-simpler text-[34px] font-black leading-[40px] text-white">
          {formatMinutesLabel(savedMinutes)}
        </p>
        <p
          className="mt-1 font-simpler text-[13px] font-normal leading-[17px]"
          style={{ color: PARENT_DASHBOARD_COLORS.textMuted }}
        >
          {hasGoal ? `מתוך יעד של ${formatMinutesLabel(goalMinutes)}` : 'עדיין לא נקבע יעד'}
        </p>
      </div>
    </div>
  );
}
