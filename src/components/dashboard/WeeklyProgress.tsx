'use client';

import { useState } from 'react';
import { WeekDay, WeeklyTotals } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatting';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';

interface WeeklyProgressProps {
  variant?: 'light' | 'dark';
  week: WeekDay[];
  totals: WeeklyTotals;
  childName?: string;
  childGender?: 'boy' | 'girl';
  totalWeeklyHours?: number;
  weeklyBudget?: number;
  dailyBudget?: number;
  weeklyUpload?: WeeklyUpload | null;
  onWeeklyUploadClick?: () => void;
  challenge?: FirestoreChallenge | null;
  onApprove?: () => void;
  onReject?: () => void;
}

function formatTime(minutes: number): string {
  const totalMins = Math.round(minutes);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) {
    return `${hours} שעות ${mins > 0 ? `ו-${mins} דקות` : ''}`;
  }
  return `${mins} דקות`;
}

const statusConfig = {
  success: { icon: '✅' },
  warning: { icon: '❌' },
  pending: { icon: '⚠️' },
  missing: { icon: '⚠️' },
  future: { icon: '➖' },
  redemption: { icon: null },
  awaiting_approval: { icon: '⏳' },
};

function DayBar({
  day,
  maxHours,
  onClick,
  isDark,
}: {
  day: WeekDay;
  maxHours: number;
  onClick?: () => void;
  isDark: boolean;
}) {
  const config = statusConfig[day.status] || statusConfig.pending;
  const isClickable =
    onClick !== undefined &&
    !day.isRedemptionDay &&
    (day.status === 'awaiting_approval' ||
      day.requiresApproval ||
      day.status === 'missing' ||
      day.status === 'success' ||
      day.status === 'warning');

  const barHeightPercent = maxHours > 0 ? (day.screenTimeUsed / maxHours) * 100 : 0;

  const getBarColor = () => {
    if (isDark) {
      if (day.isRedemptionDay) return 'bg-[#1BECAE]';
      if (day.status === 'success') return 'bg-[#1BECAE]';
      if (day.status === 'warning') return 'bg-[#1BECAE]/60';
      if (day.status === 'awaiting_approval' || day.requiresApproval) return 'bg-v03-turquoise-300';
      if (day.status === 'missing') return 'bg-white/25';
      return 'bg-white/15';
    }
    if (day.isRedemptionDay) return 'bg-v03-turquoise-300';
    if (day.status === 'success') return 'bg-v03-green-200';
    if (day.status === 'warning') return 'bg-v03-green-200/70';
    if (day.status === 'awaiting_approval' || day.requiresApproval) return 'bg-v03-turquoise-300/80';
    if (day.status === 'missing') return 'bg-v03-green-900/30';
    return 'bg-v03-green-900/20';
  };

  const labelPrimary = isDark ? 'text-white' : 'text-v03-text-on-light';
  const labelMuted = isDark ? 'text-v03-green-200' : 'text-v03-green-700';
  const emptyBar = isDark ? 'bg-white/15' : 'bg-v03-green-900/20';

  return (
    <div className="relative flex w-full flex-col items-center">
      <div
        className="relative flex w-full items-end justify-center"
        style={{ minHeight: '200px', height: '200px' }}
      >
        {!day.isRedemptionDay && day.screenTimeUsed > 0 ? (
          <div
            className={`w-3/4 rounded-t-lg ${getBarColor()} transition-all duration-300 ${
              isClickable ? 'cursor-pointer hover:opacity-80' : ''
            }`}
            style={{
              height: `${(barHeightPercent / 100) * 200}px`,
              minHeight: barHeightPercent > 0 ? '4px' : '0',
            }}
            onClick={isClickable ? onClick : undefined}
            title={`${formatNumber(day.screenTimeUsed)} שעות`}
          />
        ) : day.isRedemptionDay ? (
          <div className="h-0 w-3/4 rounded-t-lg" />
        ) : (
          <div className={`h-1 w-3/4 rounded-t-lg ${emptyBar}`} />
        )}
      </div>

      <div className="mb-1 mt-2 w-full text-center">
        <div className={`whitespace-nowrap font-simpler text-[10px] font-bold ${labelPrimary}`}>
          {day.dayName}
        </div>
        <div className={`whitespace-nowrap font-simpler text-[10px] ${labelMuted}`}>{day.date}</div>
      </div>

      <div
        className={`my-1 flex items-center justify-center text-base sm:text-lg ${
          isClickable ? 'cursor-pointer transition-transform hover:scale-110' : ''
        }`}
        onClick={isClickable ? onClick : undefined}
      >
        {day.isRedemptionDay ? '🎉' : config.icon}
      </div>

      <div className={`whitespace-nowrap text-center font-simpler text-[9px] font-bold ${labelPrimary}`}>
        {day.isRedemptionDay ? 'פדיון!' : `₪${formatNumber(day.coinsEarned)}`}
      </div>
    </div>
  );
}

export default function WeeklyProgress({
  variant = 'dark',
  week,
  childName,
  weeklyUpload,
  challenge,
  onApprove,
  onReject,
}: WeeklyProgressProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isDark = variant === 'dark';

  const sectionClass = isDark
    ? 'overflow-hidden rounded-[18px] border border-white/15 bg-white/5 p-4 backdrop-blur-sm'
    : 'overflow-hidden rounded-[22px] border border-v03-green-100 bg-v03-white shadow-sm';

  const titleClass = isDark
    ? 'mb-3 text-right font-simpler text-[15px] font-bold text-white'
    : 'p-4 pb-0 text-right font-simpler text-[16px] font-bold text-v03-text-on-light';

  const emptyTextClass = isDark
    ? 'py-8 text-center font-simpler text-[14px] text-v03-green-200'
    : 'py-8 text-center font-simpler text-[14px] text-v03-green-700';

  const rawMaxHours = Math.max(
    ...week.map((day) => Math.max(day.screenTimeUsed || 0, day.screenTimeGoal || 0)),
    1
  );
  const maxHours = Math.max(rawMaxHours * 1.1, rawMaxHours + 0.5);

  const daysWithGoals = week.filter((day) => (day.screenTimeGoal || 0) > 0 && !day.isRedemptionDay);
  const avgGoal =
    daysWithGoals.length > 0
      ? daysWithGoals.reduce((sum, day) => sum + (day.screenTimeGoal || 0), 0) / daysWithGoals.length
      : week[0]?.screenTimeGoal || 3;

  const daysWithUsage = week.filter((day) => (day.screenTimeUsed || 0) > 0 && !day.isRedemptionDay);
  const avgUsage =
    daysWithUsage.length > 0
      ? daysWithUsage.reduce((sum, day) => sum + (day.screenTimeUsed || 0), 0) / daysWithUsage.length
      : 0;

  const goalLinePercent = maxHours > 0 ? (avgGoal / maxHours) * 100 : 0;
  const avgLinePercent = maxHours > 0 && avgUsage > 0 ? (avgUsage / maxHours) * 100 : 0;

  const yAxisLabels = Array.from({ length: 5 }, (_, i) => (i * maxHours) / 4);

  const showInlineReview = Boolean(weeklyUpload && challenge);
  const processedData = showInlineReview && weeklyUpload ? weeklyUpload.processedData : null;
  const goalMinutes =
    challenge && showInlineReview
      ? (challenge.dailyScreenTimeGoal || 0) * 60 * (challenge.challengeDays || 6)
      : 0;
  const actualMinutes = processedData?.screenTimeMinutes ?? 0;
  const metGoal = goalMinutes <= 0 || actualMinutes <= goalMinutes;
  const actualEarnings =
    processedData && challenge
      ? metGoal
        ? challenge.selectedBudget
        : Math.max(
            0,
            goalMinutes > 0
              ? challenge.selectedBudget * (1 - (actualMinutes - goalMinutes) / goalMinutes)
              : 0
          )
      : 0;
  const actualEarningsRounded = Math.round(actualEarnings * 10) / 10;

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    try {
      await onApprove();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    try {
      await onReject();
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadBannerClass =
    weeklyUpload?.status === 'pending'
      ? isDark
        ? 'border-[#1BECAE]/40 bg-[#1BECAE]/10'
        : 'border-v03-turquoise-300 bg-v03-turquoise-300/15'
      : isDark
        ? 'border-white/20 bg-white/5'
        : 'border-v03-green-200 bg-v03-green-200/25';

  const resultsBoxClass = isDark
    ? 'rounded-[14px] bg-white/5 px-4 py-3'
    : 'rounded-[16px] bg-v03-green-200/25 px-4 py-3';

  const gridLineClass = isDark ? 'border-white/10' : 'border-v03-green-900/20';
  const goalLineClass = isDark ? 'border-[#1BECAE]' : 'border-v03-green-900/80';
  const avgLineClass = isDark ? 'border-dashed border-white/40' : 'border-dashed border-v03-green-700/80';
  const yAxisClass = isDark ? 'text-v03-green-200' : 'text-v03-green-700';

  if (week.length === 0) {
    return (
      <section className={`${sectionClass} ${isDark ? '' : 'p-4'}`}>
        {childName && <h2 className={titleClass}>זמן מסך — {childName}</h2>}
        <p className={emptyTextClass}>הגרף יופיע כשהאתגר יתחיל</p>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      {childName && (
        <h2 className={isDark ? titleClass : titleClass}>זמן מסך — {childName}</h2>
      )}

      {weeklyUpload && weeklyUpload.status !== 'rejected' && (
        <div className={`mb-3 rounded-[14px] border-2 px-3 py-2.5 ${uploadBannerClass}`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">{weeklyUpload.status === 'pending' ? '⏳' : '✅'}</span>
            <p
              className={`font-simpler text-[13px] font-bold ${isDark ? 'text-white' : 'text-v03-text-on-light'}`}
            >
              {weeklyUpload.status === 'pending' ? 'העלאה ממתינה לאישור' : 'ההעלאה השבועית אושרה'}
            </p>
          </div>
        </div>
      )}

      {showInlineReview && processedData && weeklyUpload?.status !== 'rejected' && (
        <div className="mb-3">
          <div className={resultsBoxClass}>
            <h4
              className={`mb-2 font-simpler text-[13px] font-bold ${isDark ? 'text-white' : 'text-v03-text-on-light'}`}
            >
              תוצאות שבועיות
            </h4>
            <div className="flex flex-col items-start gap-1 text-[13px]">
              <div className="flex gap-3">
                <span className={isDark ? 'text-v03-green-200' : 'text-v03-green-700'}>זמן מסך:</span>
                <span className={`font-simpler font-bold ${isDark ? 'text-white' : 'text-v03-text-on-light'}`}>
                  {formatTime(processedData.screenTimeMinutes)}
                </span>
              </div>
              <div className="flex gap-3">
                <span className={isDark ? 'text-v03-green-200' : 'text-v03-green-700'}>רווח:</span>
                <span className={`font-simpler font-bold ${isDark ? 'text-white' : 'text-v03-text-on-light'}`}>
                  ₪{actualEarningsRounded}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${isDark ? '' : 'px-4 pb-6 pt-2'}`}>
        {isDark && (
          <div className="mb-2 flex items-center justify-end gap-4 font-simpler text-[10px] text-v03-green-200">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 border-t-2 border-[#1BECAE]" /> יעד
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-0 w-4 border-t-2 border-dashed border-white/40" /> ממוצע
            </span>
          </div>
        )}

        <div className="flex w-full gap-2">
          <div className="relative flex-1">
            <div className="relative" style={{ height: '200px' }}>
              {yAxisLabels
                .slice()
                .reverse()
                .map((label, index) => {
                  const positionFromBottom = (label / maxHours) * 200;
                  return (
                    <div
                      key={`grid-${index}`}
                      className={`pointer-events-none absolute left-0 right-0 z-0 border-t ${gridLineClass}`}
                      style={{ bottom: `${positionFromBottom}px`, height: '0' }}
                    />
                  );
                })}

              {avgGoal > 0 && (
                <div
                  className={`pointer-events-none absolute left-0 right-0 z-10 border-t-2 ${goalLineClass}`}
                  style={{ bottom: `${(goalLinePercent / 100) * 200}px`, height: '0' }}
                  title={`יעד יומי: ${formatNumber(avgGoal)} שעות`}
                />
              )}

              {avgUsage > 0 && (
                <div
                  className={`pointer-events-none absolute left-0 right-0 z-10 border-t-2 ${avgLineClass}`}
                  style={{ bottom: `${(avgLinePercent / 100) * 200}px`, height: '0' }}
                  title={`ממוצע יומי: ${formatNumber(avgUsage)} שעות`}
                />
              )}

              <div className="relative grid h-full w-full grid-cols-7 gap-1.5" style={{ height: '200px' }}>
                {week.map((day, index) => (
                  <DayBar key={index} day={day} maxHours={maxHours} isDark={isDark} />
                ))}
              </div>
            </div>
          </div>

          <div className="relative pl-1" style={{ height: '200px', width: '36px' }}>
            {yAxisLabels
              .slice()
              .reverse()
              .map((label, index) => {
                const positionFromBottom = (label / maxHours) * 200;
                return (
                  <div
                    key={index}
                    className={`absolute font-simpler text-[9px] ${yAxisClass}`}
                    style={{
                      bottom: `${positionFromBottom}px`,
                      transform: 'translateY(50%)',
                      left: '0',
                    }}
                  >
                    {formatNumber(label)}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {showInlineReview && weeklyUpload?.status === 'pending' && onApprove && onReject && (
        <div className="mt-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={isProcessing}
              className={`flex-1 rounded-[16px] border px-3 py-2.5 font-simpler text-[13px] font-bold transition disabled:opacity-50 ${
                isDark
                  ? 'border-red-300/60 text-red-200 hover:bg-red-500/10'
                  : 'border-2 border-red-400 text-red-500 hover:bg-red-50'
              }`}
            >
              דחה
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isProcessing}
              className={`flex-1 rounded-[16px] px-3 py-2.5 font-simpler text-[13px] font-bold transition disabled:opacity-50 ${
                isDark
                  ? 'bg-white text-v03-green-900 hover:brightness-95'
                  : 'bg-v03-green-900 text-white hover:brightness-95'
              }`}
            >
              {isProcessing ? 'מאשר...' : 'אשר'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
