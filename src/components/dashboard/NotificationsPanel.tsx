'use client';

import ReminderButton from './ReminderButton';
import type { WeekDay } from '@/types/dashboard';

interface NotificationsPanelProps {
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
  childName?: string;
  childGender?: 'boy' | 'girl';
  parentName?: string;
  missingDays?: WeekDay[];
  uploadUrl?: string;
  week?: WeekDay[];
  onOpenSummary?: (days: WeekDay[]) => void;
}

export default function NotificationsPanel({ challengeNotStarted, challengeStartDate, childName, childGender, parentName, missingDays, uploadUrl, week, onOpenSummary }: NotificationsPanelProps) {
  const formatStartDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayName = dayNames[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `ביום ${dayName}, ${day}/${month}`;
  };

  // Determine parent gender from name
  const getParentGender = (): 'female' | 'male' => {
    if (!parentName) return 'female'; // default
    const name = parentName.trim();
    if (name.endsWith('ה') || name.endsWith('ית')) {
      return 'female';
    }
    return 'male';
  };

  const parentGender = getParentGender();
  const parentVerb = parentGender === 'female' ? 'תוכלי' : 'תוכל';

  // Filter days that need approval or are missing
  // Only include days that actually need approval (not already approved)
  const daysNeedingApproval = week?.filter(day => {
    if (day.isRedemptionDay) return false;
    // Include if status is awaiting_approval or rejected
    if (day.status === 'awaiting_approval' || day.status === 'rejected') return true;
    // Include if requiresApproval is true AND parentAction is null (not yet approved/rejected)
    if (day.requiresApproval && !day.parentAction) return true;
    return false;
  }) || [];
  
  // Only include days that are actually missing (not uploaded yet)
  const daysMissingUpload = week?.filter(day => {
    if (day.isRedemptionDay) return false;
    // Only include if status is missing or pending (not uploaded)
    return day.status === 'missing' || day.status === 'pending';
  }) || [];

  const hasNotifications = challengeNotStarted || daysNeedingApproval.length > 0 || daysMissingUpload.length > 0;

  const handleOpenSummary = (days: WeekDay[]) => {
    if (onOpenSummary) {
      onOpenSummary(days);
    }
  };

  return (
    <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-4">
      <h2 className="font-varela font-semibold text-base text-[#282743] mb-3">
        עדכונים
      </h2>
      {challengeNotStarted && challengeStartDate ? (
        <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[12px] p-4 border-2 border-[#E6F19A] mb-3">
          <p className="font-varela text-sm text-[#262135] text-center leading-relaxed font-semibold mb-2">
            האתגר יתחיל ממש בקרוב! {formatStartDate(challengeStartDate)}.
          </p>
          <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
            בינתיים, {parentVerb} להכין את {childName || '[שם הילד/ה]'} ולהסביר {childGender === 'girl' ? 'לה' : 'לו'} על האתגר.
          </p>
        </div>
      ) : null}
      
      {/* Days needing approval - grouped with hourglass icon */}
      {daysNeedingApproval.length > 0 && (
        <div 
          className="mb-3 p-3 rounded-[12px] bg-[#BBE9FD] bg-opacity-30 border-2 border-[#BBE9FD] cursor-pointer hover:bg-opacity-40 transition-all flex items-center gap-3"
          onClick={() => handleOpenSummary(daysNeedingApproval)}
        >
          <span className="text-2xl flex-shrink-0">⏳</span>
          <div className="flex-1">
            <p className="font-varela font-semibold text-sm text-[#282743]">
              {daysNeedingApproval.length} {daysNeedingApproval.length === 1 ? 'יום דורש אישור' : 'ימים דורשים אישור'}
            </p>
            <p className="font-varela text-xs text-[#948DA9] mt-1">
              לחץ לפרטים ולטיפול
            </p>
          </div>
        </div>
      )}

      {/* Days missing upload - grouped with warning icon */}
      {daysMissingUpload.length > 0 && (
        <div 
          className="mb-3 p-3 rounded-[12px] bg-[#273143] bg-opacity-20 border-2 border-[#273143] cursor-pointer hover:bg-opacity-30 transition-all flex items-center gap-3"
          onClick={() => handleOpenSummary(daysMissingUpload)}
        >
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="font-varela font-semibold text-sm text-[#282743]">
              {daysMissingUpload.length} {daysMissingUpload.length === 1 ? 'יום לא הועלה' : 'ימים לא הועלו'}
            </p>
            <p className="font-varela text-xs text-[#948DA9] mt-1">
              לחץ לפרטים ולטיפול
            </p>
          </div>
        </div>
      )}

      {!hasNotifications && (
        <p className="font-varela text-sm text-[#948DA9] text-center py-2">
          אין עדכונים חדשים
        </p>
      )}
    </div>
  );
}

