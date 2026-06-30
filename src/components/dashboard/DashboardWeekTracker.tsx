'use client';

import type { WeekDay } from '@/types/dashboard';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';
import { formatScreenTimeGoalHours } from '@/utils/formatting';

type DashboardWeekTrackerProps = {
  week: WeekDay[];
  dailyScreenTimeGoal: number;
  childName?: string;
};

function dayLetter(dayName: string): string {
  const map: Record<string, string> = {
    'א׳': 'א',
    'ב׳': 'ב',
    'ג׳': 'ג',
    'ד׳': 'ד',
    'ה׳': 'ה',
    'ו׳': 'ו',
    'ש׳': 'ש',
  };
  return map[dayName] || dayName.charAt(0);
}

function isDone(status: WeekDay['status']): boolean {
  return status === 'success' || status === 'warning' || status === 'awaiting_approval';
}

function DayCircle({ day }: { day: WeekDay }) {
  const done = isDone(day.status);
  const minutes = Math.round((day.screenTimeUsed || 0) * 60);

  return (
    <div className="relative flex h-[73px] flex-col items-center justify-center gap-2">
      <span className="font-simpler text-[12px] font-bold leading-[15.6px] text-white">
        {dayLetter(day.dayName)}
      </span>

      {done ? (
        <div
          className="relative flex h-[32.5px] w-[32.5px] items-center justify-center rounded-full shadow-[0_3.4px_3.4px_rgba(0,0,0,0.25)]"
          style={{ background: PARENT_DASHBOARD_COLORS.purpleDone }}
        >
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden>
            <path
              d="M1 5.5L5 9.5L13 1.5"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : day.isRedemptionDay ? (
        <div
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-sm"
          style={{
            background: PARENT_DASHBOARD_COLORS.mintBright,
            color: PARENT_DASHBOARD_COLORS.canvas,
          }}
        >
          🎉
        </div>
      ) : (
        <div
          className="h-[30px] w-[30px] rounded-full border-[1.25px] border-[#888888]"
          style={{ background: PARENT_DASHBOARD_COLORS.dayPending }}
        />
      )}

      {done && minutes > 0 && (
        <span className="text-center font-simpler text-[12px] font-light leading-4 text-white">
          {minutes}
          <br />
          דק׳
        </span>
      )}
    </div>
  );
}

export function DashboardWeekTracker({
  week,
  dailyScreenTimeGoal,
  childName,
}: DashboardWeekTrackerProps) {
  const goalLabel =
    dailyScreenTimeGoal > 0
      ? `לעמוד ביעד של ${formatScreenTimeGoalHours(dailyScreenTimeGoal)} זמן מסך ביום`
      : 'יעד האתגר יופיע כאן כשהאתגר יתחיל';

  if (week.length === 0) {
    return (
      <section
        className="w-full rounded-[32px] px-[18px] py-[25px]"
        style={{
          background: PARENT_DASHBOARD_COLORS.cardBg,
          outline: `1px solid ${PARENT_DASHBOARD_COLORS.cardOutline}`,
          outlineOffset: -1,
        }}
      >
        <p className="text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
          {childName ? `השבוע של ${childName}` : 'מעקב שבועי'}
        </p>
        <p className="mt-3 text-center font-simpler text-[14px] text-[#B9C9CB]">
          הגרף יופיע כשהאתגר יתחיל
        </p>
      </section>
    );
  }

  return (
    <section
      className="w-full rounded-[32px] px-[18px] pb-5 pt-[25px]"
      style={{
        background: PARENT_DASHBOARD_COLORS.cardBg,
        outline: `1px solid ${PARENT_DASHBOARD_COLORS.cardOutline}`,
        outlineOffset: -1,
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <p className="text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
          {childName ? `השבוע של ${childName}` : 'היעד השבועי'}
        </p>
        <p className="text-center font-simpler text-[24px] font-black leading-[30px] text-white">
          {goalLabel}
        </p>
      </div>

      <div
        className="my-5 h-px w-full"
        style={{ background: '#586D66' }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-1">
        {[...week].reverse().map((day, index) => (
          <DayCircle key={`${day.date}-${index}`} day={day} />
        ))}
      </div>
    </section>
  );
}
