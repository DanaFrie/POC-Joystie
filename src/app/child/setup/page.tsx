'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import { validateSetupUrl } from '@/utils/url-validation';
import { generateUploadUrl } from '@/utils/url-encoding';
import { decodeParentToken } from '@/utils/url-encoding';
import { updateChild } from '@/lib/api/children';
import { getChild } from '@/lib/api/children';
import { getOccupiedNicknames } from '@/lib/api/children';
import { getChallenge } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import { clientConfig } from '@/config/client.config';

function ChildSetupContent() {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState('');
  const [selectedNickname, setSelectedNickname] = useState('');
  const [selectedMoneyGoals, setSelectedMoneyGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [urlError, setUrlError] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [challengeInactive, setChallengeInactive] = useState<boolean>(false);
  const [validatedChildId, setValidatedChildId] = useState<string | null>(null);
  const [childGender, setChildGender] = useState<'boy' | 'girl'>('boy');
  const [copied, setCopied] = useState(false);
  const [dealData, setDealData] = useState<{
    parentName: string;
    weeklyBudget: number;
    dailyBudget: number;
    dailyScreenTimeGoal: number;
    deviceType: 'ios' | 'android';
  }>({
    parentName: '',
    weeklyBudget: clientConfig.challenge.defaultSelectedBudget,
    dailyBudget: clientConfig.challenge.defaultSelectedBudget / clientConfig.challenge.budgetDivision,
    dailyScreenTimeGoal: clientConfig.challenge.defaultDailyScreenTimeGoal,
    deviceType: 'ios'
  });
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const childId = searchParams.get('childId') || '';
  const nameFromUrl = searchParams.get('name') || '';

  // Load challenge and parent data from Firestore based on token
  useEffect(() => {
    const loadChallengeData = async () => {
      if (!token) return;
      
      try {
        console.log('[child/setup] Decoding token to get challenge data...');
        const decoded = decodeParentToken(token);
        
        if (!decoded || decoded.isExpired) {
          console.warn('[child/setup] Invalid or expired token');
          return;
        }
        
        const { parentId: decodedParentId, challengeId: decodedChallengeId, childId: decodedChildId } = decoded;
        console.log('[child/setup] Decoded token:', { decodedParentId, decodedChallengeId, decodedChildId });
        
        let challenge = null;
        
        // Try to fetch challenge data - first from challengeId in token, then from active challenge
        if (decodedChallengeId) {
          try {
            challenge = await getChallenge(decodedChallengeId);
            if (challenge) {
              console.log('[child/setup] Loaded challenge from token challengeId:', challenge);
            }
          } catch (challengeError) {
            console.error('[child/setup] Error loading challenge by ID:', challengeError);
          }
        }
        
        // If no challenge from token, try to get active challenge for parent
        if (!challenge) {
          try {
            const { getActiveChallenge } = await import('@/lib/api/challenges');
            challenge = await getActiveChallenge(decodedParentId);
            if (challenge) {
              console.log('[child/setup] Loaded active challenge from parentId:', challenge);
            }
          } catch (activeChallengeError) {
            console.error('[child/setup] Error loading active challenge:', activeChallengeError);
          }
        }
        
        // If we have challenge data, use it
        if (challenge) {
          // Calculate budgets
          const weeklyBudget = challenge.selectedBudget;
          const dailyBudget = weeklyBudget / clientConfig.challenge.budgetDivision;
          const dailyScreenTimeGoal = challenge.dailyScreenTimeGoal;
          
          // Get parent data for parent name
          let parentName = '';
          try {
            const parent = await getUser(decodedParentId);
            if (parent) {
              parentName = parent.firstName || '';
              console.log('[child/setup] Loaded parent from Firestore:', parent.firstName);
            }
          } catch (parentError) {
            console.error('[child/setup] Error loading parent:', parentError);
          }
          
          // Get child data for deviceType
          let deviceType: 'ios' | 'android' = 'ios';
          if (decodedChildId) {
            try {
              const child = await getChild(decodedChildId);
              if (child) {
                deviceType = child.deviceType;
                console.log('[child/setup] Loaded child from Firestore, deviceType:', deviceType);
      }
            } catch (childError) {
              console.error('[child/setup] Error loading child:', childError);
            }
          }
          
          setDealData({
            parentName,
            weeklyBudget,
            dailyBudget,
            dailyScreenTimeGoal,
            deviceType
          });
          
          // Store challengeId for generating upload URL
          setChallengeId(challenge.id);
          
          console.log('[child/setup] Set deal data from Firestore:', {
            parentName,
            weeklyBudget,
            dailyBudget,
            dailyScreenTimeGoal,
            deviceType,
            challengeId: challenge.id
          });
        } else {
          // Fallback: if no challenge found, try to get parent data only
          console.log('[child/setup] Challenge not available, using parent data only');
          try {
            const parent = await getUser(decodedParentId);
            if (parent) {
              setDealData(prev => ({
                ...prev,
                parentName: parent.firstName || ''
              }));
            }
          } catch (parentError) {
            console.error('[child/setup] Error loading parent as fallback:', parentError);
          }
        }
      } catch (error) {
        console.error('[child/setup] Error loading challenge data:', error);
      }
    };
    
    loadChallengeData();
  }, [token]);
  
  // Determine if parent is mom or dad
  const getParentTitle = () => {
    const name = dealData.parentName.trim();
    if (name.endsWith('ה') || name.endsWith('ית')) {
      return 'אמא';
    }
    return 'אבא';
  };

  const parentTitle = getParentTitle();

  // Nickname pool for random generation - fun nicknames for kids
  const nicknamePool = [
    'גיבור', 'כוכב', 'לוחם', 'מלך', 'נסיך', 'גיבור על', 'כוכב על', 'לוחם על', 'מלך על', 'נסיך על',
    'גיבורה', 'כוכבת', 'לוחמת', 'מלכה', 'נסיכה', 'גיבורת על', 'כוכבת על', 'לוחמת על', 'מלכת על', 'נסיכת על',
    'גיבור#המגניב', 'כוכב@הסופר', 'לוחם$הטוב', 'מלך&המנצח', 'נסיך#הגיבור',
    'גיבורה@הסופר', 'כוכבת$הטובה', 'לוחמת&המנצחת', 'מלכת#הגיבורה', 'נסיכת@הסופר',
    'גיבור_המגניב', 'כוכב@הסופר', 'לוחם$הטוב', 'מלך&המנצח', 'נסיך#הגיבור',
    'גיבורה_הסופר', 'כוכבת@הטובה', 'לוחמת$המנצחת', 'מלכת&הגיבורה', 'נסיכת#הסופר',
    'גיבור@הכי@טוב', 'כוכב#הכי$מגניב', 'לוחם&הכי@גיבור', 'מלך$הכי#טוב', 'נסיך&הכי@מגניב',
    'גיבורה@הכי@טובה', 'כוכבת#הכי$מגניבה', 'לוחמת&הכי@גיבורה', 'מלכת$הכי#טובה', 'נסיכת&הכי@מגניבה'
  ];

  const generateRandomNickname = async () => {
    try {
      // Get occupied nicknames
      const occupiedNicknames = await getOccupiedNicknames();
      
      // Filter out occupied nicknames
      const availableNicknames = nicknamePool.filter(
        nickname => !occupiedNicknames.includes(nickname)
      );
      
      // If all nicknames are occupied, use the full pool (allow duplicates)
      const poolToUse = availableNicknames.length > 0 ? availableNicknames : nicknamePool;
      
      // Select random nickname from available pool
      const randomIndex = Math.floor(Math.random() * poolToUse.length);
      const randomNickname = poolToUse[randomIndex];
      setSelectedNickname(randomNickname);
    } catch (error) {
      console.error('Error generating nickname:', error);
      // Fallback to simple random selection if error
    const randomNickname = nicknamePool[Math.floor(Math.random() * nicknamePool.length)];
    setSelectedNickname(randomNickname);
    }
  };

  // Digital games and prizes options for kids (translated to Hebrew)
  const moneyGoalOptions = [
    { id: 'roblox', label: 'Robux ל-Roblox' },
    { id: 'minecraft', label: 'מטבעות Minecraft' },
    { id: 'fortnite', label: 'V-Bucks ל-Fortnite' },
    { id: 'nintendo', label: 'Nintendo eShop' },
    { id: 'xbox', label: 'כרטיס מתנה Xbox' },
    { id: 'playstation', label: 'חנות PlayStation' },
    { id: 'discord', label: 'Discord Nitro' },
    { id: 'twitch', label: 'Twitch Bits' },
    { id: 'tiktok', label: 'מטבעות TikTok' },
    { id: 'slime', label: 'סליים' },
    { id: 'icecream', label: 'גלידה' },
    { id: 'girlsseries', label: 'מתנת K-pop' }
  ];

  // Validate URL token on mount
  useEffect(() => {
    const validateUrl = async () => {
      if (!token) {
        setUrlValid(false);
        setUrlError('כתובת לא תקינה - חסר טוקן');
        return;
      }

      try {
        const validation = await validateSetupUrl(token);
        if (validation.isValid && validation.parentId) {
          // FIRST CHECK: Verify challenge is active
          let challenge = null;
          if (validation.challengeId) {
            challenge = await getChallenge(validation.challengeId);
          } else {
            // Try to get active challenge
            const { getActiveChallenge } = await import('@/lib/api/challenges');
            challenge = await getActiveChallenge(validation.parentId);
          }
          
          // If challenge exists but is not active, show error
          if (challenge && !challenge.isActive) {
            setUrlValid(false);
            setChallengeInactive(true);
            setUrlError('האתגר הושלם כבר. הפדיון בוצע והאתגר לא פעיל יותר.');
            return;
          }
          
          setUrlValid(true);
          setParentId(validation.parentId);
          setValidatedChildId(validation.childId || null);
          
          // Load child data if childId exists
          if (validation.childId) {
            try {
              const child = await getChild(validation.childId);
              if (child) {
                setChildName(child.name || '');
                setChildGender(child.gender || 'boy');
                if (child.nickname) {
                  setSelectedNickname(child.nickname);
                }
                if (child.moneyGoals && child.moneyGoals.length > 0) {
                  setSelectedMoneyGoals(child.moneyGoals);
                }
              }
            } catch (error) {
              console.error('Error loading child data:', error);
            }
          }
        } else {
          setUrlValid(false);
          setUrlError(validation.error || 'כתובת לא תקינה');
        }
      } catch (error) {
        console.error('Error validating URL:', error);
        setUrlValid(false);
        setUrlError('שגיאה בבדיקת הכתובת');
      }
    };

    validateUrl();
  }, [token]);

  // Initialize child name from URL or Firestore
  useEffect(() => {
    if (nameFromUrl) {
      setChildName(nameFromUrl);
    } else if (validatedChildId) {
      // Try to get from Firestore
      const loadChildName = async () => {
        try {
          const child = await getChild(validatedChildId);
          if (child && child.name) {
            setChildName(child.name);
          }
        } catch (error) {
          console.error('[child/setup] Error loading child name:', error);
      }
      };
      loadChildName();
    }
  }, [nameFromUrl, validatedChildId]);

  // Toggle money goal selection (multiple selection)
  const toggleMoneyGoal = (goalId: string) => {
    setSelectedMoneyGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save data to Firestore and localStorage
      setIsLoading(true);
      try {
        // Save to Firestore if we have childId
        if (validatedChildId && parentId) {
          await updateChild(validatedChildId, {
            nickname: selectedNickname,
            moneyGoals: selectedMoneyGoals
          }, parentId);
        }
        
        setShowCompleteScreen(true);
      } catch (error) {
        console.error('Error saving setup data:', error);
        alert('שגיאה בשמירת הנתונים. נסה שוב.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedNickname !== '';
      case 2:
        return true; // Deal display - no input needed
      case 3:
        return selectedMoneyGoals.length > 0;
      default:
        return false;
    }
  };

  // Generate upload URL with token (include challengeId if available)
  const uploadUrl = parentId 
    ? generateUploadUrl(parentId, validatedChildId || undefined, challengeId || undefined)
    : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(uploadUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Show error if challenge is inactive (redemption completed)
  if (challengeInactive) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4">
              האתגר הושלם
            </h1>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-4 mb-4">
              <p className="font-varela text-base text-[#262135] text-center leading-relaxed mb-2">
                האתגר הושלם והפדיון בוצע.
              </p>
              <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                {parentTitle} צריך ליצור אתגר חדש כדי שתוכל להתחיל.
              </p>
            </div>
            <p className="font-varela text-sm text-[#948DA9]">
              בדוק עם ההורה שלך לקבלת כתובת חדשה.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if URL is invalid
  if (urlValid === false) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4">
              כתובת לא תקינה
            </h1>
            <p className="font-varela text-base text-[#282743] mb-4">
              {urlError || 'הכתובת ששותפה איתך לא תקינה או שכבר הושלמה ההגדרה.'}
            </p>
            <p className="font-varela text-sm text-[#948DA9]">
              בדוק עם ההורה שלך לקבלת כתובת חדשה.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while validating
  if (urlValid === null) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <p className="font-varela text-base text-[#282743]">בודק כתובת...</p>
          </div>
        </div>
      </div>
    );
  }

  // Complete screen with URL and instructions
  if (showCompleteScreen) {
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-md mx-auto px-4 py-8 relative">
          {/* Piggy Bank - פינה ימנית עליונה */}
          <div className="absolute right-0 top-0 z-10">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-20">
            <div className="text-center mb-6">
              <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-2">
              {childName || selectedNickname || (childGender === 'boy' ? 'גיבור' : 'גיבורה')}, עכשיו {childGender === 'boy' ? 'אתה' : 'את'} {childGender === 'boy' ? 'מוכן' : 'מוכנה'} להתחיל!
              </h1>
            </div>

            <div className="rounded-[18px] p-6 mb-6">
              <h2 className="font-varela font-semibold text-lg text-[#262135] mb-4 text-center">
                {childGender === 'boy' ? 'שמור' : 'שמרי'} את הכתובת הזו במקום בטוח!
              </h2>
              <p className="font-varela text-sm text-[#282743] mb-4 text-center leading-relaxed">
                כל יום {childGender === 'boy' ? 'תצטרך' : 'תצטרכי'} להיכנס לכתובת הזו ולהעלות את צילום המסך שלך של זמן מסך
              </p>
              
              <div className="bg-white rounded-[12px] p-4 mb-4">
                <p className="font-varela text-xs text-[#948DA9] mb-2 text-center">הכתובת שלך:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={uploadUrl}
                    readOnly
                    className="flex-1 p-2 border-2 border-gray-200 rounded-[8px] font-varela text-xs text-[#282743] bg-gray-50"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className={`px-4 py-2 rounded-[8px] font-varela font-semibold text-xs transition-all ${
                      copied
                        ? 'bg-[#E6F19A] text-[#273143]'
                        : 'bg-[#273143] text-white hover:bg-opacity-90'
                    }`}
                  >
                    {copied ? 'הועתק! ✓' : 'העתק'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[12px] p-4 mb-4">
                <h3 className="font-varela font-semibold text-sm text-[#262135] mb-3 text-center">
                  איך להעלות צילום מסך של זמן מסך?
                </h3>

                {/* Video Container - Full width for long video */}
                <div className="relative w-full bg-gray-100 rounded-[8px] overflow-hidden mb-3" style={{ minHeight: '300px' }}>
                  {dealData.deviceType === 'ios' ? (
                    <video
                      controls
                      className="w-full h-auto object-contain"
                      poster="/video-poster-ios.jpg"
                    >
                      <source src="/screenshot-tutorial-ios.mp4" type="video/mp4" />
                      <source src="/screenshot-tutorial-ios.webm" type="video/webm" />
                      <p className="font-varela text-xs text-[#282743] p-2 text-center">
                        הדפדפן שלך לא תומך בהצגת סרטונים.
                      </p>
                    </video>
                  ) : (
                    <video
                      controls
                      className="w-full h-auto object-contain"
                      poster="/video-poster-android.jpg"
                    >
                      <source src="/screenshot-tutorial-android.mp4" type="video/mp4" />
                      <source src="/screenshot-tutorial-android.webm" type="video/webm" />
                      <p className="font-varela text-xs text-[#282743] p-2 text-center">
                        הדפדפן שלך לא תומך בהצגת סרטונים.
                      </p>
                    </video>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[12px] p-4">
                <p className="font-varela text-xs text-[#262135] text-center leading-relaxed">
                  <strong>טיפ:</strong> {childGender === 'boy' ? 'שמור' : 'שמרי'} את הכתובת בקיצור דרך או {childGender === 'boy' ? 'שלח' : 'שלחי'} אותה לעצמך בהודעה כדי ש{childGender === 'boy' ? 'תוכל' : 'תוכלי'} לגשת אליה כל יום בקלות!
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(uploadUrl)}
              className="w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold bg-[#273143] text-white hover:bg-opacity-90 transition-all"
            >
              בואו נתחיל!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Piggy Bank - פינה ימנית עליונה */}
        <div className="absolute right-0 top-0 z-10">
          <Image
            src="/piggy-bank.png"
            alt="Piggy Bank"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Progress indicator */}
        <div className="mb-6 mt-20">
          <div className="flex justify-between mb-2">
            <span className="font-varela text-sm text-[#948DA9]">שלב {step} מתוך 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#273143] h-2 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          {step === 1 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                {childName ? `${childName}!` : 'היי!'} {parentTitle} {parentTitle === 'אמא' ? 'החליטה' : 'החליט'} לעשות איתך דיל... רוצה לדעת מה הוא?
              </h2>
              <p className="font-varela text-base text-[#282743] mb-6 text-center leading-relaxed">
                בואו נתחיל! בחר כינוי מגניב:
              </p>
              <div className="mb-4">
                <label className="block font-varela font-semibold text-base text-[#262135] mb-3">
                  כינוי (שם משתמש)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={selectedNickname}
                    readOnly
                    placeholder="לחץ על 'להגריל' כדי ליצור כינוי"
                    className={`flex-1 p-4 border-2 rounded-[18px] bg-gray-50 cursor-not-allowed font-varela text-base text-[#282743] ${
                      selectedNickname ? 'border-[#273143]' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={generateRandomNickname}
                    className="w-full sm:w-auto px-4 sm:px-6 py-4 bg-[#E6F19A] hover:bg-[#E6F19A] hover:bg-opacity-80 border-2 border-[#E6F19A] rounded-[18px] font-varela font-semibold text-base text-[#262135] transition-all whitespace-nowrap"
                  >
                    להגריל
                  </button>
                </div>
                {selectedNickname && (
                  <p className="mt-2 text-sm text-[#948DA9] font-varela text-center">
                    מרוצה מהכינוי? לחץ על "המשך" כדי להמשיך
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                הדיל שלך עם {parentTitle}:
              </h2>
              <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] p-6 space-y-4">
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-varela text-sm text-[#948DA9] mb-1">יעד זמן מסך יומי:</p>
                  <p className="font-varela font-bold text-2xl text-[#262135]">
                    {dealData.dailyScreenTimeGoal} שעות
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-varela text-sm text-[#948DA9] mb-1">תקציב שבועי:</p>
                  <p className="font-varela font-bold text-2xl text-[#262135]">
                    ₪{dealData.weeklyBudget}
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-varela text-sm text-[#948DA9] mb-1">תקציב יומי:</p>
                  <p className="font-varela font-bold text-2xl text-[#262135]">
                    ₪{formatNumber(dealData.dailyBudget)}
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4 mb-3">
                  <p className="font-varela text-xs text-[#282743] text-center leading-relaxed">
                    אם {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'תעמודי' : 'תעמוד') : 'תעמוד'} ביעד של {dealData.dailyScreenTimeGoal} שעות ביום, {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'תקבלי' : 'תקבל') : 'תקבל'} את כל התקציב היומי! אם {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'תעברי' : 'תעבור') : 'תעבור'} את היעד, התקציב יקטן בהתאם.
                  </p>
                </div>
                <div className="bg-[#E6F19A] bg-opacity-60 rounded-[12px] p-3 border-2 border-[#E6F19A]">
                  <p className="font-varela text-xs text-[#262135] text-center leading-relaxed font-semibold">
                    האתגר נמשך 6 ימים: מיום ראשון עד יום שישי. יום שבת הוא יום הפדיון שבו {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'תוכלי' : 'תוכל') : 'תוכל'} לראות כמה כסף {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'צברת' : 'צברת') : 'צברת'} ולפדות אותו!
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                מה תרצה לעשות עם הכסף?
              </h2>
              <p className="font-varela text-sm text-[#948DA9] mb-4 text-center">
                בחר כמה ש{childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'את' : 'אתה') : 'אתה'} רוצה (ניתן לבחור יותר מאחד)
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {moneyGoalOptions.map((option, index) => {
                  // Random animation delay and duration for each button
                  const animationDelay = index * 0.08;
                  const animationDuration = 2 + (index % 4) * 0.4;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleMoneyGoal(option.id)}
                      className={`p-3 rounded-[12px] border-2 transition-all text-center relative float-animation ${
                        selectedMoneyGoals.includes(option.id)
                          ? 'border-[#273143] bg-[#273143] bg-opacity-10 scale-105'
                          : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                      }`}
                      style={{
                        animationDuration: `${animationDuration}s`,
                        animationDelay: `${animationDelay}s`
                      }}
                    >
                      <span className="font-varela font-semibold text-xs text-[#282743] block">
                        {option.label}
                      </span>
                      {selectedMoneyGoals.includes(option.id) && (
                        <span className="absolute top-1 right-1 text-[#273143] text-lg">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 px-6 rounded-[18px] border-2 border-gray-300 text-lg font-varela font-semibold text-[#282743] hover:bg-gray-50 transition-all"
            >
              חזרה
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
              canProceed()
                ? 'bg-[#273143] text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'סיום' : 'המשך'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChildSetupPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
        <ChildSetupContent />
      </Suspense>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .float-animation {
          animation: float ease-in-out infinite;
        }
      `}} />
    </>
  );
}

