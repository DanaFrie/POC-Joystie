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
  dailyScreenTimeGoal?: number; // יעד יומי בשעות
  onApprove?: (dayDate: string, manualScreenTimeMinutes?: number) => Promise<void>;
  onClose: () => void;
}

export default function DayInfoModal({ 
  day, 
  childName,
  childGender = 'boy',
  uploadUrl,
  dailyBudget,
  dailyScreenTimeGoal,
  onApprove, 
  onClose 
}: DayInfoModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualEntryEnabled, setManualEntryEnabled] = useState(false);
  const [manualScreenTimeMinutes, setManualScreenTimeMinutes] = useState<number | ''>(day.screenTimeMinutes || (day.screenTimeUsed * 60));
  
  const goalMet = day.screenTimeUsed <= day.screenTimeGoal;
  const isApproved = day.parentAction === 'approved';
  const needsApproval = day.status === 'awaiting_approval' || day.requiresApproval;
  const needsUpload = day.status === 'missing';
  const isRedemptionDay = day.isRedemptionDay;

  // Gender pronouns for child
  const childPronouns = {
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', earned: 'הרוויח', lost: 'ירד לו', stands: 'עומד', gave: 'נתן' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', earned: 'הרוויחה', lost: 'ירד לה', stands: 'עומדת', gave: 'נתנה' }
  };
  const childP = childPronouns[childGender] || childPronouns.boy;

  const handleApprove = async () => {
    if (!onApprove) return;
    
    // Check if manual entry is enabled but no value provided
    if (manualEntryEnabled && (manualScreenTimeMinutes === '' || manualScreenTimeMinutes === null || manualScreenTimeMinutes === undefined)) {
      alert('אנא הכנס זמן מסך ידנית או בטל את סימון התיבה');
      return;
    }
    
    setIsProcessing(true);
    try {
      const minutesToUse = manualEntryEnabled && manualScreenTimeMinutes !== '' 
        ? Number(manualScreenTimeMinutes) 
        : undefined;
      await onApprove(day.date, minutesToUse);
      setIsProcessing(false);
      onClose();
    } catch (error) {
      setIsProcessing(false);
      // Don't close on error
    }
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
            {/* סיכום: זמן מסך, יעד, כסף שהרוויח, כסף שהפסיד */}
            <div className="bg-white rounded-[12px] p-4">
              <div className="space-y-2 font-varela text-sm text-[#282743]">
                <p>זמן מסך: <strong>{formatNumber(day.screenTimeUsed * 60)} {day.screenTimeUsed * 60 === 1 ? 'דקה' : 'דקות'}</strong></p>
                <p>יעד: <strong>{formatNumber(day.screenTimeGoal * 60)} {day.screenTimeGoal * 60 === 1 ? 'דקה' : 'דקות'}</strong></p>
                {day.coinsEarned > 0 && (
                  <p>כסף שהרוויח: <strong className="text-green-600">₪{formatNumber(day.coinsEarned)}</strong></p>
                )}
                {coinsLost > 0 && (
                  <p>כסף שהפסיד: <strong className="text-red-600">₪{formatNumber(coinsLost)}</strong></p>
                )}
              </div>
            </div>
            
            {/* תמונה שהועלתה בגודל לא משמעותי */}
            {day.screenshotUrl && day.approvalType !== 'manual' && (
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
            {/* סיכום: זמן מסך, יעד, כסף שהרוויח, כסף שהפסיד */}
            <div className="bg-white rounded-[12px] p-4">
              <div className="space-y-2 font-varela text-sm text-[#282743]">
                <p>זמן מסך: <strong>{formatNumber(day.screenTimeUsed * 60)} {day.screenTimeUsed * 60 === 1 ? 'דקה' : 'דקות'}</strong></p>
                <p>יעד: <strong>{formatNumber(day.screenTimeGoal * 60)} {day.screenTimeGoal * 60 === 1 ? 'דקה' : 'דקות'}</strong></p>
                {day.coinsEarned > 0 && (
                  <p>כסף שהרוויח: <strong className="text-green-600">₪{formatNumber(day.coinsEarned)}</strong></p>
                )}
                {coinsLost > 0 && (
                  <p>כסף שהפסיד: <strong className="text-red-600">₪{formatNumber(coinsLost)}</strong></p>
                )}
              </div>
            </div>
            
            {/* תמונה שהועלתה בגודל לא משמעותי */}
            {day.screenshotUrl && day.approvalType !== 'manual' && (
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
      // Calculate coins based on current screen time (manual or original)
      const currentScreenTimeHours = manualEntryEnabled && manualScreenTimeMinutes !== '' 
        ? (Number(manualScreenTimeMinutes) / 60) 
        : day.screenTimeUsed;
      const currentGoalMet = currentScreenTimeHours <= day.screenTimeGoal;
      const coinsMaxPossible = dailyBudget;
      const currentCoinsEarned = currentGoalMet 
        ? coinsMaxPossible 
        : Math.max(0, coinsMaxPossible * (1 - (currentScreenTimeHours - day.screenTimeGoal) / day.screenTimeGoal));
      const currentCoinsEarnedRounded = Math.round(currentCoinsEarned * 10) / 10;
      const currentCoinsLost = Math.max(0, coinsMaxPossible - currentCoinsEarnedRounded);
      
      const isScreenTimeZero = (manualEntryEnabled ? (manualScreenTimeMinutes === '' || Number(manualScreenTimeMinutes) === 0) : day.screenTimeUsed === 0);
      const displayMinutes = manualEntryEnabled && manualScreenTimeMinutes !== '' 
        ? Number(manualScreenTimeMinutes) 
        : (day.screenTimeMinutes || (day.screenTimeUsed * 60));
      
      return {
        title: dailyScreenTimeGoal ? `יעד יומי ${formatNumber(dailyScreenTimeGoal * 60)} דקות` : `${day.dayName} ${day.date}`,
        content: (
          <div className="space-y-4">
            {/* סיכום זמנים יומי וכמה כסף הרוויח/ירד לו */}
            <div className="bg-white rounded-[12px] p-4">
              <div className="space-y-2 font-varela text-sm text-[#282743]">
                <p>זמן מסך מזוהה: <strong>{formatNumber(displayMinutes)} {displayMinutes === 1 ? 'דקה' : 'דקות'}</strong></p>
                {!manualEntryEnabled && (
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
                {manualEntryEnabled && (
                  <>
                    <p>
                      כסף שהרוויח:{' '}
                      <strong className="text-green-600">
                        ₪{formatNumber(currentCoinsEarnedRounded)}
                      </strong>
                    </p>
                    {(currentCoinsLost > 0 || manualEntryEnabled) && (
                      <p>
                        כסף שהפסיד:{' '}
                        <strong className="text-red-600">
                          ₪{formatNumber(currentCoinsLost)}
                        </strong>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* אזהרה אם זמן מסך הוא 0 - רק אם לא לוחצים על הצ'קבוקס */}
            {isScreenTimeZero && !manualEntryEnabled && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-3">
                <p className="font-varela text-xs text-[#262135] text-center leading-relaxed">
                  <strong>⚠️ שימו לב:</strong> זמן המסך שזוהה הוא 0 דקות. כנראה משהו לא עבד טוב בעיבוד, מומלץ להכניס ידנית.
                </p>
              </div>
            )}
            
            {/* צ'ק בוקס להכנסה ידנית */}
            <div className="bg-gray-50 rounded-[12px] p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualEntryEnabled}
                  onChange={(e) => {
                    setManualEntryEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setManualScreenTimeMinutes(day.screenTimeMinutes || (day.screenTimeUsed * 60));
                    } else {
                      setManualScreenTimeMinutes('');
                    }
                  }}
                  disabled={isProcessing}
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
                    value={manualScreenTimeMinutes === '' || manualScreenTimeMinutes === null || manualScreenTimeMinutes === undefined ? '' : String(manualScreenTimeMinutes)}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') {
                        setManualScreenTimeMinutes('');
                        return;
                      }
                      const numericValue = inputValue.replace(/[^0-9]/g, '');
                      if (numericValue === '') {
                        setManualScreenTimeMinutes('');
                      } else {
                        const numValue = parseInt(numericValue, 10);
                        if (!isNaN(numValue) && numValue >= 0) {
                          setManualScreenTimeMinutes(numValue);
                        } else {
                          setManualScreenTimeMinutes('');
                        }
                      }
                    }}
                    disabled={!manualEntryEnabled || isProcessing}
                    className={`w-full p-2 border-2 rounded-[8px] font-varela text-sm ${
                      manualEntryEnabled 
                        ? 'border-[#273143] bg-white' 
                        : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }`}
                    placeholder="הכנס דקות"
                  />
                  <p className="font-varela text-xs text-[#948DA9] mt-1">
                    {manualEntryEnabled ? 'החישוב יעודכן אוטומטית' : 'סמן את התיבה כדי להכניס ידנית'}
                  </p>
                </div>
              </label>
            </div>
            
            {/* תמונה שהועלתה בגודל לא משמעותי */}
            {day.screenshotUrl && day.approvalType !== 'manual' && (
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
        {modalContent.showActions && onApprove && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-[12px] font-varela font-semibold text-base bg-[#273143] text-white hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'מעבד...' : 'אשר'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
