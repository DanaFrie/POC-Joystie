'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { WeekDay } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatting';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('DaysSummaryModal');

interface DaysSummaryModalProps {
  days: WeekDay[];
  childName: string;
  childGender?: 'boy' | 'girl';
  uploadUrl: string;
  dailyBudget: number;
  dailyScreenTimeGoal?: number; // יעד יומי בדקות
  onApprove?: (dayDate: string, manualScreenTimeMinutes?: number) => Promise<void>;
  onClose: () => void;
  onDaysUpdated?: (updatedDays: WeekDay[]) => void;
}

export default function DaysSummaryModal({ 
  days, 
  childName,
  childGender = 'boy',
  uploadUrl,
  dailyBudget,
  dailyScreenTimeGoal,
  onApprove, 
  onClose,
  onDaysUpdated
}: DaysSummaryModalProps) {
  const [currentDays, setCurrentDays] = useState<WeekDay[]>(days);

  // Update days when prop changes
  useEffect(() => {
    setCurrentDays(days);
    // Initialize manual entry state for each day
    const initialManualEntry: Record<string, boolean> = {};
    const initialManualMinutes: Record<string, number | ''> = {};
    days.forEach(day => {
      initialManualEntry[day.date] = false;
      initialManualMinutes[day.date] = day.screenTimeMinutes || (day.screenTimeUsed * 60);
    });
    setManualEntryEnabled(initialManualEntry);
    setManualScreenTimeMinutes(initialManualMinutes);
  }, [days]);
  const [processingDays, setProcessingDays] = useState<Set<string>>(new Set());
  const [manualEntryEnabled, setManualEntryEnabled] = useState<Record<string, boolean>>({});
  const [manualScreenTimeMinutes, setManualScreenTimeMinutes] = useState<Record<string, number | ''>>({});

  const handleApprove = async (dayDate: string) => {
    if (!onApprove) return;
    
    // Check if manual entry is enabled but no value provided
    if (manualEntryEnabled[dayDate] && (manualScreenTimeMinutes[dayDate] === '' || manualScreenTimeMinutes[dayDate] === null || manualScreenTimeMinutes[dayDate] === undefined)) {
      alert('אנא הכנס זמן מסך ידנית או בטל את סימון התיבה');
      return;
    }
    
    setProcessingDays(prev => new Set(prev).add(dayDate));
    try {
      const minutesToUse = manualEntryEnabled[dayDate] && manualScreenTimeMinutes[dayDate] !== '' 
        ? Number(manualScreenTimeMinutes[dayDate]) 
        : undefined;
      await onApprove(dayDate, minutesToUse);
      // Wait a bit for data to update
      await new Promise(resolve => setTimeout(resolve, 500));
      // Remove the approved day from the list
      const updatedDays = currentDays.filter(day => day.date !== dayDate);
      setCurrentDays(updatedDays);
      if (onDaysUpdated) {
        onDaysUpdated(updatedDays);
      }
    } catch (error) {
      logger.error('Error approving day:', error);
    } finally {
      setProcessingDays(prev => {
        const next = new Set(prev);
        next.delete(dayDate);
        return next;
      });
    }
  };


  const isProcessing = (dayDate: string) => processingDays.has(dayDate);

  // Gender pronouns for child
  const childPronouns = {
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', earned: 'הרוויח', lost: 'ירד לו', stands: 'עומד', gave: 'נתן' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', earned: 'הרוויחה', lost: 'ירד לה', stands: 'עומדת', gave: 'נתנה' }
  };
  const childP = childPronouns[childGender] || childPronouns.boy;

  // Check if any day is being processed
  const isAnyProcessing = processingDays.size > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Loading overlay */}
        {isAnyProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-80 rounded-[18px] flex items-center justify-center z-10">
            <div className="text-center">
              <div className="font-varela text-lg text-[#262135] mb-4">מעבד...</div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#262135] mx-auto"></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-varela font-semibold text-xl text-[#262135]">
            {dailyScreenTimeGoal ? `יעד יומי ${formatNumber(dailyScreenTimeGoal * 60)} דקות` : 'סיכום ימים'}
          </h2>
          <button
            onClick={onClose}
            disabled={isAnyProcessing}
            className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className={`space-y-4 ${isAnyProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
          {currentDays.length === 0 ? (
            <p className="font-varela text-base text-[#282743] text-center py-4">
              כל הימים טופלו
            </p>
          ) : (
            currentDays.map((day, index) => {
            const goalMet = day.screenTimeUsed <= day.screenTimeGoal;
            const needsApproval = day.status === 'awaiting_approval' || day.requiresApproval;
            const needsUpload = day.status === 'missing';
            const isApproved = day.parentAction === 'approved';
            const processing = isProcessing(day.date);
            const isScreenTimeZero = (day.screenTimeMinutes || (day.screenTimeUsed * 60)) === 0;
            const enableManualForDay = manualEntryEnabled[day.date] || false;
            // If manual entry is enabled, use the value from state (even if empty), otherwise use original value
            const manualMinutesForDay = enableManualForDay
              ? (manualScreenTimeMinutes[day.date] !== undefined ? manualScreenTimeMinutes[day.date] : '')
              : (day.screenTimeMinutes || (day.screenTimeUsed * 60));

            // Calculate coins based on current screen time (manual or original)
            const currentScreenTimeHours = enableManualForDay && manualMinutesForDay !== '' 
              ? (Number(manualMinutesForDay) / 60) 
              : day.screenTimeUsed;
            const currentGoalMet = currentScreenTimeHours <= day.screenTimeGoal;
            const coinsMaxPossible = dailyBudget;
            const currentCoinsEarned = currentGoalMet 
              ? coinsMaxPossible 
              : Math.max(0, coinsMaxPossible * (1 - (currentScreenTimeHours - day.screenTimeGoal) / day.screenTimeGoal));
            const currentCoinsEarnedRounded = Math.round(currentCoinsEarned * 10) / 10;
            const currentCoinsLost = Math.max(0, coinsMaxPossible - currentCoinsEarnedRounded);

            // Calculate coins lost for exceeded goal (using original day data for display when not in manual mode)
            // Use dailyBudget from challenge data (passed as prop, not hardcoded)
            const hourlyRate = dailyBudget / day.screenTimeGoal;
            const coinsLost = Math.max(0, coinsMaxPossible - day.coinsEarned);

            return (
              <div key={index} className="border-2 border-gray-200 rounded-[12px] p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-varela font-semibold text-base text-[#262135]">
                    {day.dayName} {day.date}
                  </h3>
                  <div className="text-xl">
                    {needsApproval ? '⏳' : needsUpload ? '⚠️' : isApproved && goalMet ? '✅' : isApproved && !goalMet ? '❌' : '➖'}
                  </div>
                </div>

                {/* Status info */}
                <div className="mb-3">
                  <div className="space-y-1 font-varela text-sm text-[#282743]">
                    {needsApproval && (
                      <>
                        <p>זמן מסך מזוהה: <strong>{formatNumber(day.screenTimeMinutes || (day.screenTimeUsed * 60))} {(day.screenTimeMinutes || (day.screenTimeUsed * 60)) === 1 ? 'דקה' : 'דקות'}</strong></p>
                        {!enableManualForDay && (
                          <>
                            <p>
                              כסף שהרוויח:{' '}
                              <strong className="text-green-600">
                                ₪{formatNumber(day.coinsEarned)}
                              </strong>
                            </p>
                            {coinsLost > 0 && (
                              <p>
                                כסף שהפסיד:{' '}
                                <strong className="text-red-600">
                                  ₪{formatNumber(coinsLost)}
                                </strong>
                              </p>
                            )}
                          </>
                        )}
                        {enableManualForDay && (
                          <>
                            <p>
                              כסף שהרוויח:{' '}
                              <strong className="text-green-600">
                                ₪{formatNumber(currentCoinsEarnedRounded)}
                              </strong>
                            </p>
                            {(currentCoinsLost > 0 || enableManualForDay) && (
                              <p>
                                כסף שהפסיד:{' '}
                                <strong className="text-red-600">
                                  ₪{formatNumber(currentCoinsLost)}
                                </strong>
                              </p>
                            )}
                          </>
                        )}
                      </>
                    )}
                    {needsUpload && (
                      <p>
                        זמן מסך: <strong>{childName} עדיין לא נתן את הסטטוס שלו על היום הזה</strong>
                      </p>
                    )}
                    {isApproved && !needsApproval && !needsUpload && (
                      <>
                        <p>זמן מסך: <strong>{formatNumber(day.screenTimeUsed * 60)} {day.screenTimeUsed * 60 === 1 ? 'דקה' : 'דקות'}</strong></p>
                        <p>
                          כסף שהרוויח:{' '}
                          <strong className="text-green-600">
                            ₪{formatNumber(day.coinsEarned)}
                          </strong>
                        </p>
                        {coinsLost > 0 && (
                          <p>
                            כסף שהפסיד:{' '}
                            <strong className="text-red-600">
                              ₪{formatNumber(coinsLost)}
                            </strong>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* אזהרה אם זמן מסך הוא 0 */}
                {needsApproval && isScreenTimeZero && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-3 mb-3">
                    <p className="font-varela text-xs text-[#262135] text-center leading-relaxed">
                      <strong>⚠️ שימו לב:</strong> זמן המסך שזוהה הוא 0 דקות. כנראה משהו לא עבד טוב בעיבוד, מומלץ להכניס ידנית.
                    </p>
                  </div>
                )}

                {/* צ'ק בוקס להכנסה ידנית - רק לימים שדורשים אישור */}
                {needsApproval && (
                  <div className="bg-gray-50 rounded-[12px] p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableManualForDay}
                        onChange={(e) => {
                          setManualEntryEnabled(prev => ({
                            ...prev,
                            [day.date]: e.target.checked
                          }));
                          if (!e.target.checked) {
                            // When disabling, reset to original value
                            setManualScreenTimeMinutes(prev => ({
                              ...prev,
                              [day.date]: day.screenTimeMinutes || (day.screenTimeUsed * 60)
                            }));
                          } else {
                            // When enabling, initialize with empty string to show placeholder
                            setManualScreenTimeMinutes(prev => ({
                              ...prev,
                              [day.date]: ''
                            }));
                          }
                        }}
                        disabled={processing}
                        className="mt-1 w-5 h-5 text-[#273143] border-gray-300 rounded focus:ring-[#273143]"
                      />
                      <div className="flex-1">
                        <span className="font-varela font-semibold text-sm text-[#262135] block mb-1">
                          הכנסה ידנית של זמן מסך
                        </span>
                        <label className="block font-varela text-xs text-[#282743] mb-1">
                          זמן מסך (דקות)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={manualMinutesForDay === '' || manualMinutesForDay === null || manualMinutesForDay === undefined ? '' : String(manualMinutesForDay)}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            // Allow empty string - user can delete all numbers
                            if (inputValue === '') {
                              setManualScreenTimeMinutes(prev => ({
                                ...prev,
                                [day.date]: ''
                              }));
                              return;
                            }
                            // Remove any non-numeric characters
                            const numericValue = inputValue.replace(/[^0-9]/g, '');
                            if (numericValue === '') {
                              // If after removing non-numeric chars it's empty, set to empty
                              setManualScreenTimeMinutes(prev => ({
                                ...prev,
                                [day.date]: ''
                              }));
                            } else {
                              const numValue = parseInt(numericValue, 10);
                              if (!isNaN(numValue) && numValue >= 0) {
                                setManualScreenTimeMinutes(prev => ({
                                  ...prev,
                                  [day.date]: numValue
                                }));
                              } else {
                                // If parsing fails, keep it empty
                                setManualScreenTimeMinutes(prev => ({
                                  ...prev,
                                  [day.date]: ''
                                }));
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Don't reset on blur - let user keep it empty if they want
                          }}
                          disabled={!enableManualForDay || processing}
                          className={`w-full p-2 border-2 rounded-[8px] font-varela text-sm ${
                            enableManualForDay 
                              ? 'border-[#273143] bg-white' 
                              : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                          }`}
                          placeholder="הכנס דקות"
                        />
                        <p className="font-varela text-xs text-[#948DA9] mt-1">
                          {enableManualForDay ? 'החישוב יעודכן אוטומטית' : 'סמן את התיבה כדי להכניס ידנית'}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Screenshot if available - לא מוצגת אם האישור היה ידני */}
                {day.screenshotUrl && day.approvalType !== 'manual' && (
                  <div className="mb-3">
                    <div className="relative w-24 h-24 rounded-[8px] overflow-hidden border-2 border-gray-200">
                      <Image
                        src={day.screenshotUrl}
                        alt="Screenshot"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Actions for days that need approval */}
                {needsApproval && onApprove && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(day.date)}
                      disabled={processing}
                      className="w-full py-2 px-3 rounded-[8px] font-varela font-semibold text-sm bg-[#273143] text-white hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                      אשר
                    </button>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}

