'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import { getCurrentUserId } from '@/utils/auth';
import { createChild } from '@/lib/api/children';
import { createChallenge } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';

export default function OnboardingSetupPage() {
  const [step, setStep] = useState(1);
  const [showBudgetExplanation, setShowBudgetExplanation] = useState(false);
  const [availableAges, setAvailableAges] = useState<string[]>([]);
  const [ageSelectedFromButton, setAgeSelectedFromButton] = useState(false);
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
      
      // If age is being changed manually, mark it as not from button
      if (name === 'age') {
        setAgeSelectedFromButton(false);
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
    const targetHours = parseFloat(formData.targetScreenTime) || 0;

    if (selectedBudget === 0 || targetHours === 0) {
      return null;
    }

    // תקציב שבועי = התקציב הנבחר
    // האתגר נמשך 6 ימים (ראשון-שישי), יום שבת הוא יום פדיון
    const weeklyBudget = selectedBudget; // התקציב השבועי שווה לתקציב הנבחר
    const dailyBudget = selectedBudget / 6; // חלוקה ל-6 ימים
    const hourlyRate = targetHours > 0 ? dailyBudget / targetHours : 0;
    const weeklyHours = targetHours * 6; // 6 ימים במקום 7

    return {
      selectedBudget,
      weeklyBudget,
      dailyBudget,
      hourlyRate,
      targetHours,
      weeklyHours
    };
  };

  const explanation = getBudgetExplanation();

  // Get parent data from localStorage
  const getParentData = () => {
    try {
      if (typeof window !== 'undefined') {
        const parentData = localStorage.getItem('parentData');
        if (parentData) {
          try {
            const parsed = JSON.parse(parentData);
            return {
              parentGender: parsed.gender === 'female' ? 'female' : 'male'
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
              parentGender: parsed.gender === 'female' ? 'female' : 'male'
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
      parentGender: 'female'
    };
  };

  const parentData = getParentData();
  
  // Parent pronouns
  const parentPronouns = {
    female: { you: 'את' },
    male: { you: 'אתה' }
  };
  const parentP = parentPronouns[parentData.parentGender as 'female' | 'male'] || parentPronouns.female;

  // Load kids ages from signup data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Try to get from parentData first (after signup submission)
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
        
        // Try to get from signupFormData (during signup process)
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
      }
    }
  }, []);

  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      try {
        // Get current user ID
        const userId = await getCurrentUserId();
        if (!userId) {
          console.error('User not authenticated');
          router.push('/login');
          return;
        }

        // Get user data to get parent name
        const user = await getUser(userId);
        const parentName = user?.firstName || 'דנה';

        // Calculate budgets
        const selectedBudget = formData.weeklyBudget === 'custom' 
          ? parseFloat(formData.customBudget) 
          : parseFloat(formData.weeklyBudget) || 0;
        const weeklyBudget = selectedBudget; // Weekly budget equals selected budget (calculated, not saved to DB)
        const dailyBudget = selectedBudget / 6; // Divide selected budget by 6 days (Sunday-Friday)

        // Create child profile
        const childId = await createChild({
          parentId: userId,
          name: formData.name || '',
          gender: formData.gender as 'boy' | 'girl',
          age: formData.age || '',
          deviceType: formData.deviceType as 'ios' | 'android',
        });

        // Calculate start date (next Sunday or current if it's Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + daysUntilSunday);
        startDate.setHours(0, 0, 0, 0);

        // Get motivation reason from sessionStorage
        const motivationReason = typeof window !== 'undefined' 
          ? sessionStorage.getItem('motivationReason') as 'balance' | 'education' | 'communication' | null
          : null;

        // Create challenge (weeklyBudget is calculated from selectedBudget, not saved to DB)
        const challengeId = await createChallenge({
          parentId: userId,
          childId: childId,
          motivationReason: motivationReason || undefined,
          selectedBudget: selectedBudget,
          dailyBudget: dailyBudget,
          dailyScreenTimeGoal: parseFloat(formData.targetScreenTime) || 3,
          weekNumber: 1,
          totalWeeks: 4, // Default to 4 weeks
          startDate: startDate.toISOString(),
          challengeDays: 6, // 6 days (Sunday-Friday)
          redemptionDay: 'saturday',
          isActive: true,
        });

        // נקה את sessionStorage אחרי השימוש
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('motivationReason');
        }

        // Save challenge ID to localStorage for backward compatibility (temporary)
        if (typeof window !== 'undefined') {
          const challengeData = {
            parentName: parentName,
            childName: formData.name || '',
            childGender: formData.gender || 'boy',
            childAge: formData.age || '',
            deviceType: formData.deviceType || 'ios',
            weeklyBudget: weeklyBudget,
            dailyBudget: dailyBudget,
            dailyScreenTimeGoal: parseFloat(formData.targetScreenTime) || 3,
            challengeDays: 6,
            redemptionDay: 'saturday',
            challengeId: challengeId,
            childId: childId,
          };
          localStorage.setItem('challengeData', JSON.stringify(challengeData));
        }

        // Move to next screen with query params
        const params = new URLSearchParams({
          name: formData.name,
          gender: formData.gender
        });
        router.push(`/onboarding/complete?${params.toString()}`);
      } catch (error) {
        console.error('Error creating challenge:', error);
        alert('שגיאה ביצירת האתגר. נסה שוב.');
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
        return formData.deviceType !== '';
      case 5:
        return formData.targetScreenTime !== '';
      case 6:
        return formData.weeklyBudget !== '' && (formData.weeklyBudget !== 'custom' || formData.customBudget !== '');
      default:
        return false;
    }
  };

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
            <span className="font-varela text-sm text-[#948DA9]">שלב {step} מתוך 6</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#273143] h-2 rounded-full transition-all"
              style={{ width: `${(step / 6) * 100}%` }}
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableAges.map((age, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, age: age.trim() }));
                          setAgeSelectedFromButton(true);
                        }}
                        className={`p-3 sm:p-4 rounded-[18px] border-2 transition-all text-center ${
                          formData.age === age.trim() && ageSelectedFromButton
                            ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                            : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                        }`}
                      >
                        <span className="font-varela font-semibold text-base text-[#282743]">
                          {age.trim()}
                        </span>
                      </button>
                    ))}
                    {/* Custom age input in the same grid */}
                    <div className="flex flex-col justify-end">
                      <label className="font-varela text-xs text-[#948DA9] mb-1.5 text-center">
                        {parentData.parentGender === 'male' ? 'כנס' : 'הכניסי'} גיל אחר:
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={ageSelectedFromButton ? '' : formData.age}
                        onChange={handleChange}
                        onFocus={() => {
                          // When focusing on input, clear button selection
                          if (ageSelectedFromButton) {
                            setAgeSelectedFromButton(false);
                            setFormData(prev => ({ ...prev, age: '' }));
                          }
                        }}
                        placeholder="גיל"
                        min="1"
                        max="18"
                        className={`p-3 sm:p-4 rounded-[18px] border-2 text-center focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                          formData.age && !ageSelectedFromButton && formData.age.trim() !== ''
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-gray-200 bg-white'
                        }`}
                      />
                    </div>
                  </div>
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

          {step === 5 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                כמה זמן מסך ביום, טוב מבחינתך שיהיה ל{formData.name || 'הילד/ה'}?
              </h2>
              <input
                type="number"
                name="targetScreenTime"
                value={formData.targetScreenTime}
                onChange={handleChange}
                placeholder="מספר שעות"
                step="0.5"
                min="0"
                className="w-full p-4 border-2 border-gray-200 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743]"
              />
            </div>
          )}

          {step === 6 && (
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
                            אם <strong className="text-[#273143]">{formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה')}</strong> {formData.gender === 'boy' ? 'יעמוד' : 'תעמוד'} ביעד של <strong className="text-[#273143]">{explanation.targetHours}</strong> {explanation.targetHours === 1 ? 'שעה' : 'שעות'} זמן מסך ביום, {formData.gender === 'boy' ? 'הוא יקבל' : 'היא תקבל'} <strong className="text-[#273143] text-lg">₪{formatNumber(explanation.weeklyBudget)}</strong> תקציב השבועי (₪{formatNumber(explanation.dailyBudget)} ליום).
                          </p>
                        </div>
                        <p className="text-[#282743]">
                          אם {formData.gender === 'boy' ? 'הוא יגדיל' : 'היא תגדיל'} את זמן המסך, התקציב יקטן בהתאם.
                        </p>
                        <p className="mt-2">
                          במקרה שלנו, אם {formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה')} {formData.gender === 'boy' ? 'יגדיל' : 'תגדיל'} את זמן המסך ב-10 דקות התקציב היומי יקטן ב<strong>₪{formatNumber(explanation.hourlyRate / 6, 2)}</strong>.
                        </p>
                        <p className="mt-2">
                          אם {formData.name || (formData.gender === 'boy' ? 'הילד' : 'הילדה')} {formData.gender === 'boy' ? 'יגדיל' : 'תגדיל'} את זמן המסך ב-1.5 שעות התקציב היומי יקטן ב<strong>₪{formatNumber(1.5 * explanation.hourlyRate)}</strong>.
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
            disabled={!canProceed()}
            className={`flex-1 py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
              canProceed()
                ? 'bg-[#273143] text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {step === 6 ? 'סיום' : 'המשך'}
            </button>
          </div>
      </div>
    </div>
  );
}
