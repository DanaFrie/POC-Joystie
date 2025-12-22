'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import { generateSetupUrl } from '@/utils/url-encoding';
import { getCurrentUserId } from '@/utils/auth';
import { getUserChallenges } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import { getChild } from '@/lib/api/children';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('OnboardingComplete');

function OnboardingCompleteContent() {
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const childName = searchParams.get('name') || '';
  const childGender = searchParams.get('gender') || 'boy';
  const childId = searchParams.get('childId') || '';

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
        // Fallback to signupFormData if Firestore fails
        if (typeof window !== 'undefined') {
          const signupData = localStorage.getItem('signupFormData');
          if (signupData) {
            try {
              const parsed = JSON.parse(signupData);
              setParentData({
                parentName: parsed.firstName || '',
                parentGender: parsed.gender === 'female' ? 'female' : 'male',
                deviceType: 'ios'
              });
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    };

    loadParentData();
  }, []);

  const parentName = parentData.parentName;
  const parentGender = parentData.parentGender;
  const deviceType = parentData.deviceType;
  
  // Parent pronouns
  const parentPronouns = {
    female: { you: 'את', youVerb: 'תשתפי', youAre: 'את', registered: 'רשומה', defined: 'הגדרת', user: 'משתמשת', only: 'יחידה' },
    male: { you: 'אתה', youVerb: 'תשתף', youAre: 'אתה', registered: 'רשום', defined: 'הגדרת', user: 'משתמש', only: 'יחיד' }
  };
  const parentP = parentPronouns[parentGender as 'female' | 'male'] || parentPronouns.female;

  // Generate setup URL with token
  useEffect(() => {
    const generateUrl = async () => {
      try {
        // Get user ID - no need to wait, Firebase should already be initialized
        const userId = await getCurrentUserId();
        if (!userId) {
          // User not logged in - show error message instead of invalid token
          logger.error('Cannot generate URL: User not logged in (getCurrentUserId returned null)');
          setShareLink(''); // Empty string - UI should handle this
          return;
        }

        logger.log('User ID found:', userId);
        
        try {
          const challenges = await getUserChallenges(userId);
          // Get the most recent challenge (active or not)
          const challenge = challenges.length > 0 ? challenges[0] : null;
          const childIdToUse = childId || challenge?.childId;
          const challengeIdToUse = challenge?.id;
          logger.log('Challenge found:', challengeIdToUse, 'Child ID:', childIdToUse);
          
          const url = generateSetupUrl(userId, childIdToUse, challengeIdToUse);
          logger.log('Generated URL successfully');
          setShareLink(url);
        } catch (challengeError) {
          logger.error('Error getting challenge:', challengeError);
          // Still generate URL with just parentId if challenge fetch fails
          const url = generateSetupUrl(userId, childId);
          setShareLink(url);
        }
      } catch (error) {
        logger.error('Error generating setup URL:', error);
        logger.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        // On error, set empty string - UI should show error message
        setShareLink('');
      }
    };

    generateUrl();
  }, [childId]);

  // Set challenge exists when onboarding is complete
  useEffect(() => {
    if (typeof window !== 'undefined') {
    }
  }, []);
  
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

  const handleGoToDashboard = () => {
    // Clean up challengeData before navigating to dashboard
    if (typeof window !== 'undefined') {
      localStorage.removeItem('challengeData');
      logger.log('Cleaned up challengeData before navigating to dashboard');
    }
    router.push('/dashboard');
  };

  // Clean up challengeData after timeout (5 minutes) if user doesn't navigate to dashboard
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('challengeData');
        logger.log('Cleaned up challengeData after timeout');
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
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
               צאו מתפקיד השוטר- תנו אמון בילד ותקבלו בחזרה את השקט.
            </p>
            
            <p className="font-varela text-base text-[#282743] leading-relaxed">
              לאחר מכן, {parentP.you} {parentP.youVerb} את {displayName} בקישור אליו {pronouns.he} {pronouns.he === 'היא' ? 'תכנס' : 'יכנס'} מדי יום כדי לעדכן את הסטטוס {pronouns.his}.
            </p>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[12px] p-4 mt-4">
              <p className="font-varela text-sm text-[#262135] leading-relaxed">
                <strong>חשוב לדעת:</strong>
              </p>
              <ul className="font-varela text-sm text-[#262135] leading-relaxed mt-2 space-y-2 list-disc list-inside">
                <li>
                  {parentP.youAre} ה{parentP.user} ה{parentP.only} ש{parentP.registered} למערכת, {displayName} רק מעלה את צילום זמן המסך {pronouns.his} ולנו אין גישה {pronouns.to}.
                </li>
                <li>
                  בסוף השבוע, אם {displayName} {pronouns.he === 'היא' ? 'עמדה' : 'עמד'} באתגר {pronouns.he === 'היא' ? 'והרוויחה' : 'ורוויח'} כסף, {pronouns.he === 'היא' ? 'היא תקבל' : 'הוא יקבל'} כמה חלופות לכסף כמו חסכון, פעילות ומתנה.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Parent tutorial video for Android devices - between Box 1 and Box 2 */}
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

        {/* Go to Dashboard */}
        <button
          onClick={handleGoToDashboard}
          className="w-full py-4 px-6 rounded-[18px] bg-[#273143] text-white text-lg font-varela font-semibold hover:bg-opacity-90 transition-all"
        >
          מעבר ללוח בקרה
        </button>
      </div>
    </div>
  );
}

export default function OnboardingCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
      <OnboardingCompleteContent />
    </Suspense>
  );
}

