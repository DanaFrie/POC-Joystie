'use client';

import { useState } from 'react';
import { Link2, Share2, Check } from 'lucide-react';
import ReminderButton from './ReminderButton';
import type { WeekDay } from '@/types/dashboard';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('NotificationsPanel');

interface NotificationsPanelProps {
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
  childName?: string;
  childGender?: 'boy' | 'girl';
  parentName?: string;
  parentGender?: 'male' | 'female'; // Parent gender from Firestore
  missingDays?: WeekDay[];
  setupUrl?: string; // Setup URL to show when setup is not completed
  uploadUrl?: string;
  redemptionUrl?: string; // Redemption URL to show when all days are approved
  week?: WeekDay[];
  onOpenSummary?: (days: WeekDay[]) => void;
  childSetupCompleted?: boolean; // Whether child has completed setup (has nickname and moneyGoals)
}

export default function NotificationsPanel({ challengeNotStarted, challengeStartDate, childName, childGender, parentName, parentGender, missingDays, setupUrl, uploadUrl, redemptionUrl, week, onOpenSummary, childSetupCompleted }: NotificationsPanelProps) {
  const [copied, setCopied] = useState(false);
  const formatStartDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayName = dayNames[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `ביום ${dayName}, ${day}/${month}`;
  };

  // Use parentGender from Firestore, fallback to 'female' if not provided
  const parentGenderValue = parentGender || 'female';
  const parentVerb = parentGenderValue === 'female' ? 'תוכלי' : 'תוכל';

  // Filter days that need approval
  // Only include days that actually need approval (not already approved)
  const daysNeedingApproval = week?.filter(day => {
    if (day.isRedemptionDay) return false;
    // Include if status is awaiting_approval
    if (day.status === 'awaiting_approval') return true;
    // Include if requiresApproval is true AND parentAction is null (not yet approved)
    if (day.requiresApproval && !day.parentAction) return true;
    return false;
  }) || [];
  
  // Only include days that are actually missing (not uploaded yet)
  const daysMissingUpload = week?.filter(day => {
    if (day.isRedemptionDay) return false;
    // Only include if status is missing (not uploaded)
    return day.status === 'missing';
  }) || [];

  const hasNotifications = challengeNotStarted || daysNeedingApproval.length > 0 || daysMissingUpload.length > 0;

  const handleOpenSummary = (days: WeekDay[]) => {
    if (onOpenSummary) {
      onOpenSummary(days);
    }
  };

  // Check if all non-redemption days are approved
  const allDaysApproved = week && week.length > 0 && week
    .filter(day => !day.isRedemptionDay)
    .every(day => 
      day.status === 'success' || 
      day.status === 'warning' ||
      day.parentAction === 'approved'
    );

  const handleCopyUrl = async (url: string) => {
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      logger.error('Failed to copy URL:', error);
    }
  };

  // Determine which URL to show based on activity logic (same as URL validation):
  // 1. If setup not completed → setup URL
  // 2. If setup completed but not all days approved → upload URL
  // 3. If all days approved → redemption URL
  let urlToCopy: string | undefined;
  if (!childSetupCompleted && setupUrl) {
    // Setup not completed - show setup URL
    urlToCopy = setupUrl;
  } else if (allDaysApproved && redemptionUrl) {
    // All days approved - show redemption URL
    urlToCopy = redemptionUrl;
  } else if (uploadUrl) {
    // Setup completed but not all approved - show upload URL
    urlToCopy = uploadUrl;
  }
  
  // Show button when:
  // 1. Challenge exists (we have childName)
  // 2. We have a URL to copy (setup, upload, or redemption)
  const showCopyButton = !!childName && !!urlToCopy;
  const copyVerb = parentGenderValue === 'female' ? 'העתיקי' : 'העתק';
  const sendVerb = parentGenderValue === 'female' ? 'שלחי' : 'שלח';
  const childPossessive = childGender === 'girl' ? 'שלה' : 'שלו';
  // More explicit text about sharing/sending - makes it clear this is for sharing a link
  const buttonText = `${copyVerb} קישור לעמוד של ${childName}`;
  // Text explaining how to share the link
  const subtitleText = `${sendVerb} את הקישור ל${childName} דרך וואטסאפ או הודעה`;
  const copiedSubtitleText = `הקישור הועתק! הדבקי אותו בהודעה ל${childName}`;

  return (
    <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-4">
      <div className="mb-3">
        <h2 className="font-varela font-semibold text-base text-[#282743]">
          עדכונים
        </h2>
      </div>
      {challengeNotStarted && challengeStartDate ? (
        <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[12px] p-4 border-2 border-[#E6F19A] mb-3">
          <p className="font-varela text-sm text-[#262135] text-center leading-relaxed font-semibold mb-2">
            האתגר יתחיל ממש בקרוב! {formatStartDate(challengeStartDate)}.
          </p>
          <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
            בינתיים, {parentVerb} לדבר עם {childName || '[שם הילד/ה]'} ולהבין מה יעזור {childGender === 'girl' ? 'לה' : 'לו'} להצליח.
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

      {/* Copy URL button (upload or redemption) - improved UX with sharing context */}
      {showCopyButton && urlToCopy && (
        <div className="mb-3 p-4 rounded-[12px] bg-[#E6F19A] bg-opacity-30 border-2 border-[#E6F19A]">
          <button
            onClick={() => urlToCopy && handleCopyUrl(urlToCopy)}
            className={`w-full py-3 px-4 rounded-[12px] font-varela font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              copied
                ? 'bg-[#E6F19A] text-[#273143] border-2 border-[#E6F19A]'
                : 'bg-[#273143] text-white hover:bg-opacity-90 border-2 border-[#273143]'
            }`}
          >
            {copied ? (
              <>
                <Check size={18} className="flex-shrink-0" />
                <span>הועתק!</span>
              </>
            ) : (
              <>
                <Link2 size={18} className="flex-shrink-0" />
                <span>{buttonText}</span>
              </>
            )}
          </button>
          <p className="font-varela text-xs text-[#948DA9] text-center mt-2 leading-relaxed px-2">
            {copied ? copiedSubtitleText : subtitleText}
          </p>
        </div>
      )}

      {!hasNotifications && !showCopyButton && (
        <p className="font-varela text-sm text-[#948DA9] text-center py-2">
          אין עדכונים חדשים
        </p>
      )}
    </div>
  );
}

