'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import { getCurrentUserId } from '@/utils/auth';
import { createChild, updateChild } from '@/lib/api/children';
import { createChallenge, getActiveChallenge, updateChallenge } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import { clientConfig } from '@/config/client.config';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('OnboardingSetup');

export default function OnboardingSetupPage() {
  const [step, setStep] = useState(1);
  const [showBudgetExplanation, setShowBudgetExplanation] = useState(false);
  const [availableAges, setAvailableAges] = useState<string[]>([]);
  const [ageSelectedFromButton, setAgeSelectedFromButton] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gender: '',
    name: '',
    age: '',
    deviceType: '',
    currentScreenTime: '',
    targetScreenTime: '',
    weeklyBudget: '',
    customBudget: ''
  });

  const router = useRouter();

  const genderOptions = [
    { value: 'boy', label: 'בן' },
    { value: 'girl', label: 'בת' }
  ];

  const budgetOptions = [
    { value: '20', label: '₪20', amount: 20 },
    { value: '40', label: '₪40', amount: 40 },
    { value: 'custom', label: 'התאמה אישית', amount: 0 }
  ];

  const piggyMessages = [
    'עכשיו בואו נגדיר יחד את הילד שלכם!',
    'אני רוצה להכיר את הילד שלכם טוב יותר',
    'נתחיל עם השאלות הבסיסיות',
    'עכשיו נדבר על זמן מסך',
    'וכעת נקבע את התקציב השבועי'
  ];

  const deviceOptions = [
    { value: 'ios', label: 'iPhone (iOS)' },
    { value: 'android', label: 'Android' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // If age is being changed manually, clear button selection
      if (name === 'age') {
        // If user types something, clear the button selection
        if (value !== '' && ageSelectedFromButton) {
          setAgeSelectedFromButton(false);
        }
        // If user clears the input, also clear button selection
        if (value === '') {
          setAgeSelectedFromButton(false);
        }
      }
      
      // Show budget explanation if budget is selected and target hours are set
      if (name === 'targetScreenTime' && updated.weeklyBudget !== '' && value !== '') {
        setShowBudgetExplanation(true);
      }
      
      return updated;
    });
  };

  const handleBudgetChange = (value: string, amount?: number) => {
    setFormData(prev => {
      const updated = {
      ...prev,
        weeklyBudget: value,
        customBudget: value === 'custom' ? prev.customBudget : ''
      };
      
      // Show explanation after selecting budget if target hours are already set
      if (value !== '' && updated.targetScreenTime !== '') {
        setShowBudgetExplanation(true);
      }
      
      return updated;
    });
  };

  // Calculate budget explanation
  const getBudgetExplanation = () => {
    const selectedBudget = formData.weeklyBudget === 'custom' 
      ? parseFloat(formData.customBudget) 
      : parseFloat(formData.weeklyBudget) || 0;
    // Convert minutes to hours for calculations
    const targetMinutes = parseFloat(formData.targetScreenTime) || 0;
    const targetHours = targetMinutes / 60;

    if (selectedBudget === 0 || targetMinutes === 0) {
      return null;
    }

    // תקציב שבועי = התקציב הנבחר
    // האתגר נמשך 6 ימים ויום הפדיון הוא היום ה-7
    const weeklyBudget = selectedBudget; // התקציב השבועי שווה לתקציב הנבחר
    const dailyBudget = selectedBudget / clientConfig.challenge.budgetDivision;
    const hourlyRate = targetHours > 0 ? dailyBudget / targetHours : 0;
    const weeklyHours = targetHours * clientConfig.challenge.challengeDays;

    return {
      selectedBudget,
      weeklyBudget,
      dailyBudget,
      hourlyRate,
      targetHours: targetMinutes, // Return minutes for display
      weeklyHours
    };
  };

  const explanation = getBudgetExplanation();

  // Parent data state
  const [parentData, setParentData] = useState<{
    parentGender: 'female' | 'male';
  }>({
    parentGender: 'female' // Default to female until we load from Firestore
  });

  // Load parent data from Firestore
  useEffect(() => {
    const loadParentData = async () => {
      try {
        const userId = await getCurrentUserId();
        if (userId) {
          const user = await getUser(userId);
          if (user && user.gender) {
            setParentData({
              parentGender: user.gender === 'female' ? 'female' : 'male'
            });
          }
        }
      } catch (error) {
        logger.error('Error loading parent data:', error);
      }
    };
    
    loadParentData();
  }, []);
  
  // Parent pronouns
  const parentPronouns = {
    female: { you: 'את', continue: 'ממשיכה', return: 'תחזרי', ready: 'מוכנה', do: 'תעשי' },
    male: { you: 'אתה', continue: 'ממשיך', return: 'תחזור', ready: 'מוכן', do: 'תעשה' }
  };
  const parentP = parentPronouns[parentData.parentGender as 'female' | 'male'] || parentPronouns.female;
  const childDisplayName = formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה');

  // Load kids ages from user data (Firestore or localStorage)
  useEffect(() => {
    const loadKidsAges = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // First, try to get from Firestore (user profile)
        try {
          const userId = await getCurrentUserId();
          if (userId) {
            const userData = await getUser(userId);
            if (userData && userData.kidsAges && Array.isArray(userData.kidsAges)) {
              const validAges = userData.kidsAges.filter((age: string) => age && age.trim() !== '');
              if (validAges.length > 0) {
                setAvailableAges(validAges);
                return;
              }
            }
          }
        } catch (e) {
          // If Firestore fails, continue to localStorage fallback
          logger.log('Could not load ages from Firestore, trying localStorage...');
        }
        
        // Fallback: Try to get from parentData (after signup submission)
        const parentDataStr = localStorage.getItem('parentData');
        if (parentDataStr) {
          const parsed = JSON.parse(parentDataStr);
          if (parsed.kidsAges && Array.isArray(parsed.kidsAges)) {
            const validAges = parsed.kidsAges.filter((age: string) => age && age.trim() !== '');
            if (validAges.length > 0) {
              setAvailableAges(validAges);
              return;
            }
          }
        }
        
        // Fallback: Try to get from signupFormData (during signup process)
        const signupDataStr = localStorage.getItem('signupFormData');
        if (signupDataStr) {
          const parsed = JSON.parse(signupDataStr);
          if (parsed.kidsAges && Array.isArray(parsed.kidsAges)) {
            const validAges = parsed.kidsAges.filter((age: string) => age && age.trim() !== '');
            if (validAges.length > 0) {
              setAvailableAges(validAges);
              return;
            }
          }
        }
      } catch (e) {
        // Ignore errors
        logger.error('Error loading kids ages:', e);
      }
    };
    
    loadKidsAges();
  }, []);

  const handleNext = async () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      // Prevent multiple submissions
      if (isSubmitting) {
        return;
      }
      
      setIsSubmitting(true);
      try {
        // Get current user ID
        const userId = await getCurrentUserId();
        if (!userId) {
          logger.error('User not authenticated');
          router.push('/login');
          return;
        }

        // Get user data to get parent name
        const user = await getUser(userId);
        const parentName = user?.firstName || '';

        // Calculate budgets
        const selectedBudget = formData.weeklyBudget === 'custom' 
          ? parseFloat(formData.customBudget) 
          : parseFloat(formData.weeklyBudget) || 0;
        const weeklyBudget = selectedBudget; // Weekly budget equals selected budget (calculated, not saved to DB)
        const dailyBudget = selectedBudget / clientConfig.challenge.budgetDivision;

        // Convert minutes to hours for backend (keep calculation structure in hours)
        const targetMinutes = parseFloat(formData.targetScreenTime) || 0;
        const targetHours = targetMinutes > 0 ? targetMinutes / 60 : clientConfig.challenge.defaultDailyScreenTimeGoal;

        // Get motivation reason from sessionStorage
        const motivationReason = typeof window !== 'undefined' 
          ? sessionStorage.getItem('motivationReason') as 'balance' | 'education' | 'communication' | null
          : null;

        // Check if there's an active challenge for this parent
        const existingChallenge = await getActiveChallenge(userId);
        
        let childId: string;
        let challengeId: string;

        if (existingChallenge && existingChallenge.isActive) {
          // Active challenge exists - update existing child and challenge
          logger.log('Active challenge found, updating existing child and challenge');
          childId = existingChallenge.childId;
          challengeId = existingChallenge.id;

          // Update child with new form data
          await updateChild(childId, {
            name: formData.name || '',
            age: formData.age || '',
            gender: formData.gender as 'boy' | 'girl',
            deviceType: formData.deviceType as 'ios' | 'android',
          }, userId);

          // Calculate start date (tomorrow at 00:00)
          const today = new Date();
          const startDate = new Date(today);
          startDate.setDate(today.getDate() + 1);
          startDate.setHours(0, 0, 0, 0);

          // Update challenge with new form data
          await updateChallenge(challengeId, {
            ...(motivationReason && { motivationReason }),
            selectedBudget: selectedBudget,
            dailyBudget: dailyBudget,
            dailyScreenTimeGoal: targetHours,
            startDate: startDate.toISOString(),
            isActive: true,
          });
        } else {
          // No active challenge - create new child and challenge
          logger.log('No active challenge found, creating new child and challenge');

        // Create child profile
          childId = await createChild({
          parentId: userId,
          name: formData.name || '',
          gender: formData.gender as 'boy' | 'girl',
          age: formData.age || '',
          deviceType: formData.deviceType as 'ios' | 'android',
        });

        // Calculate start date (tomorrow at 00:00)
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);

        // Create challenge (weeklyBudget is calculated from selectedBudget, not saved to DB)
          challengeId = await createChallenge({
          parentId: userId,
          childId: childId,
          ...(motivationReason && { motivationReason }),
          selectedBudget: selectedBudget,
          dailyBudget: dailyBudget,
          dailyScreenTimeGoal: targetHours,
          weekNumber: 1,
          totalWeeks: clientConfig.challenge.totalWeeks,
          startDate: startDate.toISOString(),
          challengeDays: clientConfig.challenge.challengeDays,
          isActive: true,
        });

        // Track challenge creation event
        const { logEvent, AnalyticsEvents } = await import('@/utils/analytics');
        await logEvent(AnalyticsEvents.CHALLENGE_CREATED, {
          challenge_id: challengeId,
          parent_id: userId,
          child_id: childId,
          daily_budget: dailyBudget,
          daily_screen_time_goal: targetHours,
          challenge_days: clientConfig.challenge.challengeDays,
        });
        }

        // נקה את sessionStorage אחרי השימוש
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('motivationReason');
        }

        // Save challenge data to localStorage temporarily (only for onboarding/complete page)
        // Will be cleaned up when navigating to dashboard or after 5 minutes timeout
        if (typeof window !== 'undefined') {
          const challengeData = {
            parentName: parentName,
            childName: formData.name || '',
            childGender: formData.gender || 'boy',
            childAge: formData.age || '',
            deviceType: formData.deviceType || 'ios',
            weeklyBudget: weeklyBudget,
            dailyBudget: dailyBudget,
            dailyScreenTimeGoal: targetHours,
            challengeDays: clientConfig.challenge.challengeDays,
            challengeId: challengeId,
            childId: childId,
          };
          localStorage.setItem('challengeData', JSON.stringify(challengeData));
        }

        // Move to next screen with query params (include childId for complete page)
        const params = new URLSearchParams({
          name: formData.name,
          gender: formData.gender,
          childId: childId
        });
        // Don't reset isSubmitting - keep it true until navigation completes
        // This prevents the button from becoming clickable again
        router.push(`/onboarding/complete?${params.toString()}`);
      } catch (error) {
        logger.error('Error creating challenge:', error);
        alert('שגיאה ביצירת האתגר. נסה שוב.');
        setIsSubmitting(false); // Re-enable button on error only
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push('/onboarding');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.gender !== '';
      case 2:
        return formData.name.trim() !== '';
      case 3:
        return formData.age !== '';
      case 4:
        return true; // Info step - always can proceed
      case 5:
        return formData.deviceType !== '';
      case 6:
        return formData.targetScreenTime !== '';
      case 7:
        return formData.weeklyBudget !== '' && (formData.weeklyBudget !== 'custom' || formData.customBudget !== '');
      default:
        return false;
    }
  };

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
            priority
          />
        </div>

        {/* Progress indicator */}
        <div className="mb-6 mt-20">
          <div className="flex justify-between mb-2">
            <span className="font-varela text-sm text-[#948DA9]">שלב {step} מתוך 7</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#273143] h-2 rounded-full transition-all"
              style={{ width: `${(step / 7) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          {step === 1 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                מין הילד/ה
              </h2>
        
              <div className="space-y-3">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({ ...prev, gender: option.value }))}
                    className={`w-full p-4 rounded-[18px] border-2 transition-all text-center ${
                      formData.gender === option.value
                        ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                        : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                    }`}
                  >
                    <span className="font-varela font-semibold text-base text-[#282743]">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                שם ה{formData.gender === 'boy' ? 'ילד' : 'ילדה'}
              </h2>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="הכניסו את השם"
                className="w-full p-4 border-2 border-gray-200 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743]"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                {formData.gender === 'boy' ? 'בן' : 'בת'} כמה {formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה')}?
              </h2>
              
              {/* Show available ages as buttons if they exist */}
              {availableAges.length > 0 ? (
                <div className="mb-4">
                  {/* Age suggestion buttons - smaller, in one row */}
                  <div className="flex flex-wrap gap-2 mb-3 justify-center">
                    {availableAges.map((age, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, age: age.trim() }));
                          setAgeSelectedFromButton(true);
                        }}
                        className={`px-3 py-1.5 rounded-[12px] border-2 transition-all text-center ${
                          formData.age === age.trim() && ageSelectedFromButton
                            ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                            : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                        }`}
                      >
                        <span className={`font-varela font-semibold text-sm ${
                          formData.age === age.trim() && ageSelectedFromButton
                            ? 'text-[#273143]'
                            : 'text-[#282743]'
                        }`}>
                          {age.trim()}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Custom age input - separate from buttons */}
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={(e) => {
                      // Clear button selection when user starts typing
                      if (ageSelectedFromButton) {
                        setAgeSelectedFromButton(false);
                      }
                      handleChange(e);
                    }}
                    onFocus={() => {
                      // When focusing on input, clear button selection if it was selected
                      if (ageSelectedFromButton) {
                        setAgeSelectedFromButton(false);
                        setFormData(prev => ({ ...prev, age: '' }));
                      }
                    }}
                    placeholder="גיל"
                    min="1"
                    max="18"
                    className={`w-full p-4 rounded-[18px] border-2 focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                      formData.age && !ageSelectedFromButton && formData.age.trim() !== ''
                        ? 'border-[#273143] bg-[#273143] bg-opacity-5'
                        : 'border-gray-200 bg-white'
                    }`}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="הכניסו את הגיל"
                  min="1"
                  max="18"
                  className="w-full p-4 border-2 border-gray-200 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743]"
                />
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                רגע לפני שמתחילים
              </h2>
              <div className="space-y-4">
                <div className="bg-[#E6F19A] bg-opacity-30 rounded-[18px] border-2 border-[#E6F19A] p-4">
                  <p className="font-varela text-base text-[#262135] leading-relaxed mb-4">
                    במידה ו{parentP.you} {parentP.continue} - האתגר יתחיל מחר בבוקר ואם {parentP.you} עוד לא {parentP.ready} אנחנו מחכים לך ש{parentP.do} את ההכנות עם <strong>{childDisplayName}</strong> ו{parentP.return} לכתובת הזו:
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const onboardingUrl = typeof window !== 'undefined' ? window.location.href : '';
                        await navigator.clipboard.writeText(onboardingUrl);
                        setCopied(true);
                        setTimeout(() => {
                          setCopied(false);
                        }, 3000);
                      } catch (error) {
                        logger.error('Failed to copy URL:', error);
                      }
                    }}
                    className={`w-full py-3 rounded-[12px] font-varela font-semibold text-sm transition-all ${
                      copied
                        ? 'bg-[#E6F19A] text-[#273143]'
                        : 'bg-[#273143] text-white hover:bg-opacity-90'
                    }`}
                  >
                    {copied ? 'הועתק! ✓' : 'העתק כתובת'}
                  </button>
                  <p className="font-varela text-sm text-[#262135] mt-4 pt-3 border-t border-[#E6F19A]">
                    כרגע ניתן להכניס רק אתגר אחד למערכת, אם אתם רוצים להכניס עוד מישהו מילדיכם אתם מוזמנים ליצור משתמש נוסף.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                איזה מכשיר יש ל{formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה')}?
              </h2>
              <div className="space-y-3">
                {deviceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({ ...prev, deviceType: option.value }))}
                    className={`w-full p-4 rounded-[18px] border-2 transition-all text-center ${
                      formData.deviceType === option.value
                        ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                        : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                    }`}
                  >
                    <span className="font-varela font-semibold text-base text-[#282743]">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                כמה זמן מסך ביום, טוב מבחינתך שיהיה ל{formData.name || 'הילד/ה'}?
              </h2>
              <input
                type="number"
                name="targetScreenTime"
                value={formData.targetScreenTime}
                onChange={handleChange}
                placeholder="מספר דקות"
                step="1"
                min="0"
                className="w-full p-4 border-2 border-gray-200 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743]"
              />
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                תקציב שבועי לדמי כיס
              </h2>
              <div className="space-y-3 mb-4">
                {budgetOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleBudgetChange(option.value, option.amount)}
                    className={`w-full p-4 rounded-[18px] border-2 transition-all text-center ${
                      formData.weeklyBudget === option.value
                        ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                        : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                    }`}
                  >
                    <span className="font-varela font-semibold text-base text-[#282743]">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              {formData.weeklyBudget === 'custom' && (
                <div className="mb-4">
                  <input
                    type="number"
                    name="customBudget"
                    value={formData.customBudget}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value && formData.targetScreenTime) {
                        setShowBudgetExplanation(true);
                      }
                    }}
                    placeholder="הכניסו סכום (₪)"
                    min="0"
                    className="w-full p-4 border-2 border-gray-200 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743]"
                  />
                </div>
              )}

              {/* Budget Explanation */}
              {showBudgetExplanation && formData.weeklyBudget !== '' && (
                <div className="mt-4 p-4 bg-[#E6F19A] bg-opacity-30 rounded-[18px] border-2 border-[#E6F19A]">
                  {formData.weeklyBudget === 'custom' && (!formData.customBudget || formData.customBudget === '') ? (
                    <div className="text-center">
                      <p className="font-varela text-base text-[#282743]">
                        נא הכנס תקציב רצוי
                      </p>
                    </div>
                  ) : explanation ? (
                    <>
                      <h3 className="font-varela font-semibold text-base text-[#262135] mb-3">
                        מה זה אומר?
                      </h3>
                      <div className="space-y-3 font-varela text-sm text-[#282743]">
                        <div className="bg-[#E6F19A] bg-opacity-50 rounded-[12px] p-4 border-2 border-[#E6F19A] shadow-sm">
                          <p className="font-varela text-base text-[#262135] leading-relaxed font-semibold">
                            אם <strong className="text-[#273143]">{formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה')}</strong> {formData.gender === 'boy' ? 'יעמוד' : 'תעמוד'} ביעד של <strong className="text-[#273143]">{formatNumber(explanation.targetHours)}</strong> {explanation.targetHours === 1 ? 'דקה' : 'דקות'} זמן מסך ביום, {formData.gender === 'boy' ? 'הוא יקבל' : 'היא תקבל'} <strong className="text-[#273143] text-lg">₪{formatNumber(explanation.weeklyBudget)}</strong> תקציב השבועי (₪{formatNumber(explanation.dailyBudget)} ליום).
                          </p>
                        </div>
                        <p className="text-[#282743]">
                          אם {formData.gender === 'boy' ? 'הוא יגדיל' : 'היא תגדיל'} את זמן המסך, התקציב יקטן בהתאם.
                        </p>
                        <p className="mt-2">
                          במקרה שלנו, אם {formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה')} {formData.gender === 'boy' ? 'יגדיל' : 'תגדיל'} את זמן המסך ב-10 דקות התקציב היומי יקטן ב<strong>₪{formatNumber(explanation.hourlyRate / 6, 2)}</strong>.
                        </p>
                        <p className="mt-2">
                          אם {formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה')} {formData.gender === 'boy' ? 'יגדיל' : 'תגדיל'} את זמן המסך ב-90 דקות התקציב היומי יקטן ב<strong>₪{formatNumber(1.5 * explanation.hourlyRate)}</strong>.
                        </p>
                        <p className="mt-2 pt-2 border-t border-[#E6F19A]">
                          כל יום הוא יום חדש והזדמנות להרוויח את מלוא התקציב ש{parentP.you} הגדרת.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowBudgetExplanation(false)}
                        className="mt-3 w-full py-2 px-4 bg-[#273143] text-white rounded-[12px] font-varela font-semibold text-sm hover:bg-opacity-90 transition-all"
                      >
                        הבנתי ✓
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
            </div>

        {/* Navigation buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="flex-1 py-4 px-6 rounded-[18px] border-2 border-gray-300 text-lg font-varela font-semibold text-[#282743] hover:bg-gray-50 transition-all"
          >
            חזרה
          </button>
            <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className={`flex-1 py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
              canProceed() && !isSubmitting
                ? 'bg-[#273143] text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'שומר...' : (step === 7 ? 'סיום' : 'המשך')}
            </button>
          </div>
      </div>
    </div>
  );
}
