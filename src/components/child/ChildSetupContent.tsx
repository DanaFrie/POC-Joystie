'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatNumber, formatScreenTimeGoalHours } from '@/utils/formatting';
import { validateSetupUrl } from '@/utils/url-validation';
import type { ValidateChildUrlResult } from '@/utils/url-validation';
import { generateChildUrl } from '@/utils/url-encoding';
import { ChildWaitRedemptionContent } from '@/components/child/ChildWaitRedemptionContent';
import { decodeParentToken } from '@/utils/url-encoding';
import { updateChild } from '@/lib/api/children';
import { getChild } from '@/lib/api/children';
import { getChallenge } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import { clientConfig } from '@/config/client.config';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('child/setup');

export function ChildSetupContent({ validationOverride }: { validationOverride?: ValidateChildUrlResult | null } = {}) {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState('');
  const [selectedNickname, setSelectedNickname] = useState('');
  const [selectedMoneyGoals, setSelectedMoneyGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(validationOverride?.mode === 'setup' ? true : null);
  const [urlError, setUrlError] = useState<string>('');
  const [parentId, setParentId] = useState<string>(validationOverride?.parentId || '');
  const [challengeInactive, setChallengeInactive] = useState<boolean>(false);
  const [validatedChildId, setValidatedChildId] = useState<string | null>(validationOverride?.childId || null);
  const [childGender, setChildGender] = useState<'boy' | 'girl'>('boy');
  const [redemptionDate, setRedemptionDate] = useState<string>('');
  const [dealData, setDealData] = useState<{
    parentName: string;
    parentGender?: 'male' | 'female';
    weeklyBudget: number;
    dailyBudget: number;
    dailyScreenTimeGoal: number;
    deviceType: 'ios' | 'android';
  }>({
    parentName: '',
    parentGender: 'female',
    weeklyBudget: clientConfig.challenge.defaultSelectedBudget,
    dailyBudget: clientConfig.challenge.defaultSelectedBudget / clientConfig.challenge.budgetDivision,
    dailyScreenTimeGoal: clientConfig.challenge.defaultDailyScreenTimeGoal,
    deviceType: 'ios'
  });
  const [challengeId, setChallengeId] = useState<string | null>(validationOverride?.challengeId || null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const childId = searchParams.get('childId') || '';
  const nameFromUrl = searchParams.get('name') || '';

  // When validationOverride is provided (from unified /child page), set state from it and skip URL validation
  useEffect(() => {
    if (validationOverride?.mode === 'setup' && validationOverride.parentId) {
      setUrlValid(true);
      setParentId(validationOverride.parentId);
      setValidatedChildId(validationOverride.childId || null);
      if (validationOverride.challengeId) setChallengeId(validationOverride.challengeId);
    }
  }, [validationOverride]);

  // Load challenge and parent data from Firestore based on token
  useEffect(() => {
    const loadChallengeData = async () => {
      if (!token) return;
      
      try {
        logger.log('Decoding token to get challenge data...');
        const decoded = decodeParentToken(token);
        
        if (!decoded || decoded.isExpired) {
          logger.warn('Invalid or expired token');
          return;
        }
        
        const { parentId: decodedParentId, challengeId: decodedChallengeId, childId: decodedChildId } = decoded;
        logger.log('Decoded token:', { decodedParentId, decodedChallengeId, decodedChildId });
        
        let challenge = null;
        
        // Try to fetch challenge data - first from challengeId in token, then from active challenge
        if (decodedChallengeId) {
          try {
            challenge = await getChallenge(decodedChallengeId);
            if (challenge) {
              logger.log('Loaded challenge from token challengeId:', challenge);
            }
          } catch (challengeError) {
            logger.error('Error loading challenge by ID:', challengeError);
          }
        }
        
        // If no challenge from token, try to get active challenge for parent
        if (!challenge) {
          try {
            const { getActiveChallenge } = await import('@/lib/api/challenges');
            challenge = await getActiveChallenge(decodedParentId);
            if (challenge) {
              logger.log('Loaded active challenge from parentId:', challenge);
            }
          } catch (activeChallengeError) {
            logger.error('Error loading active challenge:', activeChallengeError);
          }
        }
        
        // If we have challenge data, use it
        if (challenge) {
          // Calculate budgets
          const weeklyBudget = challenge.selectedBudget;
          const dailyBudget = weeklyBudget / clientConfig.challenge.budgetDivision;
          const dailyScreenTimeGoal = challenge.dailyScreenTimeGoal;
          
          // Get parent data for parent name and gender
          let parentName = '';
          let parentGender: 'male' | 'female' = 'female';
          try {
            const parent = await getUser(decodedParentId);
            if (parent) {
              parentName = parent.firstName || '';
              parentGender = parent.gender || 'female';
              logger.log('Loaded parent from Firestore:', parent.firstName);
            }
          } catch (parentError) {
            logger.error('Error loading parent:', parentError);
          }
          
          // Get child data for deviceType and gender
          let deviceType: 'ios' | 'android' = 'ios';
          if (decodedChildId) {
            try {
              const child = await getChild(decodedChildId);
              if (child) {
                deviceType = child.deviceType;
                setChildGender(child.gender || 'boy');
                logger.log('Loaded child from Firestore, deviceType:', deviceType, 'gender:', child.gender);
      }
            } catch (childError) {
              logger.error('Error loading child:', childError);
            }
          }
          
          setDealData({
            parentName,
            parentGender,
            weeklyBudget,
            dailyBudget,
            dailyScreenTimeGoal,
            deviceType
          });
          
          // Store challengeId and redemption date for complete screen
          setChallengeId(challenge.id);
          if (challenge.startDate) {
            const start = new Date(challenge.startDate);
            start.setHours(0, 0, 0, 0);
            const redemption = new Date(start);
            redemption.setDate(start.getDate() + (challenge.challengeDays ?? 6));
            setRedemptionDate(redemption.toLocaleDateString('he-IL'));
          }

          logger.log('Set deal data from Firestore:', {
            parentName,
            weeklyBudget,
            dailyBudget,
            dailyScreenTimeGoal,
            deviceType,
            challengeId: challenge.id
          });
        } else {
          // Fallback: if no challenge found, try to get parent data only
          logger.log('Challenge not available, using parent data only');
          try {
            const parent = await getUser(decodedParentId);
            if (parent) {
              setDealData(prev => ({
                ...prev,
                parentName: parent.firstName || '',
                parentGender: parent.gender || 'female'
              }));
            }
          } catch (parentError) {
            logger.error('Error loading parent as fallback:', parentError);
          }
        }
      } catch (error) {
        logger.error('Error loading challenge data:', error);
      }
    };
    
    loadChallengeData();
  }, [token]);
  
  // Determine if parent is mom or dad using gender from Firestore
  const getParentTitle = () => {
    const gender = dealData.parentGender || 'female';
    return gender === 'female' ? 'אמא' : 'אבא';
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

  const generateRandomNickname = () => {
    // Select random nickname from pool (no uniqueness check)
    const randomIndex = Math.floor(Math.random() * nicknamePool.length);
    const randomNickname = nicknamePool[randomIndex];
    setSelectedNickname(randomNickname);
  };

  // Gift options for kids (translated to Hebrew)
  // Pre-shuffled order (randomized once and saved)
  const moneyGoalOptions = [
    { id: 'pizza-friend', label: 'פיצה עם חבר/ה' },
    { id: 'craft-kit', label: 'ערכת יצירה' },
    { id: 'escape-room', label: 'חדר בריחה' },
    { id: 'lego', label: 'לגו (LEGO)' },
    { id: 'icecream', label: 'גלידה' },
    { id: 'football', label: 'כדורגל' },
    { id: 'save-money', label: 'אני רוצה לחסוך!' },
    { id: 'supergoal-cards', label: 'קלפי סופרגול' },
    { id: 'slime', label: 'סליים (Slime)' },
    { id: 'popcorn', label: 'פופקורן (לסרט)' },
    { id: 'playstation-game', label: 'משחק לפלייסטיישן' },
    { id: 'lol-doll', label: 'בובת לאבובו' }
  ];

  // Validate URL token on mount (skip when validationOverride from unified page)
  useEffect(() => {
    if (validationOverride?.mode === 'setup') return;

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
              logger.error('Error loading child data:', error);
            }
          }
        } else {
          setUrlValid(false);
          setUrlError(validation.error || 'כתובת לא תקינה');
        }
      } catch (error) {
        logger.error('Error validating URL:', error);
        setUrlValid(false);
        setUrlError('שגיאה בבדיקת הכתובת');
      }
    };

    validateUrl();
  }, [token, validationOverride?.mode]);

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
          logger.error('Error loading child name:', error);
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
        logger.error('Error saving setup data:', error);
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

  // Reset scroll position when step changes or complete screen is shown
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, showCompleteScreen]);

  // Child URL (same for setup and redemption â€“ on redemption day this link shows redemption funnel)
  const childUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/child?token=${token}`
      : generateChildUrl(parentId, validatedChildId || undefined, challengeId || undefined);

  // Show error if challenge is inactive (redemption completed)
  if (challengeInactive) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <h1 className="font-heebo font-semibold text-2xl text-[#262135] mb-4">
              האתגר הושלם
            </h1>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-4 mb-4">
              <p className="font-heebo text-base text-[#262135] text-center leading-relaxed mb-2">
                האתגר הושלם והפדיון בוצע.
              </p>
              <p className="font-heebo text-sm text-[#262135] text-center leading-relaxed">
                {parentTitle} צריך ליצור אתגר חדש כדי שתוכל להתחיל.
              </p>
            </div>
            <p className="font-heebo text-sm text-[#948DA9]">
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
            <h1 className="font-heebo font-semibold text-2xl text-[#262135] mb-4">
              כתובת לא תקינה
            </h1>
            <p className="font-heebo text-base text-[#282743] mb-4">
              כנראה שכבר סיימת את השלב הזה, תפנה להורה שלך לקבל כתובת עדכנית.
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
            <p className="font-heebo text-base text-[#282743]">בודק כתובת...</p>
          </div>
        </div>
      </div>
    );
  }

  // Complete screen: same URL â€“ on redemption day it becomes the redemption funnel (upload + redeem)
  if (showCompleteScreen) {
    return (
      <ChildWaitRedemptionContent
        childUrl={childUrl}
        redemptionDate={redemptionDate || undefined}
        isAfterSetup={true}
        childName={childName || selectedNickname || undefined}
        childGender={childGender}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Piggy Bank - פינה ימנית עליונה */}
        <div className="absolute right-0 top-0 z-0 pointer-events-none">
          <Image
            src="/piggy-bank.png"
            alt="Piggy Bank"
            width={120}
            height={120}
            className="object-contain w-28 h-28 sm:w-28 sm:h-28 md:w-34 md:h-34 max-w-[112px] sm:max-w-[112px] md:max-w-[136px]"
          />
        </div>

        {/* Progress indicator */}
        <div className="mb-6 mt-20">
          <div className="flex justify-between mb-2">
            <span className="font-heebo text-sm text-[#948DA9]">שלב {step} מתוך 3</span>
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
              <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-4 text-center">
                {childName ? `${childName}!` : 'היי!'} {parentTitle} {parentTitle === 'אמא' ? 'החליטה' : 'החליט'} לעשות איתך דיל... רוצה לדעת מה הוא?
              </h2>
              <p className="font-heebo text-base text-[#282743] mb-6 text-center leading-relaxed">
                בואו נתחיל! בחר כינוי מגניב:
              </p>
              <div className="mb-4">
                <label className="block font-heebo font-semibold text-base text-[#262135] mb-3">
                  כינוי (שם משתמש)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={selectedNickname}
                    readOnly
                    placeholder="לחץ על 'להגריל' כדי ליצור כינוי"
                    className={`flex-1 p-4 border-2 rounded-[18px] bg-gray-50 cursor-not-allowed font-heebo text-base text-[#282743] ${
                      selectedNickname ? 'border-[#273143]' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={generateRandomNickname}
                    className="w-full sm:w-auto px-4 sm:px-6 py-4 bg-[#E6F19A] hover:bg-[#E6F19A] hover:bg-opacity-80 border-2 border-[#E6F19A] rounded-[18px] font-heebo font-semibold text-base text-[#262135] transition-all whitespace-nowrap"
                  >
                    להגריל
                  </button>
                </div>
                {selectedNickname && (
                  <p className="mt-2 text-sm text-[#948DA9] font-heebo text-center">
                    מרוצה מהכינוי? לחץ על "המשך" כדי להמשיך
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-4 text-center">
                הדיל שלך עם {parentTitle}:
              </h2>
              <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] p-6 space-y-4">
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-heebo text-sm text-[#948DA9] mb-1">יעד זמן מסך יומי:</p>
                  <p className="font-heebo font-bold text-2xl text-[#262135]">
                    {formatScreenTimeGoalHours(dealData.dailyScreenTimeGoal)}
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-heebo text-sm text-[#948DA9] mb-1">תקציב שבועי:</p>
                  <p className="font-heebo font-bold text-2xl text-[#262135]">
                    ₪{dealData.weeklyBudget}
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-heebo text-sm text-[#948DA9] mb-1">תקציב יומי:</p>
                  <p className="font-heebo font-bold text-2xl text-[#262135]">
                    ₪{formatNumber(dealData.dailyBudget)}
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4 mb-3">
                  <p className="font-heebo text-xs text-[#282743] text-center leading-relaxed">
                    אם {childName ? (childGender === 'girl' ? 'תעמדי' : 'תעמוד') : 'תעמוד'} ביעד של {formatScreenTimeGoalHours(dealData.dailyScreenTimeGoal)} ביום, {childName ? (childGender === 'girl' ? 'תקבלי' : 'תקבל') : 'תקבל'} את כל התקציב היומי! אם {childName ? (childGender === 'girl' ? 'תעברי' : 'תעבור') : 'תעבור'} את היעד, התקציב יקטן בהתאם.
                  </p>
                </div>
                <div className="bg-[#E6F19A] bg-opacity-60 rounded-[12px] p-3 border-2 border-[#E6F19A]">
                  <p className="font-heebo text-xs text-[#262135] text-center leading-relaxed font-semibold">
                    האתגר נמשך 6 ימים ויום הפדיון הוא היום ה-7. ביום הפדיון {childGender === 'girl' ? 'תוכלי' : 'תוכל'} לראות כמה כסף צברת ולפדות אותו!
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-4 text-center">
                מה תרצה לעשות עם הכסף?
              </h2>
              <p className="font-heebo text-sm text-[#948DA9] mb-4 text-center">
                בחר כמה ש{childGender === 'girl' ? 'את' : 'אתה'} רוצה (ניתן לבחור יותר מאחד)
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
                      <span className="font-heebo font-semibold text-xs text-[#282743] block">
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
        <div className="flex gap-4 mb-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 px-6 rounded-[18px] border-2 border-gray-300 text-lg font-heebo font-semibold text-[#282743] hover:bg-gray-50 transition-all"
            >
              חזרה
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 py-4 px-6 rounded-[18px] text-lg font-heebo font-semibold transition-all ${
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
