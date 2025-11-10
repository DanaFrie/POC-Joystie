'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';

function ChildSetupContent() {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState('');
  const [selectedNickname, setSelectedNickname] = useState('');
  const [selectedMoneyGoals, setSelectedMoneyGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId') || '';
  const nameFromUrl = searchParams.get('name') || '';

  // Get parent and deal data from localStorage or defaults
  const getParentAndDealData = () => {
    try {
      if (typeof window !== 'undefined') {
        const storedChallenge = localStorage.getItem('challengeData');
        if (storedChallenge) {
          try {
            const parsed = JSON.parse(storedChallenge);
            return {
              parentName: parsed.parentName || 'דנה',
              weeklyBudget: parsed.weeklyBudget || 90,
              dailyBudget: parsed.dailyBudget || 12.9,
              dailyScreenTimeGoal: parsed.dailyScreenTimeGoal || 3,
              deviceType: parsed.deviceType || 'ios'
            };
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        // Try to get from dashboard test data
        const dashboardData = localStorage.getItem('dashboardTestData');
        if (dashboardData) {
          try {
            const parsed = JSON.parse(dashboardData);
            return {
              parentName: parsed.parent?.name || 'דנה',
              weeklyBudget: parsed.challenge?.weeklyBudget || 90,
              dailyBudget: parsed.challenge?.dailyBudget || 12.9,
              dailyScreenTimeGoal: parsed.challenge?.dailyScreenTimeGoal || 3,
              deviceType: parsed.challenge?.deviceType || 'ios'
            };
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }
    
    // Default values
    return {
      parentName: 'דנה',
      weeklyBudget: 90,
      dailyBudget: 12.9,
      dailyScreenTimeGoal: 3,
      deviceType: 'ios'
    };
  };

  const dealData = getParentAndDealData();
  
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

  const generateRandomNickname = () => {
    const randomNickname = nicknamePool[Math.floor(Math.random() * nicknamePool.length)];
    setSelectedNickname(randomNickname);
  };

  // Digital games and prizes options for kids
  const moneyGoalOptions = [
    { id: 'roblox', label: 'Robux ל-Roblox' },
    { id: 'minecraft', label: 'Minecraft Coins' },
    { id: 'fortnite', label: 'V-Bucks ל-Fortnite' },
    { id: 'nintendo', label: 'Nintendo eShop' },
    { id: 'xbox', label: 'Xbox Gift Card' },
    { id: 'playstation', label: 'PlayStation Store' },
    { id: 'discord', label: 'Discord Nitro' },
    { id: 'twitch', label: 'Twitch Bits' },
    { id: 'tiktok', label: 'TikTok Coins' },
    { id: 'slime', label: 'Slime' },
    { id: 'icecream', label: 'Ice Cream' },
    { id: 'girlsseries', label: 'Kpop gift' }
  ];

  // Initialize child name from URL or localStorage
  useEffect(() => {
    if (nameFromUrl) {
      setChildName(nameFromUrl);
    } else if (typeof window !== 'undefined') {
      // Try to get from localStorage
      const storedName = localStorage.getItem('childName');
      if (storedName) {
        setChildName(storedName);
      }
    }
  }, [nameFromUrl]);

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

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save data and show complete screen
      if (typeof window !== 'undefined') {
        if (childName) {
          localStorage.setItem('childName', childName);
        }
        localStorage.setItem('childNickname', selectedNickname);
        localStorage.setItem('childMoneyGoals', JSON.stringify(selectedMoneyGoals));
      }
      setShowCompleteScreen(true);
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

  // Generate upload URL
  const uploadUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/child/upload${childId ? `?childId=${childId}` : ''}`
    : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(uploadUrl);
      alert('הכתובת הועתקה!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
              {childName || selectedNickname || 'גיבור'}, עכשיו {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'את' : 'אתה') : 'אתה'} מוכן להתחיל!
              </h1>
            </div>

            <div className="rounded-[18px] p-6 mb-6">
              <h2 className="font-varela font-semibold text-lg text-[#262135] mb-4 text-center">
                שמור את הכתובת הזו במקום בטוח!
              </h2>
              <p className="font-varela text-sm text-[#282743] mb-4 text-center leading-relaxed">
                כל יום תצטרך להיכנס לכתובת הזו ולהעלות את צילום המסך שלך של זמן מסך
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
                    className="px-4 py-2 bg-[#273143] text-white rounded-[8px] font-varela font-semibold text-xs hover:bg-opacity-90 transition-all"
                  >
                    העתק
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[12px] p-4 mb-4">
                <h3 className="font-varela font-semibold text-sm text-[#262135] mb-3 text-center">
                  איך להעלות צילום מסך של זמן מסך?
                </h3>
                
                {/* Platform Selection */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setSelectedPlatform('ios')}
                      className={`flex-1 py-1.5 px-3 rounded-[8px] font-varela font-semibold text-sm transition-all ${
                        selectedPlatform === 'ios'
                          ? 'bg-[#273143] text-white'
                          : 'bg-gray-200 text-[#282743]'
                      }`}
                    >
                      iPhone
                    </button>
                    <button
                      onClick={() => setSelectedPlatform('android')}
                      className={`flex-1 py-1.5 px-3 rounded-[8px] font-varela font-semibold text-sm transition-all ${
                        selectedPlatform === 'android'
                          ? 'bg-[#273143] text-white'
                          : 'bg-gray-200 text-[#282743]'
                      }`}
                    >
                      Android
                    </button>
                  </div>
                </div>

                {/* Video Container */}
                <div className="relative w-full aspect-video bg-gray-100 rounded-[8px] overflow-hidden mb-3">
                  {selectedPlatform === 'ios' ? (
                    <video
                      controls
                      className="w-full h-full object-contain"
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
                      className="w-full h-full object-contain"
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
                  <strong>טיפ:</strong> שמור את הכתובת במועדפים או שלח אותה לעצמך בהודעה כדי שתוכל לגשת אליה כל יום בקלות!
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
                <div className="flex gap-3">
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
                    className="px-4 sm:px-6 py-4 bg-[#E6F19A] hover:bg-[#E6F19A] hover:bg-opacity-80 border-2 border-[#E6F19A] rounded-[18px] font-varela font-semibold text-base text-[#262135] transition-all whitespace-nowrap"
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
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-varela text-xs text-[#282743] text-center leading-relaxed">
                    אם {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'תעמודי' : 'תעמוד') : 'תעמוד'} ביעד של {dealData.dailyScreenTimeGoal} שעות ביום, {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'תקבלי' : 'תקבל') : 'תקבל'} את כל התקציב היומי! אם {childName ? (childName.endsWith('ה') || childName.endsWith('ית') ? 'תעברי' : 'תעבור') : 'תעבור'} את היעד, התקציב יקטן בהתאם.
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

