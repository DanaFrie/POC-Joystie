'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUserId } from '@/utils/auth';
import { getActiveChallenge } from '@/lib/api/challenges';
import { getUploadsByChallenge } from '@/lib/api/uploads';
import { getChild } from '@/lib/api/children';
import { getUser } from '@/lib/api/users';
import { validateRedemptionUrl, isRedemptionCompleted } from '@/utils/url-validation';
import { deactivateChallenge } from '@/lib/api/challenges';

function ChildRedemptionContent() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const childId = searchParams.get('childId') || '';
  const lastEarningsParam = searchParams.get('lastEarnings'); // Renamed from fridayEarnings
  const weeklyTotalParam = searchParams.get('weeklyTotal');
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [urlError, setUrlError] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [validatedChildId, setValidatedChildId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  
  // Initialize approval states based on whether we came from last upload
  const [awaitingParentApproval, setAwaitingParentApproval] = useState(() => {
    // If we have lastEarnings in URL, start with awaiting approval
    return lastEarningsParam ? true : false;
  });
  const [lastApproved, setLastApproved] = useState(false); // Renamed from fridayApproved
  const [redemptionCompleted, setRedemptionCompleted] = useState(false);

  // Validate URL token on mount
  useEffect(() => {
    const validateUrl = async () => {
      if (!token) {
        setUrlValid(false);
        setUrlError('כתובת לא תקינה - חסר טוקן');
        return;
      }

      try {
        const validation = await validateRedemptionUrl(token);
        if (validation.isValid && validation.parentId) {
          setUrlValid(true);
          setParentId(validation.parentId);
          if (validation.childId) {
            setValidatedChildId(validation.childId);
          }
          if (validation.challengeId) {
            setChallengeId(validation.challengeId);
            
            // Check if redemption has already been completed
            const completed = await isRedemptionCompleted(validation.parentId);
            if (completed) {
              setRedemptionCompleted(true);
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

  // Get child and parent data - use state to avoid hydration mismatch
  const [childData, setChildData] = useState({
    childName: '',
    childGender: 'boy' as 'boy' | 'girl',
    parentName: '',
    parentGender: 'female' as 'female' | 'male'
  });

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!urlValid || !parentId) return;
      
      try {
        const challenge = await getActiveChallenge(parentId);
        if (!challenge) return;

        const childIdToUse = validatedChildId || challenge.childId;
        const child = await getChild(childIdToUse);
        const parent = await getUser(challenge.parentId);

        if (child && parent) {
          setChildData({
            childName: child.name || '',
            childGender: child.gender || 'boy',
            parentName: parent.firstName || '',
            parentGender: (parent.gender === 'male' || parent.gender === 'female') ? parent.gender : 'female'
          });
        }
      } catch (e) {
        console.error('Error loading data from Firebase:', e);
      }
    };

    loadData();
  }, [urlValid, parentId, validatedChildId]);

  const childName = childData.childName;
  const childGender = childData.childGender;
  
  // Get earnings from query params or calculate from Firestore
  const lastEarnings = lastEarningsParam ? parseFloat(lastEarningsParam) : 0; // Renamed from fridayEarnings
  const weeklyTotalFromParams = weeklyTotalParam ? parseFloat(weeklyTotalParam) : 0;
  
  // Calculate total earnings from Firebase if not from params
  const [totalEarnings, setTotalEarnings] = useState(weeklyTotalFromParams || 89.5);
  
  // Load total earnings - recalculate when approval status changes
  useEffect(() => {
    const loadTotalEarnings = async () => {
      if (weeklyTotalFromParams > 0) {
        setTotalEarnings(weeklyTotalFromParams);
        return;
      }
      
      // Don't calculate if we don't have parentId yet
      if (!parentId) return;
      
      try {
        const challenge = await getActiveChallenge(parentId);
        if (!challenge) return;

        const uploads = await getUploadsByChallenge(challenge.id, parentId);
        // Only count approved uploads
        const approvedUploads = uploads.filter(u => u.parentAction === 'approved');
        const total = approvedUploads.reduce((sum, upload) => sum + (upload.coinsEarned || 0), 0);
        
        if (total > 0) {
          setTotalEarnings(total);
        }
      } catch (e) {
        console.error('Error loading total earnings:', e);
      }
    };

    loadTotalEarnings();
  }, [weeklyTotalFromParams, parentId, lastApproved]); // Recalculate when lastApproved changes
  
  // Calculate redemption date from challenge startDate (Saturday of challenge week)
  const [redemptionDate, setRedemptionDate] = useState<string>('');
  
  useEffect(() => {
    const calculateRedemptionDate = async () => {
      if (!challengeId || !parentId) return;
      
      try {
        const challenge = await getActiveChallenge(parentId);
        if (!challenge) return;
        
        // Calculate Saturday of the challenge week
        const startDate = new Date(challenge.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        // Find the start of the challenge week (Sunday)
        const challengeStartDay = startDate.getDay(); // 0 = Sunday
        const challengeSunday = new Date(startDate);
        challengeSunday.setDate(startDate.getDate() - challengeStartDay);
        
        // Saturday is day 6 (Sunday = 0, Monday = 1, ..., Saturday = 6)
        const challengeSaturday = new Date(challengeSunday);
        challengeSaturday.setDate(challengeSunday.getDate() + 6);
        
        setRedemptionDate(challengeSaturday.toLocaleDateString('he-IL'));
      } catch (error) {
        console.error('Error calculating redemption date:', error);
        setRedemptionDate('');
      }
    };
    
    calculateRedemptionDate();
  }, [challengeId, parentId]);
  
  // Use ref to store timer so it persists across re-renders
  const autoApproveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if we came from last upload - if so, show awaiting approval
  useEffect(() => {
    if (lastEarnings > 0 && challengeId && parentId) {
      // Reset approval state when coming from last upload
      setAwaitingParentApproval(true);
      setLastApproved(false);
      
      // Clear any existing timer
      if (autoApproveTimerRef.current) {
        clearTimeout(autoApproveTimerRef.current);
        autoApproveTimerRef.current = null;
      }
      
      // Check Firebase for last pending approval status (lean query)
      const checkLastApproval = async () => {
        // Early exit if already approved
        if (lastApproved) {
          return true;
        }
        
        try {
          // Lean query: only fetch pending approvals for this challenge (limit 1)
          const { getPendingApprovalsByChallenge } = await import('@/lib/api/uploads');
          const pendingUploads = await getPendingApprovalsByChallenge(challengeId, parentId);
          
          // If no pending approvals, the last one was approved
          if (pendingUploads.length === 0) {
            // Stop polling and update state
            if (autoApproveTimerRef.current) {
              clearTimeout(autoApproveTimerRef.current);
              autoApproveTimerRef.current = null;
            }
            setAwaitingParentApproval(false);
            setLastApproved(true);
            return true;
          }
          
          // Still pending
          return false;
        } catch (e) {
          console.error('Error checking last approval:', e);
          return false;
        }
      };
      
      // Check initial state
      checkLastApproval();
      
      // Listen for approval event from dashboard
      const handleLastApproved = (event: CustomEvent) => {
        // Cancel auto-approve if parent already approved
        if (autoApproveTimerRef.current) {
          clearTimeout(autoApproveTimerRef.current);
          autoApproveTimerRef.current = null;
        }
        setAwaitingParentApproval(false);
        setLastApproved(true);
      };
      
      // Listen for approval event
      window.addEventListener('lastApproved', handleLastApproved as EventListener);
      
      // Check Firebase periodically for approval status (stops when approved)
      let checkInterval: NodeJS.Timeout | null = null;
      const startPolling = () => {
        if (checkInterval) return; // Already polling
        
        checkInterval = setInterval(async () => {
          const approved = await checkLastApproval();
          if (approved && checkInterval) {
            // Stop polling once approved
            clearInterval(checkInterval);
            checkInterval = null;
          }
        }, 6000); // Check every 6 seconds
      };
      
      startPolling();
      
      return () => {
        if (autoApproveTimerRef.current) {
          clearTimeout(autoApproveTimerRef.current);
          autoApproveTimerRef.current = null;
        }
        window.removeEventListener('lastApproved', handleLastApproved as EventListener);
        if (checkInterval) {
        clearInterval(checkInterval);
          checkInterval = null;
        }
      };
    }
  }, [lastEarnings, challengeId, parentId]);

  // Gender pronouns for child
  const childPronouns = {
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', earned: 'צבר', wants: 'תרצה', get: 'קבל', save: 'שמור', earn: 'תרוויח' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', earned: 'צברה', wants: 'תרצי', get: 'קבלי', save: 'שמרי', earn: 'תרוויחי' }
  };
  const childP = childPronouns[childGender as 'boy' | 'girl'] || childPronouns.boy;

  // Get parent name (אמא/אבא) from childData
  const getParentName = () => {
    const parentGender = childData.parentGender;
    if (parentGender === 'female') {
      return 'אמא';
    }
    return 'אבא';
  };

  const parentName = getParentName();
  
  // Parent pronouns
  const parentPronouns = {
    female: { they: 'היא', them: 'אותה', their: 'שלה', with: 'איתה', offers: 'מציעה', decide: 'תחליט', approved: 'אישרה' },
    male: { they: 'הוא', them: 'אותו', their: 'שלו', with: 'איתו', offers: 'מציע', decide: 'יחליט', approved: 'אישר' }
  };
  const parentP = parentPronouns[childData.parentGender as 'female' | 'male'] || parentPronouns.female;

  const redemptionOptions = [
    { id: 'cash', label: 'מזומן 💵', description: `${childP.get} את הכסף במטבעות או שטרות ישר אלייך` },
    { id: 'gift', label: 'מתנה 🎁', description: `בחר מתנה מתוך מה ש${parentName} ${parentP.offers} לך` },
    { id: 'activity', label: 'פעילות 🎮', description: `הצע ל${parentName} חוויה ש${childP.he === 'היא' ? 'היית' : 'היית'} רוצה ${parentP.with}` },
    { id: 'save', label: 'חסכון 🏦', description: `${childP.save} את הכסף בחסכון ו${childP.earn} חצי שקל על כל שבוע שהוא שם` }
  ];

  const handleRedemption = async () => {
    if (!selectedOption) return;

    setIsProcessing(true);
    try {
      // Store redemption data in challenge document and deactivate challenge
      if (challengeId) {
        const { deactivateChallenge } = await import('@/lib/api/challenges');
        await deactivateChallenge(challengeId, {
          redemptionAmount: totalEarnings,
          redemptionChoice: selectedOption as 'cash' | 'gift' | 'activity' | 'save',
          redeemedAt: new Date().toISOString()
        });
        setRedemptionCompleted(true);
      }
      
      // Here you would typically process redemption with backend
      // For now, just show success
      setTimeout(() => {
        setIsProcessing(false);
        alert('הפדיון בוצע בהצלחה!');
      }, 2000);
    } catch (error) {
      console.error('Error processing redemption:', error);
      setIsProcessing(false);
      alert('שגיאה בעיבוד הפדיון. נסה שוב.');
    }
  };

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
              {urlError || 'הכתובת ששותפה איתך לא תקינה או שהפדיון הושלם כבר.'}
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

  // Show redemption completed message
  if (redemptionCompleted) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4">
              הפדיון הושלם!
            </h1>
            <p className="font-varela text-base text-[#282743] mb-4">
              הפדיון בוצע בהצלחה. הכתובת הזו לא פעילה יותר.
            </p>
            <p className="font-varela text-sm text-[#948DA9]">
              לשבוע הבא, ההורה שלך ישלח לך כתובת חדשה.
            </p>
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

        {/* Awaiting Parent Approval Screen */}
        {awaitingParentApproval && !lastApproved && (
          <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] shadow-card p-6 mb-6 text-center mt-20">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4">
              ממתין לאישור של {parentName}...
            </h1>
            <p className="font-varela text-base text-[#282743] mb-4 leading-relaxed">
              {childName}, העלית את ההעלאה האחרונה ו{childP.earned} <strong className="text-[#273143]">₪{lastEarnings.toFixed(1)}</strong>!
              <br />
              עכשיו צריך את האישור של {parentName} כדי לראות את כל מה ש{childP.earned} השבוע.
            </p>
            <div className="bg-white bg-opacity-80 rounded-[12px] p-4 mt-4">
              <p className="font-varela text-sm text-[#948DA9] mb-1">סכום ההעלאה האחרונה:</p>
              <p className="font-varela font-bold text-2xl text-[#262135]">
                ₪{lastEarnings.toFixed(1)}
              </p>
            </div>
            <p className="font-varela text-sm text-[#282743] mt-4">
              {parentName} צריך לאשר את ההעלאה בדשבורד {parentP.their} כדי שתוכל לראות את כל הסכום.
            </p>
          </div>
        )}

        {/* Parent Approval Celebration Screen - show briefly after approval */}
        {lastApproved && (
          <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] shadow-card p-6 mb-6 text-center mt-20 animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4">
              {parentName} {parentP.approved}!
            </h1>
            <p className="font-varela text-base text-[#282743] mb-4 leading-relaxed">
              כל הכבוד {childName}! {parentName} {parentP.approved} את ההעלאה האחרונה.
            </p>
          </div>
        )}

        {/* Celebration header - show when not awaiting approval or after approval */}
        {(!awaitingParentApproval || lastApproved) && (
          <>
            {/* Last earnings box - show above summary when last upload was approved */}
            {lastApproved && lastEarnings > 0 && (
              <div className="bg-[#E6F19A] bg-opacity-50 rounded-[12px] p-4 mb-4 border-2 border-[#E6F19A] shadow-sm">
                <p className="font-varela text-sm text-[#948DA9] mb-1 text-center">סכום ההעלאה האחרונה:</p>
                <p className="font-varela font-bold text-2xl text-[#273143] text-center">
                  ₪{lastEarnings.toFixed(1)}
                </p>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] shadow-card p-6 mb-6 text-center">
              <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-2">
                יום הפדיון!
              </h1>
              <p className="font-varela text-base text-[#282743] mb-4">
                {childName}, {childP.earned} השבוע:
              </p>
              <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                <p className="font-varela font-bold text-3xl text-[#262135]">
                  ₪{totalEarnings.toFixed(1)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Redemption options - only show when not awaiting approval or after approval */}
        {(!awaitingParentApproval || lastApproved) && (
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          <h2 className="font-varela font-semibold text-lg text-[#262135] mb-4 text-center">
            איך {childP.wants} לקחת את הכסף?
          </h2>
          <div className="space-y-3">
            {redemptionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full p-4 rounded-[18px] border-2 transition-all text-right ${
                  selectedOption === option.id
                    ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                    : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-varela font-semibold text-base text-[#282743] mb-1">
                      {option.label}
                    </h3>
                    <p className="font-varela text-sm text-[#948DA9] whitespace-nowrap overflow-hidden text-ellipsis">
                      {option.description}
                    </p>
                  </div>
                  {selectedOption === option.id && (
                    <div className="text-2xl flex-shrink-0 mr-2">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Redemption button - only show when not awaiting approval or after approval */}
        {(!awaitingParentApproval || lastApproved) && (
          <button
            onClick={handleRedemption}
            disabled={!selectedOption || isProcessing}
            className={`w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
              selectedOption && !isProcessing
                ? 'bg-[#273143] text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'מעבד...' : 'קח את הכסף!'}
          </button>
        )}

        {/* Info */}
        <div className="mt-6 bg-[#FFFCF8] rounded-[18px] shadow-card p-4 text-center">
          <p className="font-varela text-xs text-[#948DA9]">
            תאריך הפדיון: {redemptionDate || 'טוען...'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChildRedemptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
      <ChildRedemptionContent />
    </Suspense>
  );
}

