'use client';

import { useState } from 'react';
import { Link2, Share2, Check } from 'lucide-react';
import type { WeeklyUpload } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('NotificationsPanel');

interface NotificationsPanelProps {
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
  childName?: string;
  childGender?: 'boy' | 'girl';
  parentName?: string;
  parentGender?: 'male' | 'female'; // Parent gender from Firestore
  setupUrl?: string; // Setup URL to show when setup is not completed
  uploadUrl?: string;
  redemptionUrl?: string; // Redemption URL to show on redemption day
  weeklyUpload?: WeeklyUpload | null; // Weekly upload status
  onOpenWeeklyReview?: () => void; // Handler to open weekly upload review modal
  childSetupCompleted?: boolean; // Whether child has completed setup (has nickname and moneyGoals)
  consultationCompleted?: boolean; // Whether consultation with advisor has been completed
  noChallengeExists?: boolean; // Whether user has no active challenge (new registration)
}

export default function NotificationsPanel({ challengeNotStarted, challengeStartDate, childName, childGender, parentName, parentGender, setupUrl, uploadUrl, redemptionUrl, weeklyUpload, onOpenWeeklyReview, childSetupCompleted, consultationCompleted, noChallengeExists }: NotificationsPanelProps) {
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

  // Calculate relative day text (e.g., "מחר", "שני הבא", "שבת הקרובה", "שלישי בעוד שבועיים")
  const getRelativeDayText = (dateStr?: string): string => {
    if (!dateStr) return '';
    
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const targetDayName = dayNames[targetDate.getDay()];
    
    // Today
    if (diffDays === 0) {
      return 'היום';
    }
    
    // Tomorrow
    if (diffDays === 1) {
      return 'מחר';
    }
    
    // Within this week (2-6 days)
    if (diffDays >= 2 && diffDays <= 6) {
      // Use "הקרוב/ה" for days this week
      const suffix = targetDate.getDay() === 6 ? 'הקרובה' : 'הקרוב'; // שבת = feminine
      return `${targetDayName} ${suffix}`;
    }
    
    // Next week (7-13 days)
    if (diffDays >= 7 && diffDays <= 13) {
      return `${targetDayName} הבא`;
    }
    
    // Two weeks from now (14-20 days)
    if (diffDays >= 14 && diffDays <= 20) {
      return `${targetDayName} בעוד שבועיים`;
    }
    
    // More than 2 weeks - show "בעוד X ימים"
    return `בעוד ${diffDays} ימים`;
  };

  // Use parentGender from Firestore, fallback to 'female' if not provided
  const parentGenderValue = parentGender || 'female';
  const parentVerb = parentGenderValue === 'female' ? 'תוכלי' : 'תוכל';

  // Weekly upload approval is shown only above the bar chart in WeeklyProgress, not here
  const hasNotifications = noChallengeExists || consultationCompleted === false || (consultationCompleted === true && challengeNotStarted);

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

  // Determine which URL to show based on activity logic:
  // 1. If setup not completed → setup URL
  // 2. If setup completed and no weekly upload → redemption URL (on redemption day)
  // 3. If weekly upload approved → redemption URL for next steps
  let urlToCopy: string | undefined;
  if (!childSetupCompleted && setupUrl) {
    // Setup not completed - show setup URL
    urlToCopy = setupUrl;
  } else if (redemptionUrl) {
    // Show redemption URL for uploading or viewing results
    urlToCopy = redemptionUrl;
  }
  
  // Show button when:
  // 1. Challenge exists (we have childName)
  // 2. We have a URL to copy (setup, upload, or redemption)
  const showCopyButton = !!childName && !!urlToCopy;
  const copyVerb = parentGenderValue === 'female' ? 'העתיקי' : 'העתק';
  const sendVerb = parentGenderValue === 'female' ? 'שלחי' : 'שלח';
  const childPossessive = childGender === 'girl' ? 'שלה' : 'שלו';
  // More explicit text about sharing/sending - makes it clear this is for sharing a link
  const buttonText = `קישור לעמוד של ${childName}`;
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

      {/* No challenge exists - prompt to create one */}
      {noChallengeExists && (
        <div className="bg-[#E6F19A] bg-opacity-30 border-2 border-[#E6F19A] rounded-[12px] p-4 mb-3">
          <h3 className="font-varela font-semibold text-sm text-[#262135] mb-2 text-center">
            ברוכים הבאים! 👋
          </h3>
          <p className="font-varela text-xs text-[#282743] leading-relaxed text-center mb-3">
            כדי להתחיל, יש להגדיר אתגר ראשון עבור הילד שלכם.
          </p>
          <a
            href="/onboarding"
            className="block w-full py-3 px-4 rounded-[12px] bg-[#273143] text-white font-varela font-semibold text-sm text-center hover:bg-opacity-90 transition-all"
          >
            התחל אתגר
          </a>
        </div>
      )}

      {/* Consultation status - Show different messages based on status */}
      {consultationCompleted === false && !noChallengeExists && (
        <div className="bg-[#E6F19A] bg-opacity-30 border-2 border-[#E6F19A] rounded-[12px] p-4 mb-3">
          <h3 className="font-varela font-semibold text-sm text-[#262135] mb-2 text-center">
            בקרוב ניפגש
          </h3>
          <p className="font-varela text-xs text-[#282743] leading-relaxed text-center">
            לאחר השיחה עם המומחה שלנו, תוכלו להתחיל באתגר.
          </p>
        </div>
      )}

      {/* Challenge starting soon - consultation completed but challenge hasn't started yet */}
      {consultationCompleted === true && challengeNotStarted && challengeStartDate && (
        <div className="bg-green-50 border-2 border-green-200 rounded-[12px] p-4 mb-3">
          <h3 className="font-varela font-semibold text-sm text-[#262135] mb-2 text-center">
            {getRelativeDayText(challengeStartDate)} האתגר מתחיל! 🎉
          </h3>
          <p className="font-varela text-xs text-[#282743] leading-relaxed text-center">
            התכוננו להתחלה מרגשת!
          </p>
        </div>
      )}
      
      {/* After parent approved weekly upload – invite to create new challenge (link inactive) */}
      {weeklyUpload?.status === 'approved' && !challengeNotStarted && (
        <div className="mb-3 p-4 rounded-[12px] bg-[#E6F19A] bg-opacity-30 border-2 border-[#E6F19A]">
          <h3 className="font-varela font-semibold text-sm text-[#262135] mb-2 text-center">
            מוכנים לאתגר הבא?
          </h3>
          <p className="font-varela text-xs text-[#282743] leading-relaxed text-center mb-3">
            הגדירו אתגר חדש עבור {childName} כדי להמשיך.
          </p>
          <a
            href="/onboarding"
            className="block w-full py-3 px-4 rounded-[12px] bg-[#273143] text-white font-varela font-semibold text-sm text-center hover:bg-opacity-90 transition-all"
          >
            בניית אתגר חדש
          </a>
        </div>
      )}

      {/* Copy URL button – only when challenge is active and upload not yet approved (pending/rejected = link stays active for upload/re-upload) */}
      {showCopyButton && urlToCopy && !challengeNotStarted && weeklyUpload?.status !== 'approved' && (
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

      {!hasNotifications && !showCopyButton && weeklyUpload?.status !== 'approved' && (
        <p className="font-varela text-sm text-[#948DA9] text-center py-2">
          אין עדכונים חדשים
        </p>
      )}
    </div>
  );
}

