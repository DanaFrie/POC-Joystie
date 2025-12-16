'use client';

import { useState } from 'react';
import Image from 'next/image';
import { WeekDay } from '@/types/dashboard';
import ReminderButton from './ReminderButton';
import { formatNumber } from '@/utils/formatting';

interface DayInfoModalProps {
  day: WeekDay;
  childName: string;
  childGender?: 'boy' | 'girl';
  uploadUrl: string;
  dailyBudget: number; // Daily budget from challenge data (not hardcoded)
  onApprove?: (dayDate: string) => void;
  onReject?: (dayDate: string) => void;
  onClose: () => void;
}

export default function DayInfoModal({ 
  day, 
  childName,
  childGender = 'boy',
  uploadUrl,
  dailyBudget,
  onApprove, 
  onReject, 
  onClose 
}: DayInfoModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const goalMet = day.screenTimeUsed <= day.screenTimeGoal;
  const isApproved = day.parentAction === 'approved';
  const isRejected = day.parentAction === 'rejected';
  const needsApproval = day.status === 'awaiting_approval' || day.requiresApproval;
  const needsUpload = day.status === 'missing' || day.status === 'pending';
  const isRedemptionDay = day.isRedemptionDay;

  // Gender pronouns for child
  const childPronouns = {
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', earned: 'הרוויח', lost: 'ירד לו', stands: 'עומד', gave: 'נתן' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', earned: 'הרוויחה', lost: 'ירד לה', stands: 'עומדת', gave: 'נתנה' }
  };
  const childP = childPronouns[childGender] || childPronouns.boy;

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    await onApprove(day.date);
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    await onReject(day.date);
    setIsProcessing(false);
    onClose();
  };

  // Don't show modal for redemption day
  if (isRedemptionDay) {
    return null;
  }

  // Calculate coins lost for exceeded goal
  // Use dailyBudget from challenge data (passed as prop, not hardcoded)
  const hourlyRate = dailyBudget / day.screenTimeGoal;
  const coinsMaxPossible = dailyBudget;
  // Calculate coins lost: difference between max possible and what was actually earned
  const coinsLost = Math.max(0, coinsMaxPossible - day.coinsEarned);

  // Determine modal content based on day status
  const getModalContent = () => {
    // Case 1: Approved - Goal Not Met (אייקון איקס)
    if (isApproved && !goalMet) {
      return {
        title: `${day.dayName} ${day.date}`,
        content: (
          <div className="space-y-4">
            {/* סיכום זמנים יומי וכמה כסף ירד לו */}
            <div className="bg-white rounded-[12px] p-4">
              <div className="space-y-2 font-varela text-sm text-[#282743]">
                <p>זמן מסך: <strong>{formatNumber(day.screenTimeUsed)} שעות</strong></p>
                <p>יעד: <strong>{day.screenTimeGoal} שעות</strong></p>
                <p>כסף ש{childP.lost}: <strong className="text-red-600">₪{formatNumber(coinsLost)}</strong></p>
              </div>
            </div>
            
            {/* תמונה שהועלתה בגודל לא משמעותי */}
            {day.screenshotUrl && (
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-[12px] overflow-hidden border-2 border-gray-200">
                  <Image
                    src={day.screenshotUrl}
                    alt="Screenshot"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* משפט מעניין על תחום הקשב */}
            <div className="bg-[#E6F19A] bg-opacity-30 rounded-[12px] p-4">
              <p className="font-varela text-sm text-[#273143] text-center leading-relaxed">
                מחקרים מראים שניהול זמן מסך משפר את יכולת הקשב והריכוז. כל יום שבו {childName} {childP.stands} ביעד הוא צעד נוסף בפיתוח מיומנויות חשובות לחיים.
              </p>
            </div>
          </div>
        ),
        showActions: false
      };
    }

    // Case 2: Approved - Goal Met (אייקון וי)
    if (isApproved && goalMet) {
      return {
        title: `${day.dayName} ${day.date}`,
        content: (
          <div className="space-y-4">
            {/* סיכום זמנים יומי וכמה כסף הרוויח */}
            <div className="bg-white rounded-[12px] p-4">
              <div className="space-y-2 font-varela text-sm text-[#282743]">
                <p>זמן מסך: <strong>{formatNumber(day.screenTimeUsed)} שעות</strong></p>
                <p>יעד: <strong>{day.screenTimeGoal} שעות</strong></p>
                <p>כסף ש{childP.earned}: <strong className="text-green-600">₪{formatNumber(day.coinsEarned)}</strong></p>
              </div>
            </div>
            
            {/* תמונה שהועלתה בגודל לא משמעותי */}
            {day.screenshotUrl && (
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-[12px] overflow-hidden border-2 border-gray-200">
                  <Image
                    src={day.screenshotUrl}
                    alt="Screenshot"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* משפט מעניין על עיצוב התנהגות */}
            <div className="bg-[#E6F19A] bg-opacity-30 rounded-[12px] p-4">
              <p className="font-varela text-sm text-[#273143] text-center leading-relaxed">
                עיצוב התנהגות מתבסס על חיזוק חיובי. כשאנחנו מחזקים התנהגות רצויה, היא נוטה לחזור על עצמה. כל יום שבו {childName} {childP.stands} ביעד מחזק את ההרגל החיובי.
              </p>
            </div>
          </div>
        ),
        showActions: false
      };
    }

    // Case 3: Needs Approval (אייקון שעון חול)
    if (needsApproval) {
      return {
        title: `${day.dayName} ${day.date}`,
        content: (
          <div className="space-y-4">
            {/* סיכום זמנים יומי וכמה כסף הרוויח/ירד לו */}
            <div className="bg-white rounded-[12px] p-4">
              <div className="space-y-2 font-varela text-sm text-[#282743]">
                <p>זמן מסך: <strong>{formatNumber(day.screenTimeUsed)} שעות</strong></p>
                <p>יעד: <strong>{day.screenTimeGoal} שעות</strong></p>
                {goalMet ? (
                  <p>כסף ש{childP.earned}: <strong className="text-green-600">₪{formatNumber(day.coinsEarned)}</strong></p>
                ) : (
                  <p>כסף ש{childP.lost}: <strong className="text-red-600">₪{formatNumber(coinsLost)}</strong></p>
                )}
              </div>
            </div>
            
            {/* תמונה שהועלתה בגודל לא משמעותי */}
            {day.screenshotUrl && (
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-[12px] overflow-hidden border-2 border-gray-200">
                  <Image
                    src={day.screenshotUrl}
                    alt="Screenshot"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ),
        showActions: true
      };
    }

    // Case 4: Needs Upload (אייקון סימן קריאה עם משלוש)
    if (needsUpload) {
      return {
        title: `${day.dayName} ${day.date}`,
        content: (
          <div className="space-y-4">
            {/* "[שם הילד] עדיין לא נתן את הסטטוס שלו על היום הזה" */}
            <div className="bg-white rounded-[12px] p-4">
              <p className="font-varela text-base text-[#282743] text-center">
                {childName} עדיין לא {childP.gave} את הסטטוס {childP.his} על היום הזה
              </p>
            </div>
            
            {/* תמונה שהועלתה (אם הועלתה) בגודל לא משמעותי עם איקס */}
            {day.screenshotUrl ? (
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-[12px] overflow-hidden border-2 border-red-300">
                  <Image
                    src={day.screenshotUrl}
                    alt="Screenshot"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50">
                    <span className="text-4xl text-red-600">×</span>
                  </div>
                </div>
              </div>
            ) : null}
            
            {/* שלח תזכורת ל[שם הילד] */}
            <div>
              <ReminderButton day={day} childName={childName} uploadUrl={uploadUrl} />
            </div>
          </div>
        ),
        showActions: false
      };
    }

    // Default case (Future days, etc.)
    return {
      title: `${day.dayName} ${day.date}`,
      content: (
        <div className="bg-white rounded-[12px] p-4">
          <p className="font-varela text-base text-[#282743]">
            יום זה עדיין לא הגיע.
          </p>
        </div>
      ),
      showActions: false
    };
  };

  const modalContent = getModalContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-varela font-semibold text-xl text-[#262135]">
            {modalContent.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        {modalContent.content}

        {/* Actions */}
        {modalContent.showActions && onApprove && onReject && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 rounded-[12px] font-varela font-semibold text-base bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'מעבד...' : 'דחה / בקש תיקון'}
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 rounded-[12px] font-varela font-semibold text-base bg-[#273143] text-white hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'מעבד...' : 'אשר'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
