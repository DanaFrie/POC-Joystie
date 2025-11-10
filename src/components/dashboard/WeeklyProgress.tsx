'use client';

import { WeekDay, WeeklyTotals } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatting';

interface WeeklyProgressProps {
  week: WeekDay[];
  totals: WeeklyTotals;
  childName?: string;
  childGender?: 'boy' | 'girl';
  totalWeeklyHours?: number;
  weeklyBudget?: number; // תקציב שבועי
  onDayClick?: (day: WeekDay) => void;
}

const statusConfig = {
  success: { icon: '✅', borderColor: '#000000', bg: 'bg-[#FFFCF8]' }, // אושר ועמד ביעד
  warning: { icon: '❌', borderColor: '#ffc107', bg: 'bg-[#FFFCF8]' }, // אושר ולא עמד ביעד
  pending: { icon: '⚠️', borderColor: '#007AFF', bg: 'bg-[#FFFCF8]' }, // ממתין להעלאה
  missing: { icon: '⚠️', borderColor: '#dc3545', bg: 'bg-[#FFFCF8]' }, // נדרשת תמונה להעלאה
  future: { icon: '➖', borderColor: '#ddd', bg: 'bg-[#F6F6F6] opacity-50' },
  redemption: { icon: null, borderColor: '#8bc34a', bg: 'bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD]' },
  awaiting_approval: { icon: '⏳', borderColor: '#007AFF', bg: 'bg-[#BBE9FD] bg-opacity-30' }, // מחכה לאישור הורה
  rejected: { icon: '🔄', borderColor: '#dc3545', bg: 'bg-[#FFE5E5] bg-opacity-30' }
};

function DayBar({ day, maxHours, onClick }: { day: WeekDay; maxHours: number; onClick?: () => void }) {
  const config = statusConfig[day.status] || statusConfig.pending;
  const isClickable = onClick !== undefined && !day.isRedemptionDay && (day.status === 'awaiting_approval' || day.requiresApproval);
  
  // Calculate bar height as percentage of max hours
  const barHeightPercent = maxHours > 0 ? (day.screenTimeUsed / maxHours) * 100 : 0;
  
  // Determine bar color based on status
  const getBarColor = () => {
    if (day.isRedemptionDay) return 'bg-gradient-to-t from-[#E6F19A] to-[#BBE9FD]';
    if (day.status === 'success') return 'bg-green-500';
    if (day.status === 'warning') return 'bg-yellow-500';
    if (day.status === 'awaiting_approval' || day.requiresApproval) return 'bg-blue-400';
    if (day.status === 'rejected') return 'bg-red-400';
    if (day.status === 'pending' || day.status === 'missing') return 'bg-gray-400';
    return 'bg-gray-300';
  };

  return (
    <div className="flex flex-col items-center relative w-full">
      {/* Chart area with bars - aligned with Y-axis */}
      <div className="relative w-full flex items-end justify-center" style={{ minHeight: '200px', height: '200px' }}>
        {/* Bar */}
        {!day.isRedemptionDay && day.screenTimeUsed > 0 ? (
          <div
            className={`w-3/4 rounded-t-lg ${getBarColor()} transition-all duration-300 relative ${
              isClickable ? 'cursor-pointer hover:opacity-80' : ''
            }`}
            style={{ 
              height: `${(barHeightPercent / 100) * 200}px`, 
              minHeight: barHeightPercent > 0 ? '4px' : '0' 
            }}
            onClick={isClickable ? onClick : undefined}
            title={`${formatNumber(day.screenTimeUsed)} שעות`}
          />
        ) : day.isRedemptionDay ? (
          <div className="w-3/4 h-full rounded-t-lg bg-gradient-to-t from-[#E6F19A] to-[#BBE9FD] flex items-center justify-center" style={{ height: '200px' }}>
            <span className="text-2xl">🎉</span>
          </div>
        ) : (
          <div className="w-3/4 h-1 rounded-t-lg bg-gray-200" />
        )}
      </div>

      {/* Day label and date */}
      <div className="w-full text-center mb-1 mt-2">
        <div className="font-varela font-bold text-[10px] text-[#282743] whitespace-nowrap">
          {day.dayName}
        </div>
        <div className="font-varela text-[10px] text-[#948DA9] whitespace-nowrap">
          {day.date}
        </div>
      </div>

      {/* Icon - clickable if awaiting approval */}
      <div 
        className={`text-base sm:text-lg my-1 flex items-center justify-center ${
          isClickable ? 'cursor-pointer hover:scale-110 transition-transform' : ''
        }`}
        onClick={isClickable ? onClick : undefined}
      >
        {day.isRedemptionDay ? '🎉' : config.icon}
      </div>

      {/* Money earned */}
      <div className="font-varela font-semibold text-[9px] text-[#282743] text-center whitespace-nowrap">
        {day.isRedemptionDay ? 'פדיון!' : `₪${formatNumber(day.coinsEarned)}`}
      </div>
    </div>
  );
}

export default function WeeklyProgress({ week, totals, childName, childGender = 'boy', totalWeeklyHours, weeklyBudget, onDayClick }: WeeklyProgressProps) {
  // Gender pronouns for child
  const childPronouns = {
    boy: { was: 'היה', earned: 'זכה' },
    girl: { was: 'היתה', earned: 'זכתה' }
  };
  const childP = childPronouns[childGender] || childPronouns.boy;

  // Calculate max hours for scaling the bars - add padding to ensure goal line is visible
  const rawMaxHours = Math.max(
    ...week.map(day => Math.max(day.screenTimeUsed || 0, day.screenTimeGoal || 0)),
    1 // Minimum of 1 hour to avoid division by zero
  );
  // Add 10% padding or at least 0.5 hours to ensure goal line is visible
  const maxHours = Math.max(rawMaxHours * 1.1, rawMaxHours + 0.5);

  // Calculate approved hours (only days with status 'success' or 'warning')
  const approvedHours = week.reduce((sum, day) => {
    if (day.status === 'success' || day.status === 'warning') {
      return sum + (day.screenTimeUsed || 0);
    }
    return sum;
  }, 0);

  // Calculate approved coins (only days with status 'success' or 'warning')
  const approvedCoins = week.reduce((sum, day) => {
    if (day.status === 'success' || day.status === 'warning') {
      return sum + (day.coinsEarned || 0);
    }
    return sum;
  }, 0);

  // Calculate goal line percent - use the first day with a goal > 0, or average of days with goals
  const daysWithGoals = week.filter(day => (day.screenTimeGoal || 0) > 0);
  const avgGoal = daysWithGoals.length > 0 
    ? daysWithGoals.reduce((sum, day) => sum + (day.screenTimeGoal || 0), 0) / daysWithGoals.length
    : week[0]?.screenTimeGoal || 3; // fallback to 3 hours if no goals found
  const goalLinePercent = maxHours > 0 ? (avgGoal / maxHours) * 100 : 0;

  // Generate Y-axis labels (hours)
  const generateYAxisLabels = () => {
    const labels: number[] = [];
    const numLabels = 5;
    const step = maxHours / (numLabels - 1);
    for (let i = 0; i < numLabels; i++) {
      labels.push(i * step);
    }
    return labels;
  };

  const yAxisLabels = generateYAxisLabels();

  return (
    <div className="my-4 w-full overflow-visible">
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card mb-4 w-full overflow-visible relative">
        {childName && (
          <h2 className="font-varela font-semibold text-base text-[#282743] mb-3 text-right p-4 pb-3">
            השבוע של {childName}
          </h2>
        )}
        
        {/* Chart layout - separate container for axes, bars, and labels */}
        <div className="px-4 pb-6">
          {/* Chart with Y-axis */}
          <div className="flex gap-2 w-full">
            {/* Bar chart area with reference line */}
            <div className="flex-1 relative">
              {/* Chart container - this is where bars are rendered, aligned with Y-axis */}
              <div className="relative" style={{ height: '200px' }}>
                {/* Reference line for goal - shared across all bars */}
                {avgGoal > 0 && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-dashed border-[#273143] opacity-60 z-10 pointer-events-none"
                    style={{ 
                      bottom: `${(goalLinePercent / 100) * 200}px`,
                      height: '0'
                    }}
                    title={`יעד יומי: ${formatNumber(avgGoal)} שעות`}
                  />
                )}

                {/* Bar chart - bars area only */}
                <div className="grid grid-cols-7 gap-2 w-full h-full relative" style={{ height: '200px' }}>
                  {week.map((day, index) => {
                    return (
                      <DayBar 
                        key={index} 
                        day={day} 
                        maxHours={maxHours}
                        onClick={onDayClick ? () => onDayClick(day) : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Y-axis - on the right side, aligned with bars area (0 at bottom of bars, max at top) */}
            <div className="relative pl-2" style={{ height: '200px', width: '45px' }}>
              {yAxisLabels.slice().reverse().map((label, index) => {
                // Calculate position from bottom: 0.0 at bottom (0px), max at top (200px)
                const positionFromBottom = (label / maxHours) * 200;
                return (
                  <div
                    key={index}
                    className="absolute font-varela text-[10px] text-[#948DA9]"
                    style={{
                      bottom: `${positionFromBottom}px`,
                      transform: 'translateY(50%)', // Center the label on the line
                      left: '0'
                    }}
                  >
                    {formatNumber(label)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Separator line - between chart layout and summary layout */}
        {childName && (
          <div className="border-t border-gray-200"></div>
        )}

        {/* Weekly summary layout - separate container */}
        {childName && (
          <div className="px-4 pt-4 pb-4">
            <p className="font-varela font-normal text-[15px] leading-[24px] text-[#282743] text-right">
              {childName} {childP.was} השבוע {formatNumber(approvedHours)} שעות במסך ו{childP.earned} ב{formatNumber(approvedCoins)} ש"ח מתוך תקציב שבועי של {weeklyBudget ? formatNumber(weeklyBudget) : formatNumber(totals.coinsMaxPossible)} ש"ח
            </p>
          </div>
        )}
      </div>
    </div>
  );
}