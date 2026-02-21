'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
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
    return gender === 'female' ? '××ž×' : '××‘×';
  };

  const parentTitle = getParentTitle();

  // Nickname pool for random generation - fun nicknames for kids
  const nicknamePool = [
    '×’×™×‘×•×¨', '×›×•×›×‘', '×œ×•×—×', '×ž×œ×š', '× ×¡×™×š', '×’×™×‘×•×¨ ×¢×œ', '×›×•×›×‘ ×¢×œ', '×œ×•×—× ×¢×œ', '×ž×œ×š ×¢×œ', '× ×¡×™×š ×¢×œ',
    '×’×™×‘×•×¨×”', '×›×•×›×‘×ª', '×œ×•×—×ž×ª', '×ž×œ×›×”', '× ×¡×™×›×”', '×’×™×‘×•×¨×ª ×¢×œ', '×›×•×›×‘×ª ×¢×œ', '×œ×•×—×ž×ª ×¢×œ', '×ž×œ×›×ª ×¢×œ', '× ×¡×™×›×ª ×¢×œ',
    '×’×™×‘×•×¨#×”×ž×’× ×™×‘', '×›×•×›×‘@×”×¡×•×¤×¨', '×œ×•×—×$×”×˜×•×‘', '×ž×œ×š&×”×ž× ×¦×—', '× ×¡×™×š#×”×’×™×‘×•×¨',
    '×’×™×‘×•×¨×”@×”×¡×•×¤×¨', '×›×•×›×‘×ª$×”×˜×•×‘×”', '×œ×•×—×ž×ª&×”×ž× ×¦×—×ª', '×ž×œ×›×ª#×”×’×™×‘×•×¨×”', '× ×¡×™×›×ª@×”×¡×•×¤×¨',
    '×’×™×‘×•×¨_×”×ž×’× ×™×‘', '×›×•×›×‘@×”×¡×•×¤×¨', '×œ×•×—×$×”×˜×•×‘', '×ž×œ×š&×”×ž× ×¦×—', '× ×¡×™×š#×”×’×™×‘×•×¨',
    '×’×™×‘×•×¨×”_×”×¡×•×¤×¨', '×›×•×›×‘×ª@×”×˜×•×‘×”', '×œ×•×—×ž×ª$×”×ž× ×¦×—×ª', '×ž×œ×›×ª&×”×’×™×‘×•×¨×”', '× ×¡×™×›×ª#×”×¡×•×¤×¨',
    '×’×™×‘×•×¨@×”×›×™@×˜×•×‘', '×›×•×›×‘#×”×›×™$×ž×’× ×™×‘', '×œ×•×—×&×”×›×™@×’×™×‘×•×¨', '×ž×œ×š$×”×›×™#×˜×•×‘', '× ×¡×™×š&×”×›×™@×ž×’× ×™×‘',
    '×’×™×‘×•×¨×”@×”×›×™@×˜×•×‘×”', '×›×•×›×‘×ª#×”×›×™$×ž×’× ×™×‘×”', '×œ×•×—×ž×ª&×”×›×™@×’×™×‘×•×¨×”', '×ž×œ×›×ª$×”×›×™#×˜×•×‘×”', '× ×¡×™×›×ª&×”×›×™@×ž×’× ×™×‘×”'
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
    { id: 'pizza-friend', label: '×¤×™×¦×” ×¢× ×—×‘×¨/×”' },
    { id: 'craft-kit', label: '×¢×¨×›×ª ×™×¦×™×¨×”' },
    { id: 'escape-room', label: '×—×“×¨ ×‘×¨×™×—×”' },
    { id: 'lego', label: '×œ×’×• (LEGO)' },
    { id: 'icecream', label: '×’×œ×™×“×”' },
    { id: 'football', label: '×›×“×•×¨×’×œ' },
    { id: 'save-money', label: '×× ×™ ×¨×•×¦×” ×œ×—×¡×•×š!' },
    { id: 'supergoal-cards', label: '×§×œ×¤×™ ×¡×•×¤×¨×’×•×œ' },
    { id: 'slime', label: '×¡×œÖ·×™×™× (Slime)' },
    { id: 'popcorn', label: '×¤×•×¤×§×•×¨×Ÿ (×œ×¡×¨×˜)' },
    { id: 'playstation-game', label: '×ž×©×—×§ ×œ×¤×œ×™×™×¡×˜×™×™×©×Ÿ' },
    { id: 'lol-doll', label: '×‘×•×‘×ª ×œ××‘×•×‘×•' }
  ];

  // Validate URL token on mount (skip when validationOverride from unified page)
  useEffect(() => {
    if (validationOverride?.mode === 'setup') return;

    const validateUrl = async () => {
      if (!token) {
        setUrlValid(false);
        setUrlError('×›×ª×•×‘×ª ×œ× ×ª×§×™× ×” - ×—×¡×¨ ×˜×•×§×Ÿ');
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
            setUrlError('×”××ª×’×¨ ×”×•×©×œ× ×›×‘×¨. ×”×¤×“×™×•×Ÿ ×‘×•×¦×¢ ×•×”××ª×’×¨ ×œ× ×¤×¢×™×œ ×™×•×ª×¨.');
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
          setUrlError(validation.error || '×›×ª×•×‘×ª ×œ× ×ª×§×™× ×”');
        }
      } catch (error) {
        logger.error('Error validating URL:', error);
        setUrlValid(false);
        setUrlError('×©×’×™××” ×‘×‘×“×™×§×ª ×”×›×ª×•×‘×ª');
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
        alert('×©×’×™××” ×‘×©×ž×™×¨×ª ×”× ×ª×•× ×™×. × ×¡×” ×©×•×‘.');
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
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4">
              ×”××ª×’×¨ ×”×•×©×œ×
            </h1>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-4 mb-4">
              <p className="font-varela text-base text-[#262135] text-center leading-relaxed mb-2">
                ×”××ª×’×¨ ×”×•×©×œ× ×•×”×¤×“×™×•×Ÿ ×‘×•×¦×¢.
              </p>
              <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                {parentTitle} ×¦×¨×™×š ×œ×™×¦×•×¨ ××ª×’×¨ ×—×“×© ×›×“×™ ×©×ª×•×›×œ ×œ×”×ª×—×™×œ.
              </p>
            </div>
            <p className="font-varela text-sm text-[#948DA9]">
              ×‘×“×•×§ ×¢× ×”×”×•×¨×” ×©×œ×š ×œ×§×‘×œ×ª ×›×ª×•×‘×ª ×—×“×©×”.
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
              ×›×ª×•×‘×ª ×œ× ×ª×§×™× ×”
            </h1>
            <p className="font-varela text-base text-[#282743] mb-4">
              ×›× ×¨××” ×©×›×‘×¨ ×¡×™×™×ž×ª ××ª ×”×©×œ×‘ ×”×–×”, ×ª×¤× ×” ×œ×”×•×¨×” ×©×œ×š ×œ×§×‘×œ ×›×ª×•×‘×ª ×¢×“×›× ×™×ª.
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
            <p className="font-varela text-base text-[#282743]">×‘×•×“×§ ×›×ª×•×‘×ª...</p>
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
        {/* Piggy Bank - ×¤×™× ×” ×™×ž× ×™×ª ×¢×œ×™×•× ×” */}
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
            <span className="font-varela text-sm text-[#948DA9]">×©×œ×‘ {step} ×ž×ª×•×š 3</span>
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
                {childName ? `${childName}!` : '×”×™×™!'} {parentTitle} {parentTitle === '××ž×' ? '×”×—×œ×™×˜×”' : '×”×—×œ×™×˜'} ×œ×¢×©×•×ª ××™×ª×š ×“×™×œ... ×¨×•×¦×” ×œ×“×¢×ª ×ž×” ×”×•×?
              </h2>
              <p className="font-varela text-base text-[#282743] mb-6 text-center leading-relaxed">
                ×‘×•××• × ×ª×—×™×œ! ×‘×—×¨ ×›×™× ×•×™ ×ž×’× ×™×‘:
              </p>
              <div className="mb-4">
                <label className="block font-varela font-semibold text-base text-[#262135] mb-3">
                  ×›×™× ×•×™ (×©× ×ž×©×ª×ž×©)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={selectedNickname}
                    readOnly
                    placeholder="×œ×—×¥ ×¢×œ '×œ×”×’×¨×™×œ' ×›×“×™ ×œ×™×¦×•×¨ ×›×™× ×•×™"
                    className={`flex-1 p-4 border-2 rounded-[18px] bg-gray-50 cursor-not-allowed font-varela text-base text-[#282743] ${
                      selectedNickname ? 'border-[#273143]' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={generateRandomNickname}
                    className="w-full sm:w-auto px-4 sm:px-6 py-4 bg-[#E6F19A] hover:bg-[#E6F19A] hover:bg-opacity-80 border-2 border-[#E6F19A] rounded-[18px] font-varela font-semibold text-base text-[#262135] transition-all whitespace-nowrap"
                  >
                    ×œ×”×’×¨×™×œ
                  </button>
                </div>
                {selectedNickname && (
                  <p className="mt-2 text-sm text-[#948DA9] font-varela text-center">
                    ×ž×¨×•×¦×” ×ž×”×›×™× ×•×™? ×œ×—×¥ ×¢×œ "×”×ž×©×š" ×›×“×™ ×œ×”×ž×©×™×š
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                ×”×“×™×œ ×©×œ×š ×¢× {parentTitle}:
              </h2>
              <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] p-6 space-y-4">
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-varela text-sm text-[#948DA9] mb-1">×™×¢×“ ×–×ž×Ÿ ×ž×¡×š ×™×•×ž×™:</p>
                  <p className="font-varela font-bold text-2xl text-[#262135]">
                    {formatNumber(dealData.dailyScreenTimeGoal * 60)} {dealData.dailyScreenTimeGoal * 60 === 1 ? '×“×§×”' : '×“×§×•×ª'}
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-varela text-sm text-[#948DA9] mb-1">×ª×§×¦×™×‘ ×©×‘×•×¢×™:</p>
                  <p className="font-varela font-bold text-2xl text-[#262135]">
                    â‚ª{dealData.weeklyBudget}
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                  <p className="font-varela text-sm text-[#948DA9] mb-1">×ª×§×¦×™×‘ ×™×•×ž×™:</p>
                  <p className="font-varela font-bold text-2xl text-[#262135]">
                    â‚ª{formatNumber(dealData.dailyBudget)}
                  </p>
                </div>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4 mb-3">
                  <p className="font-varela text-xs text-[#282743] text-center leading-relaxed">
                    ×× {childName ? (childGender === 'girl' ? '×ª×¢×ž×“×™' : '×ª×¢×ž×•×“') : '×ª×¢×ž×•×“'} ×‘×™×¢×“ ×©×œ {formatNumber(dealData.dailyScreenTimeGoal * 60)} {dealData.dailyScreenTimeGoal * 60 === 1 ? '×“×§×”' : '×“×§×•×ª'} ×‘×™×•×, {childName ? (childGender === 'girl' ? '×ª×§×‘×œ×™' : '×ª×§×‘×œ') : '×ª×§×‘×œ'} ××ª ×›×œ ×”×ª×§×¦×™×‘ ×”×™×•×ž×™! ×× {childName ? (childGender === 'girl' ? '×ª×¢×‘×¨×™' : '×ª×¢×‘×•×¨') : '×ª×¢×‘×•×¨'} ××ª ×”×™×¢×“, ×”×ª×§×¦×™×‘ ×™×§×˜×Ÿ ×‘×”×ª××.
                  </p>
                </div>
                <div className="bg-[#E6F19A] bg-opacity-60 rounded-[12px] p-3 border-2 border-[#E6F19A]">
                  <p className="font-varela text-xs text-[#262135] text-center leading-relaxed font-semibold">
                    ×”××ª×’×¨ × ×ž×©×š 6 ×™×ž×™× ×•×™×•× ×”×¤×“×™×•×Ÿ ×”×•× ×”×™×•× ×”-7. ×‘×™×•× ×”×¤×“×™×•×Ÿ {childGender === 'girl' ? '×ª×•×›×œ×™' : '×ª×•×›×œ'} ×œ×¨××•×ª ×›×ž×” ×›×¡×£ ×¦×‘×¨×ª ×•×œ×¤×“×•×ª ××•×ª×•!
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
                ×ž×” ×ª×¨×¦×” ×œ×¢×©×•×ª ×¢× ×”×›×¡×£?
              </h2>
              <p className="font-varela text-sm text-[#948DA9] mb-4 text-center">
                ×‘×—×¨ ×›×ž×” ×©{childGender === 'girl' ? '××ª' : '××ª×”'} ×¨×•×¦×” (× ×™×ª×Ÿ ×œ×‘×—×•×¨ ×™×•×ª×¨ ×ž××—×“)
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
                        <span className="absolute top-1 right-1 text-[#273143] text-lg">âœ“</span>
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
              className="flex-1 py-4 px-6 rounded-[18px] border-2 border-gray-300 text-lg font-varela font-semibold text-[#282743] hover:bg-gray-50 transition-all"
            >
              ×—×–×¨×”
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
            {step === 3 ? '×¡×™×•×' : '×”×ž×©×š'}
          </button>
        </div>
      </div>
    </div>
  );
}
