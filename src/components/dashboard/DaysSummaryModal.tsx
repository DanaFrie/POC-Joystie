'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { WeekDay } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatting';

interface DaysSummaryModalProps {
  days: WeekDay[];
  childName: string;
  childGender?: 'boy' | 'girl';
  uploadUrl: string;
  onApprove?: (dayDate: string) => Promise<void>;
  onReject?: (dayDate: string) => Promise<void>;
  onClose: () => void;
  onDaysUpdated?: (updatedDays: WeekDay[]) => void;
}

export default function DaysSummaryModal({ 
  days, 
  childName,
  childGender = 'boy',
  uploadUrl,
  dailyBudget,
  onApprove, 
  onReject, 
  onClose,
  onDaysUpdated
}: DaysSummaryModalProps) {
  const [currentDays, setCurrentDays] = useState<WeekDay[]>(days);

  // Update days when prop changes
  useEffect(() => {
    setCurrentDays(days);
  }, [days]);
  const [processingDays, setProcessingDays] = useState<Set<string>>(new Set());

  const handleApprove = async (dayDate: string) => {
    if (!onApprove) return;
    setProcessingDays(prev => new Set(prev).add(dayDate));
    try {
      await onApprove(dayDate);
      // Wait a bit for data to update
      await new Promise(resolve => setTimeout(resolve, 500));
      // Remove the approved day from the list
      const updatedDays = currentDays.filter(day => day.date !== dayDate);
      setCurrentDays(updatedDays);
      if (onDaysUpdated) {
        onDaysUpdated(updatedDays);
      }
    } catch (error) {
      console.error('Error approving day:', error);
    } finally {
      setProcessingDays(prev => {
        const next = new Set(prev);
        next.delete(dayDate);
        return next;
      });
    }
  };

  const handleReject = async (dayDate: string) => {
    if (!onReject) return;
    setProcessingDays(prev => new Set(prev).add(dayDate));
    try {
      await onReject(dayDate);
      // Wait a bit for data to update
      await new Promise(resolve => setTimeout(resolve, 500));
      // Update the rejected day status in the list
      const updatedDays = currentDays.map(day => 
        day.date === dayDate 
          ? { ...day, status: 'rejected' as const, parentAction: 'rejected' as const }
          : day
      );
      setCurrentDays(updatedDays);
      if (onDaysUpdated) {
        onDaysUpdated(updatedDays);
      }
    } catch (error) {
      console.error('Error rejecting day:', error);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-varela font-semibold text-xl text-[#262135]">
            סיכום ימים
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {currentDays.length === 0 ? (
            <p className="font-varela text-base text-[#282743] text-center py-4">
              כל הימים טופלו
            </p>
          ) : (
            currentDays.map((day, index) => {
            const goalMet = day.screenTimeUsed <= day.screenTimeGoal;
            const needsApproval = day.status === 'awaiting_approval' || day.requiresApproval;
            const needsUpload = day.status === 'missing' || day.status === 'pending';
            const isApproved = day.parentAction === 'approved';
            const isRejected = day.parentAction === 'rejected';
            const processing = isProcessing(day.date);

            // Calculate coins lost for exceeded goal
            // Use dailyBudget from challenge data (passed as prop, not hardcoded)
            const hourlyRate = dailyBudget / day.screenTimeGoal;
            const coinsMaxPossible = dailyBudget;
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
                    <p>זמן מסך: <strong>{formatNumber(day.screenTimeUsed)} שעות</strong></p>
                    <p>יעד: <strong>{day.screenTimeGoal} שעות</strong></p>
                    {isApproved && (
                      <p>
                        כסף ש{goalMet ? childP.earned : childP.lost}:{' '}
                        <strong className={goalMet ? 'text-green-600' : 'text-red-600'}>
                          ₪{formatNumber(goalMet ? day.coinsEarned : coinsLost)}
                        </strong>
                      </p>
                    )}
                    {needsApproval && (
                      <p>
                        כסף ש{goalMet ? childP.earned : childP.lost}:{' '}
                        <strong className={goalMet ? 'text-green-600' : 'text-red-600'}>
                          ₪{formatNumber(goalMet ? day.coinsEarned : coinsLost)}
                        </strong>
                      </p>
                    )}
                    {needsUpload && (
                      <p className="text-[#948DA9]">
                        {childName} עדיין לא {childP.gave} את הסטטוס {childP.his} על היום הזה
                      </p>
                    )}
                  </div>
                </div>

                {/* Screenshot if available */}
                {day.screenshotUrl && (
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
                {needsApproval && onApprove && onReject && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleReject(day.date)}
                      disabled={processing}
                      className="flex-1 py-2 px-3 rounded-[8px] font-varela font-semibold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all disabled:opacity-50"
                    >
                      {processing ? 'מעבד...' : 'דחה / בקש תיקון'}
                    </button>
                    <button
                      onClick={() => handleApprove(day.date)}
                      disabled={processing}
                      className="flex-1 py-2 px-3 rounded-[8px] font-varela font-semibold text-sm bg-[#273143] text-white hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                      {processing ? 'מעבד...' : 'אשר'}
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

