'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { generateChildUrl } from '@/utils/url-encoding';
import { getCurrentUserId } from '@/utils/auth';
import { getUserChallenges } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import { getChild } from '@/lib/api/children';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('CompleteContent');

interface CompleteContentProps {
  childName: string;
  childGender: 'boy' | 'girl';
  childId?: string;
  onClose?: () => void;
  /** When true (e.g. in dashboard modal), hide the "סגור" button; close only via X or backdrop */
  isModal?: boolean;
}

export default function CompleteContent({ childName, childGender, childId, onClose, isModal }: CompleteContentProps) {
  const [shareLink, setShareLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [editableMessage, setEditableMessage] = useState<string>('');
  const messageInitialized = useRef(false);
  const [parentData, setParentData] = useState<{
    parentName: string;
    parentGender: 'female' | 'male';
    deviceType: 'ios' | 'android';
  }>({
    parentName: '',
    parentGender: 'female',
    deviceType: 'ios'
  });

  // Load parent data and child device type from Firestore
  useEffect(() => {
    const loadParentData = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          logger.warn('User not logged in');
          return;
        }

        // Get parent data from Firestore
        const parent = await getUser(userId);
        if (parent) {
          const parentName = parent.firstName || '';
          const parentGender = parent.gender === 'female' ? 'female' : 'male';
          
          // Get child data for deviceType
          let deviceType: 'ios' | 'android' = 'ios';
          try {
            const challenges = await getUserChallenges(userId);
            // Get the most recent challenge (active or not)
            const challenge = challenges.length > 0 ? challenges[0] : null;
            if (challenge && challenge.childId) {
              const child = await getChild(challenge.childId);
              if (child) {
                deviceType = child.deviceType || 'ios';
              }
            }
          } catch (childError) {
            logger.error('Error loading child:', childError);
          }

          setParentData({
            parentName,
            parentGender,
            deviceType
          });
        }
      } catch (error) {
        logger.error('Error loading parent data:', error);
      }
    };

    loadParentData();
  }, []);

  const parentName = parentData.parentName;
  const parentGender = parentData.parentGender;
  const deviceType = parentData.deviceType;
  
  // Parent pronouns
  const parentPronouns = {
    female: { you: 'את', youVerb: 'תשתפי', youAre: 'את', registered: 'רשומה', user: 'משתמשת', only: 'יחידה' },
    male: { you: 'אתה', youVerb: 'תשתף', youAre: 'אתה', registered: 'רשום',  user: 'משתמש', only: 'יחיד' }
  };
  const parentP = parentPronouns[parentGender as 'female' | 'male'] || parentPronouns.female;

  // Generate setup URL with token
  useEffect(() => {
    const generateUrl = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          logger.error('Cannot generate URL: User not logged in');
          setShareLink('');
          return;
        }

        logger.log('User ID found:', userId);
        
        try {
          const challenges = await getUserChallenges(userId);
          const challenge = challenges.length > 0 ? challenges[0] : null;
          const childIdToUse = childId || challenge?.childId;
          const challengeIdToUse = challenge?.id;
          logger.log('Challenge found:', challengeIdToUse, 'Child ID:', childIdToUse);
          
          const url = generateChildUrl(userId, childIdToUse, challengeIdToUse);
          logger.log('Generated URL successfully');
          setShareLink(url);
        } catch (challengeError) {
          logger.error('Error getting challenge:', challengeError);
          const url = generateChildUrl(userId, childId);
          setShareLink(url);
        }
      } catch (error) {
        logger.error('Error generating setup URL:', error);
        setShareLink('');
      }
    };

    generateUrl();
  }, [childId]);

  // Use correct gender pronouns
  const genderPronouns = {
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', to: 'אליו', child: 'הילד', fallback: 'הילד' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', to: 'אליה', child: 'הילדה', fallback: 'הילדה' }
  };
  const pronouns = genderPronouns[childGender as 'boy' | 'girl'] || genderPronouns.boy;
  
  // Use child name if available, otherwise use gender-appropriate fallback
  const displayName = childName || pronouns.fallback;
  
  // Default message template (without link)
  const defaultMessage = `${displayName}! מצאתי משהו חדש שגם נותן לך יותר שליטה בכסף שלך וגם ייתן לך יותר חופש בטלפון\n\nזה הקישור שלך – רוצה לגלות איך זה עובד ביחד?`;

  // Initialize editable message when displayName is available
  useEffect(() => {
    if (displayName && !messageInitialized.current) {
      setEditableMessage(defaultMessage);
      messageInitialized.current = true;
    }
  }, [displayName, defaultMessage]);

  // Get the full text to copy (editable message + link)
  const getFullTextToCopy = () => {
    return `${editableMessage}\n\n${shareLink}`;
  };

  const handleCopyFullText = async () => {
    if (!shareLink) return;
    try {
      const fullText = getFullTextToCopy();
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Box 1: Everything is ready */}
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
        <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4 text-center">
          הכל מוכן!
        </h1>
        
        <div className="space-y-4">
          <p className="font-varela text-base text-[#282743] leading-relaxed">
            מתחילים עם {displayName}. באתגר זה עליך לשחרר את הגבלת המסך, למה חשוב לבטל את ההגבלה עכשיו? הגענו לצעד המשמעותי ביותר - אמון.
          </p>
          
          <p className="font-varela text-base text-[#282743] leading-relaxed">
            לאחר מכן, {parentP.you} {parentP.youVerb} את {displayName} בקישור אליו {pronouns.he === 'היא' ? 'תכנס' : 'יכנס'} מדי יום כדי לעדכן את הסטטוס {pronouns.his}.
          </p>
          
          <p className="font-varela text-base text-[#262135] leading-relaxed mt-4">
            <strong>חשוב לדעת:</strong>
          </p>
          <p className="font-varela text-base text-[#282743] leading-relaxed">
            בסוף השבוע, אם {displayName} {pronouns.he === 'היא' ? 'עמדה' : 'עמד'} באתגר {pronouns.he === 'היא' ? 'והרוויחה' : 'והרוויח'} כסף, {pronouns.he === 'היא' ? 'היא תקבל' : 'הוא יקבל'} כמה חלופות לכסף כמו חסכון, פעילות ותרומה.
          </p>
        </div>
      </div>

      {/* Parent tutorial video for Android devices */}
      {deviceType === 'android' && (
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          <p className="font-varela text-sm text-[#282743] mb-4 text-center leading-relaxed">
            {displayName} {pronouns.he === 'היא' ? 'תבקש' : 'יבקש'} ממך צילום מסך של זמן המסך {pronouns.his}. הסבר קצר כיצד לעשות זאת:
          </p>
          <div className="relative w-full bg-gray-100 rounded-[12px] overflow-hidden mb-3" style={{ minHeight: '195px' }}>
            <video
              controls
              className="w-full h-auto object-contain"
              poster="/video-poster-parent-android.jpg"
            >
              <source src="/screenshot-tutorial-parent-android.mp4" type="video/mp4" />
              <source src="/screenshot-tutorial-parent-android.webm" type="video/webm" />
              <p className="font-varela text-sm text-[#282743] p-4 text-center">
                הדפדפן שלך לא תומך בהצגת סרטונים.
              </p>
            </video>
          </div>
        </div>
      )}

      {/* Box 2: How to share */}
      <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
        <h2 className="font-varela font-semibold text-lg text-[#262135] mb-4 text-center">
          איך נוח לך לשתף {pronouns.him}?
        </h2>
        
        <div className="space-y-4">
          {/* Copy Link with Text - Editable */}
          <div className="bg-[#E4E4E4] bg-opacity-30 rounded-[18px] p-4">
            <h3 className="font-varela font-semibold text-sm text-[#273143] mb-3">
              אנחנו מציעים...
            </h3>
            {!shareLink ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[12px] p-3">
                <p className="font-varela text-sm text-[#262135] text-center">
                  שגיאה ביצירת הקישור. אנא רענן את הדף או בדוק שהתחברת למערכת.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-[#FFFCF8] rounded-[12px] p-4 mb-3 border-2 border-gray-200">
                  <textarea
                    value={editableMessage}
                    onChange={(e) => setEditableMessage(e.target.value)}
                    className="w-full min-h-[120px] font-varela text-sm text-[#273143] leading-relaxed bg-transparent border-none resize-y focus:outline-none"
                    placeholder={defaultMessage}
                  />
                  <div className="mt-3 pt-3 border-t-2 border-gray-200">
                    <p className="font-varela text-xs text-gray-500 mb-2">קישור:</p>
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="w-full p-2 border-2 border-gray-200 rounded-[8px] font-varela text-xs text-[#273143] bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCopyFullText}
                  disabled={!shareLink}
                  className={`w-full py-3 rounded-[12px] font-varela font-semibold text-sm transition-all ${
                    !shareLink
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : copied
                      ? 'bg-[#E6F19A] text-[#273143]'
                      : 'bg-[#273143] text-white hover:bg-opacity-90'
                  }`}
                >
                  {copied ? 'הועתק! ✓' : 'העתק'}
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Success message - bottom right */}
        <div className="flex justify-end mt-4">
          <p className="font-varela font-semibold text-xl text-[#262135]">
            בהצלחה!
          </p>
        </div>
      </div>

      {/* Close button only when not in modal (e.g. onboarding/complete page) */}
      {onClose && !isModal && (
        <button
          onClick={onClose}
          className="w-full py-4 px-6 rounded-[18px] bg-[#273143] text-white text-lg font-varela font-semibold hover:bg-opacity-90 transition-all"
        >
          סגור
        </button>
      )}
    </div>
  );
}
