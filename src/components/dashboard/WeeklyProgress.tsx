'use client';

import { useState } from 'react';
import { WeekDay, WeeklyTotals } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatting';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';

interface WeeklyProgressProps {
  week: WeekDay[];
  totals: WeeklyTotals;
  childName?: string;
  childGender?: 'boy' | 'girl';
  totalWeeklyHours?: number;
  weeklyBudget?: number; // תקציב שבועי
  dailyBudget?: number; // תקציב יומי
  weeklyUpload?: WeeklyUpload | null; // Weekly upload status
  onWeeklyUploadClick?: () => void; // Optional click (e.g. scroll to review)
  challenge?: FirestoreChallenge | null; // For inline approval
  onApprove?: () => void;
  onReject?: (reason: string) => void;
}

/** Format minutes as hours + minutes (rounded to whole minutes). */
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
  success: { icon: '✅', borderColor: '#273143', bg: 'bg-[#FFFCF8]' }, // אושר ועמד ביעד
  warning: { icon: '❌', borderColor: '#273143', bg: 'bg-[#FFFCF8]' }, // אושר ולא עמד ביעד
  pending: { icon: '⚠️', borderColor: '#BBE9FD', bg: 'bg-[#FFFCF8]' }, // ממתין להעלאה
  missing: { icon: '⚠️', borderColor: '#273143', bg: 'bg-[#FFFCF8]' }, // נדרשת תמונה להעלאה
  future: { icon: '➖', borderColor: '#273143', bg: 'bg-[#FFFCF8] opacity-50' },
  redemption: { icon: null, borderColor: '#E6F19A', bg: 'bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD]' },
  awaiting_approval: { icon: '⏳', borderColor: '#BBE9FD', bg: 'bg-[#BBE9FD] bg-opacity-30' } // מחכה לאישור הורה
};

function DayBar({ day, maxHours, onClick }: { day: WeekDay; maxHours: number; onClick?: () => void }) {
  const config = statusConfig[day.status] || statusConfig.pending;
  const isClickable = onClick !== undefined && !day.isRedemptionDay && (day.status === 'awaiting_approval' || day.requiresApproval || day.status === 'missing' || day.status === 'success' || day.status === 'warning');
  
  // Calculate bar height as percentage of max hours
  const barHeightPercent = maxHours > 0 ? (day.screenTimeUsed / maxHours) * 100 : 0;
  
  // Determine bar color based on status - using app color palette
  const getBarColor = () => {
    if (day.isRedemptionDay) return 'bg-gradient-to-t from-[#E6F19A] to-[#BBE9FD]';
    if (day.status === 'success') return 'bg-[#E6F19A]'; // Light yellow-green for success
    if (day.status === 'warning') return 'bg-[#E6F19A] opacity-70'; // Lighter version for warning
    if (day.status === 'awaiting_approval' || day.requiresApproval) return 'bg-[#BBE9FD]'; // Light blue from palette
    if (day.status === 'missing') return 'bg-[#273143] opacity-30'; // Very light dark blue-gray
    return 'bg-[#273143] opacity-20';
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
          <div className="w-3/4 h-0 rounded-t-lg" style={{ height: '0' }}>
          </div>
        ) : (
          <div className="w-3/4 h-1 rounded-t-lg bg-[#273143] opacity-20" />
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

      {/* Money earned - show 0 for redemption day, show 0 if earned 0 */}
      <div className="font-varela font-semibold text-[9px] text-[#282743] text-center whitespace-nowrap">
        {day.isRedemptionDay ? 'פדיון!' : `₪${formatNumber(day.coinsEarned)}`}
      </div>
    </div>
  );
}

export default function WeeklyProgress({ week, totals, childName, childGender = 'boy', totalWeeklyHours, weeklyBudget, dailyBudget, weeklyUpload, onWeeklyUploadClick, challenge, onApprove, onReject }: WeeklyProgressProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const showInlineReview = Boolean(weeklyUpload && challenge);
  const displayName = childName || 'הילד/ה';

  // Gender pronouns for child
  const childPronouns = {
    boy: { was: 'היה', earned: 'הרוויח' },
    girl: { was: 'היתה', earned: 'הרוויחה' }
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

  // Calculate approved coins accurately (only days with status 'success' or 'warning')
  // Calculate from original data (before rounding) to avoid rounding errors
  let accurateApprovedCoins = 0;
  if (dailyBudget !== undefined) {
    const approvedDays = week.filter(day => 
      (day.status === 'success' || day.status === 'warning') && !day.isRedemptionDay
    );
    
    for (const day of approvedDays) {
      const screenTimeUsed = day.screenTimeUsed || 0;
      const screenTimeGoal = day.screenTimeGoal || 0;
      
      // Calculate coins earned using the same formula as in upload page
      // If goal met: full daily budget
      // If not met: proportional reduction
      const success = screenTimeUsed <= screenTimeGoal;
      const coinsEarned = success 
        ? dailyBudget 
        : Math.max(0, dailyBudget * (1 - (screenTimeUsed - screenTimeGoal) / screenTimeGoal));
      
      accurateApprovedCoins += coinsEarned;
    }
  } else {
    // Fallback: sum rounded daily values if dailyBudget is not available
    accurateApprovedCoins = week.reduce((sum, day) => {
      if (day.status === 'success' || day.status === 'warning') {
        return sum + (day.coinsEarned || 0);
      }
      return sum;
    }, 0);
  }
  
  // Round the final total to 1 decimal place (not individual daily values)
  const approvedCoins = Math.round(accurateApprovedCoins * 10) / 10;

  // Calculate goal line percent - use average of days with goals, excluding Saturday (redemption day)
  const daysWithGoals = week.filter(day => (day.screenTimeGoal || 0) > 0 && !day.isRedemptionDay);
  const avgGoal = daysWithGoals.length > 0 
    ? daysWithGoals.reduce((sum, day) => sum + (day.screenTimeGoal || 0), 0) / daysWithGoals.length
    : week[0]?.screenTimeGoal || 3; // fallback to 3 hours if no goals found
  const goalLinePercent = maxHours > 0 ? (avgGoal / maxHours) * 100 : 0;

  // Calculate average line percent - use average of actual screen time used, excluding Saturday (redemption day) and days with no data
  const daysWithUsage = week.filter(day => (day.screenTimeUsed || 0) > 0 && !day.isRedemptionDay);
  const avgUsage = daysWithUsage.length > 0 
    ? daysWithUsage.reduce((sum, day) => sum + (day.screenTimeUsed || 0), 0) / daysWithUsage.length
    : 0;
  const avgLinePercent = maxHours > 0 && avgUsage > 0 ? (avgUsage / maxHours) * 100 : 0;

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

  // If week is empty, show empty state
  if (week.length === 0) {
    return (
      <div className="my-4 w-full overflow-visible">
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card mb-4 w-full overflow-visible relative">
          {childName && (
            <h2 className="font-varela font-semibold text-base text-[#282743] mb-3 text-right p-4 pb-3">
              השבוע של {childName}
            </h2>
          )}
          <div className="px-4 pb-6 text-center">
            <p className="font-varela text-sm text-[#948DA9] py-8">
              הגרף יופיע כשהאתגר יתחיל
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 w-full overflow-visible">
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card mb-4 w-full overflow-visible relative">
        {childName && (
          <h2 className="font-varela font-semibold text-base text-[#282743] mb-3 text-right p-4 pb-3">
            השבוע של {childName}
          </h2>
        )}
        
        {/* Only place that shows weekly upload approval status – above the bar chart */}
        {weeklyUpload && (
          <div 
            className={`mx-4 mb-4 py-3 px-4 rounded-[12px] transition-all ${
              weeklyUpload.status === 'pending' 
                ? 'bg-[#BBE9FD] bg-opacity-30 border-2 border-[#BBE9FD]'
                : weeklyUpload.status === 'approved'
                ? 'bg-[#E6F19A] bg-opacity-30 border-2 border-[#E6F19A]'
                : 'bg-red-100 border-2 border-red-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {weeklyUpload.status === 'pending' ? '⏳' : weeklyUpload.status === 'approved' ? '✅' : '❌'}
              </span>
              <p className="font-varela font-semibold text-sm text-[#282743]">
                {weeklyUpload.status === 'pending' 
                  ? 'העלאה ממתינה לאישור'
                  : weeklyUpload.status === 'approved'
                  ? 'ההעלאה השבועית אושרה'
                  : 'העלאה נדחתה'}
              </p>
            </div>
          </div>
        )}
        
        {/* Chart layout - separate container for axes, bars, and labels */}
        <div className="px-4 pb-28">
          {/* Chart with Y-axis */}
          <div className="flex gap-2 w-full">
            {/* Bar chart area with reference line */}
            <div className="flex-1 relative">
              {/* Chart container - this is where bars are rendered, aligned with Y-axis */}
              <div className="relative" style={{ height: '200px' }}>
                {/* Horizontal grid lines - aligned with Y-axis labels */}
                {yAxisLabels.slice().reverse().map((label, index) => {
                  const positionFromBottom = (label / maxHours) * 200;
                  return (
                    <div
                      key={`grid-${index}`}
                      className="absolute left-0 right-0 border-t border-[#273143] opacity-20 z-0 pointer-events-none"
                      style={{
                        bottom: `${positionFromBottom}px`,
                        height: '0'
                      }}
                    />
                  );
                })}

                {/* Reference line for goal - shared across all bars - solid and dark */}
                {avgGoal > 0 && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-[#654321] opacity-90 z-10 pointer-events-none"
                    style={{ 
                      bottom: `${(goalLinePercent / 100) * 200}px`,
                      height: '0'
                    }}
                    title={`יעד יומי: ${formatNumber(avgGoal)} שעות`}
                  />
                )}

                {/* Reference line for average usage - shared across all bars - dashed and dark brown */}
                {avgUsage > 0 && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-dashed border-[#654321] opacity-90 z-10 pointer-events-none"
                    style={{ 
                      bottom: `${(avgLinePercent / 100) * 200}px`,
                      height: '0'
                    }}
                    title={`ממוצע יומי: ${formatNumber(avgUsage)} שעות`}
                  />
                )}

                {/* Bar chart - bars area only - include redemption day but with no Y value */}
                <div className="grid grid-cols-7 gap-2 w-full h-full relative" style={{ height: '200px' }}>
                  {week.map((day, index) => {
                    return (
                      <DayBar 
                        key={index} 
                        day={day} 
                        maxHours={maxHours}
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

        {/* Inline weekly upload review (no popup) */}
        {showInlineReview && weeklyUpload && challenge && (() => {
          const processedData = weeklyUpload.processedData;
          const goalMinutes = (challenge.dailyScreenTimeGoal || 0) * 60 * (challenge.challengeDays || 6);
          const actualMinutes = processedData?.screenTimeMinutes ?? 0;
          const metGoal = actualMinutes <= goalMinutes;
          const actualEarnings = processedData
            ? (metGoal ? challenge.selectedBudget : Math.max(0, challenge.selectedBudget * (1 - (actualMinutes - goalMinutes) / goalMinutes)))
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
            if (!onReject || !rejectReason.trim()) return;
            setIsProcessing(true);
            try {
              await onReject(rejectReason);
              setShowRejectInput(false);
              setRejectReason('');
            } finally {
              setIsProcessing(false);
            }
          };

          return (
            <div className="mx-4 mt-4 mb-4 p-4 rounded-[12px] bg-[#FFFCF8] border-2 border-[#273143] border-opacity-10">
              <h3 className="font-varela font-semibold text-base text-[#273143] mb-3 text-right">סיכום שבועי - אישור העלאה</h3>

              {weeklyUpload.screenshotUrl && (
                <div className="mb-4">
                  <p className="font-varela text-sm text-[#948DA9] mb-2">צילום מסך שהועלה:</p>
                  <img
                    src={weeklyUpload.screenshotUrl}
                    alt="Screenshot"
                    className="w-full max-h-48 object-cover rounded-[12px] border border-gray-200"
                  />
                </div>
              )}

              {processedData && (
                <div className="bg-[#E6F19A] bg-opacity-30 rounded-[12px] p-3 mb-3">
                  <h4 className="font-varela font-semibold text-sm text-[#273143] mb-2">תוצאות בפועל:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#282743]">זמן מסך:</span>
                      <span className="font-varela font-semibold text-[#273143]">{formatTime(processedData.screenTimeMinutes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#282743]">יעד שבועי:</span>
                      <span className="font-varela font-semibold text-[#273143]">{formatTime(goalMinutes)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#273143] border-opacity-20 pt-2 mt-2">
                      <span className="font-varela font-semibold text-[#282743]">רווח בפועל:</span>
                      <span className="font-varela font-bold text-lg text-[#273143]">₪{actualEarningsRounded}</span>
                    </div>
                  </div>
                </div>
              )}

              {weeklyUpload.status === 'pending' && onApprove && onReject && (
                <>
                  {!showRejectInput ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowRejectInput(true)}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-4 rounded-[18px] text-sm font-varela font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        דחה
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-4 rounded-[18px] text-sm font-varela font-semibold bg-[#E6F19A] text-[#273143] hover:bg-opacity-80 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? 'מאשר...' : 'אשר'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="סיבת הדחייה..."
                        className="w-full p-3 rounded-[12px] border border-gray-300 font-varela text-sm resize-none"
                        rows={2}
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                          disabled={isProcessing}
                          className="flex-1 py-3 px-4 rounded-[18px] text-sm font-varela font-semibold border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          ביטול
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isProcessing || !rejectReason.trim()}
                          className="flex-1 py-3 px-4 rounded-[18px] text-sm font-varela font-semibold bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300"
                        >
                          {isProcessing ? 'דוחה...' : 'אשר דחייה'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {/* Separator line - between chart layout and summary layout */}
        {childName && (
          <div className="border-t border-[#273143] opacity-20"></div>
        )}

        {/* Weekly summary layout - separate container */}
        {childName && (
          <div className="px-4 pt-4 pb-4">
            <p className="font-varela font-normal text-[15px] leading-[24px] text-[#282743] text-right">
              {childName} {childP.was} השבוע {formatNumber(approvedHours)} שעות במסך ו{childP.earned} {formatNumber(approvedCoins)} ש"ח מתוך תקציב שבועי של {weeklyBudget ? formatNumber(weeklyBudget) : formatNumber(totals.coinsMaxPossible)} ש"ח
            </p>
          </div>
        )}
      </div>
    </div>
  );
}