'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import { generateSetupUrl } from '@/utils/url-encoding';
import { getCurrentUserId } from '@/utils/auth';
import { getActiveChallenge } from '@/lib/api/challenges';

function OnboardingCompleteContent() {
  const [shareLink, setShareLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedType, setCopiedType] = useState<'link' | 'text' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const childName = searchParams.get('name') || '';
  const childGender = searchParams.get('gender') || 'boy';
  const childId = searchParams.get('childId') || '';

  // Get parent data and challenge data from localStorage
  const getParentData = () => {
    try {
      if (typeof window !== 'undefined') {
        const challengeData = localStorage.getItem('challengeData');
        if (challengeData) {
          try {
            const parsed = JSON.parse(challengeData);
            return {
              parentName: parsed.parentName || '',
              parentGender: 'female', // Default, will be determined from name
              deviceType: parsed.deviceType || 'ios'
            };
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        const signupData = localStorage.getItem('signupFormData');
        if (signupData) {
          try {
            const parsed = JSON.parse(signupData);
            return {
              parentName: parsed.firstName || '',
              parentGender: parsed.gender === 'female' ? 'female' : 'male',
              deviceType: 'ios' // Default
            };
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return {
      parentName: '',
      parentGender: 'female',
      deviceType: 'ios'
    };
  };

  const parentData = getParentData();
  const parentName = parentData.parentName;
  const parentGender = parentData.parentGender;
  const deviceType = parentData.deviceType;
  
  // Parent pronouns
  const parentPronouns = {
    female: { you: 'את', youVerb: 'תשתפי', youAre: 'את', registered: 'רשומה', defined: 'הגדרת' },
    male: { you: 'אתה', youVerb: 'תשתף', youAre: 'אתה', registered: 'רשום', defined: 'הגדרת' }
  };
  const parentP = parentPronouns[parentGender as 'female' | 'male'] || parentPronouns.female;

  // Generate setup URL with token
  useEffect(() => {
    const generateUrl = async () => {
      try {
        // Wait a bit for Firebase to initialize if needed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const userId = await getCurrentUserId();
        if (!userId) {
          // User not logged in - show error message instead of invalid token
          console.error('Cannot generate URL: User not logged in (getCurrentUserId returned null)');
          setShareLink(''); // Empty string - UI should handle this
          return;
        }

        console.log('User ID found:', userId);
        
        try {
          const challenge = await getActiveChallenge(userId);
          const childIdToUse = childId || challenge?.childId;
          console.log('Challenge found:', challenge?.id, 'Child ID:', childIdToUse);
          
          const url = generateSetupUrl(userId, childIdToUse);
          console.log('Generated URL successfully');
          setShareLink(url);
        } catch (challengeError) {
          console.error('Error getting challenge:', challengeError);
          // Still generate URL with just parentId if challenge fetch fails
          const url = generateSetupUrl(userId, childId);
          setShareLink(url);
        }
      } catch (error) {
        console.error('Error generating setup URL:', error);
        console.error('Error details:', {
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
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', child: 'הילד', fallback: 'הילד' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', child: 'הילדה', fallback: 'הילדה' }
  };
  const pronouns = genderPronouns[childGender as 'boy' | 'girl'] || genderPronouns.boy;
  
  // Use child name if available, otherwise use gender-appropriate fallback
  const displayName = childName || pronouns.fallback;
  
  const shareText = `${displayName}! מצאתי משהו חדש שגם נותן לך יותר שליטה בכסף שלך וגם ייתן לך יותר חופש בטלפון\n\nזה הקישור שלך – רוצה לגלות איך זה עובד ביחד?\n\n${shareLink}`;

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setCopiedType('link');
      setTimeout(() => {
        setCopied(false);
        setCopiedType(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyFullText = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setCopiedType('text');
      setTimeout(() => {
        setCopied(false);
        setCopiedType(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

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
              מתחילים עם {displayName}. {parentP.you} {parentP.youVerb} את {displayName} בקישור אליו {pronouns.he} {pronouns.he === 'היא' ? 'תכנס' : 'יכנס'} מדי יום כדי לעדכן את הסטטוס {pronouns.his}.
            </p>
            
            <p className="font-varela text-base text-[#282743] leading-relaxed">
              {parentP.youAre} המשתמש היחיד ש{parentP.registered} למערכת, {displayName} רק מעלה את צילום זמן המסך {pronouns.his} ולנו אין גישה אליו.
            </p>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[12px] p-4 mt-4">
              <p className="font-varela text-sm text-[#262135] leading-relaxed">
                <strong>חשוב לדעת:</strong> בסוף השבוע, אם {displayName} {pronouns.he === 'היא' ? 'עמדה' : 'עמד'} באתגר {pronouns.he === 'היא' ? 'והרוויחה' : 'ורוויח'} כסף, {pronouns.he === 'היא' ? 'היא תקבל' : 'הוא יקבל'} כמה חלופות לכסף כמו חסכון, פעילות ומתנה.
              </p>
            </div>
          </div>
        </div>

        {/* Parent tutorial video for Android devices - between Box 1 and Box 2 */}
        {deviceType === 'android' && (
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
            <p className="font-varela text-sm text-[#282743] mb-4 text-center leading-relaxed">
              {displayName} {pronouns.he === 'היא' ? 'תבקש' : 'יבקש'} ממך צילום מסך של זמן המסך {pronouns.his}.
            </p>
            <p className="font-varela text-sm text-[#282743] mb-4 text-center leading-relaxed">
              הסבר קצר כיצד לעשות זאת:
            </p>
            <div className="relative w-full aspect-video bg-gray-100 rounded-[12px] overflow-hidden mb-3">
              <video
                controls
                className="w-full h-full object-contain"
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
                        {/* Option 2: Copy Link with Text */}
                        <div className="bg-[#E4E4E4] bg-opacity-30 rounded-[18px] p-4">
              <h3 className="font-varela font-semibold text-sm text-[#273143] mb-3">
                העתק קישור עם טקסט
              </h3>
              <div className="bg-[#FFFCF8] rounded-[12px] p-4 mb-3 border-2 border-gray-200">
                <p className="font-varela text-sm text-[#273143] leading-relaxed whitespace-pre-wrap">
                  {shareText}
                </p>
              </div>
              <button
                onClick={handleCopyFullText}
                disabled={!shareLink}
                className={`w-full py-3 rounded-[12px] font-varela font-semibold text-sm transition-all ${
                  !shareLink
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : copied && copiedType === 'text'
                    ? 'bg-[#E6F19A] text-[#273143]'
                    : 'bg-[#273143] text-white hover:bg-opacity-90'
                }`}
              >
                {copied && copiedType === 'text' ? 'הועתק! ✓' : 'העתק'}
              </button>
            </div>
            
            {/* Option 1: Copy Link Only */}
            <div className="bg-[#E4E4E4] bg-opacity-30 rounded-[18px] p-4">
              <h3 className="font-varela font-semibold text-sm text-[#273143] mb-3">
                העתק קישור בלבד
              </h3>
              {!shareLink ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[12px] p-3">
                  <p className="font-varela text-sm text-[#262135] text-center">
                    שגיאה ביצירת הקישור. אנא רענן את הדף או בדוק שהתחברת למערכת.
                  </p>
                </div>
              ) : (
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 min-w-0 p-2 sm:p-3 border-2 border-gray-200 rounded-[12px] font-varela text-xs sm:text-sm text-[#273143] bg-white"
                  />
                  <button
                    onClick={handleCopyLink}
                    disabled={!shareLink}
                    className={`px-2.5 sm:px-3 md:px-4 py-2 sm:py-3 rounded-[12px] font-varela font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                      !shareLink
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : copied && copiedType === 'link'
                        ? 'bg-[#E6F19A] text-[#273143]'
                        : 'bg-[#273143] text-white hover:bg-opacity-90'
                    }`}
                  >
                    {copied && copiedType === 'link' ? 'הועתק! ✓' : 'העתק'}
                  </button>
                </div>
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

