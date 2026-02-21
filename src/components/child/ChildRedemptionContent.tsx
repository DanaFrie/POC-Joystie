'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  getActiveChallenge,
  updateWeeklyUpload,
  getWeeklyUploadStatus,
  deactivateChallenge,
} from '@/lib/api/challenges';
import { getChild } from '@/lib/api/children';
import { getUser } from '@/lib/api/users';
import { validateRedemptionUrl, isRedemptionCompleted } from '@/utils/url-validation';
import type { ValidateChildUrlResult } from '@/utils/url-validation';
import { getFirebaseApp, getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Redemption');

/** Compress image to JPEG data URL for storage in Firestore (no Firebase Storage). */
function compressToDataUrl(file: File, maxSize = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.width;
      const h = img.height;
      const scale = w > h ? Math.min(1, maxSize / w) : Math.min(1, maxSize / h);
      const c = document.createElement('canvas');
      c.width = Math.round(w * scale);
      c.height = Math.round(h * scale);
      const ctx = c.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      try {
        const dataUrl = c.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

type RedemptionStep = 'estimate' | 'upload' | 'preview' | 'processing' | 'results' | 'redemption';

export function ChildRedemptionContent({
  validationOverride,
}: { validationOverride?: ValidateChildUrlResult | null } = {}) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [urlValid, setUrlValid] = useState<boolean | null>(validationOverride?.mode === 'redemption' ? true : null);
  const [urlError, setUrlError] = useState<string>('');
  const [parentId, setParentId] = useState<string>(validationOverride?.parentId || '');
  const [validatedChildId, setValidatedChildId] = useState<string>(validationOverride?.childId || '');
  const [challengeId, setChallengeId] = useState<string>(validationOverride?.challengeId || '');
  const [challenge, setChallenge] = useState<FirestoreChallenge | null>(null);
  const [weeklyUploadStatus, setWeeklyUploadStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>(
    validationOverride?.weeklyUploadStatus || 'none'
  );
  const [existingUpload, setExistingUpload] = useState<WeeklyUpload | null>(null);

  const [currentStep, setCurrentStep] = useState<RedemptionStep>('estimate');
  const [isProcessing, setIsProcessing] = useState(false);

  const [childThinksMet, setChildThinksMet] = useState<boolean | null>(null);
  const [childEstimatedEarnings, setChildEstimatedEarnings] = useState<number>(0);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadedBy, setUploadedBy] = useState<'parent' | 'child'>('child');
  const [actualScreenTimeMinutes, setActualScreenTimeMinutes] = useState<number>(0);
  const [actualEarnings, setActualEarnings] = useState<number>(0);
  const [processedApps, setProcessedApps] = useState<Array<{ name: string; timeUsed: number; icon?: string }>>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [redemptionCompleted, setRedemptionCompleted] = useState(false);
  const [childData, setChildData] = useState({
    childName: '',
    childGender: 'boy' as 'boy' | 'girl',
    parentName: '',
    parentGender: 'female' as 'female' | 'male',
  });
  const [redemptionDate, setRedemptionDate] = useState<string>('');

  useEffect(() => {
    if (validationOverride?.mode === 'redemption' && validationOverride.parentId) {
      setUrlValid(true);
      setParentId(validationOverride.parentId);
      if (validationOverride.childId) setValidatedChildId(validationOverride.childId);
      if (validationOverride.challengeId) setChallengeId(validationOverride.challengeId);
      if (validationOverride.weeklyUploadStatus) setWeeklyUploadStatus(validationOverride.weeklyUploadStatus);
    }
  }, [validationOverride]);

  useEffect(() => {
    if (validationOverride?.mode === 'redemption') return;
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
          if (validation.childId) setValidatedChildId(validation.childId);
          if (validation.challengeId) {
            setChallengeId(validation.challengeId);
            if (validation.weeklyUploadStatus) {
              setWeeklyUploadStatus(validation.weeklyUploadStatus);
              if (validation.weeklyUploadStatus !== 'none') {
                const { weeklyUpload } = await getWeeklyUploadStatus(validation.challengeId);
                if (weeklyUpload) {
                  setExistingUpload(weeklyUpload);
                  if (validation.weeklyUploadStatus === 'pending') setCurrentStep('results');
                  else if (validation.weeklyUploadStatus === 'approved') {
                    setCurrentStep('redemption');
                    const ch = await getActiveChallenge(validation.parentId!);
                    if (ch && weeklyUpload.processedData) {
                      const goalMinutes = (ch.dailyScreenTimeGoal || 0) * 60 * (ch.challengeDays || 6);
                      const actualMinutes = weeklyUpload.processedData.screenTimeMinutes || 0;
                      const metGoal = actualMinutes <= goalMinutes;
                      const earnings = metGoal
                        ? ch.selectedBudget
                        : Math.max(0, ch.selectedBudget * (1 - (actualMinutes - goalMinutes) / goalMinutes));
                      setActualEarnings(Math.round(earnings * 10) / 10);
                    }
                  } else if (validation.weeklyUploadStatus === 'rejected') setCurrentStep('estimate');
                }
              }
            }
          }
          const completed = await isRedemptionCompleted(validation.parentId);
          if (completed) setRedemptionCompleted(true);
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

  useEffect(() => {
    const loadChallenge = async () => {
      if (!parentId) return;
      try {
        const data = await getActiveChallenge(parentId);
        if (data) {
          setChallenge(data);
          if (childEstimatedEarnings === 0) setChildEstimatedEarnings(data.selectedBudget);
        }
      } catch (error) {
        logger.error('Error loading challenge:', error);
      }
    };
    loadChallenge();
  }, [parentId]);

  useEffect(() => {
    const loadData = async () => {
      if (!urlValid || !parentId) return;
      try {
        const challengeData = await getActiveChallenge(parentId);
        if (!challengeData) return;
        const childIdToUse = validatedChildId || challengeData.childId;
        const child = await getChild(childIdToUse);
        const parent = await getUser(challengeData.parentId);
        if (child && parent) {
          setChildData({
            childName: child.name || '',
            childGender: child.gender || 'boy',
            parentName: parent.firstName || '',
            parentGender: (parent.gender === 'male' || parent.gender === 'female') ? parent.gender : 'female',
          });
        }
      } catch (e) {
        logger.error('Error loading data:', e);
      }
    };
    loadData();
  }, [urlValid, parentId, validatedChildId]);

  useEffect(() => {
    const calc = async () => {
      if (!challengeId || !parentId) return;
      try {
        const challengeData = await getActiveChallenge(parentId);
        if (!challengeData?.startDate) {
          setRedemptionDate('');
          return;
        }
        const start = new Date(challengeData.startDate);
        start.setHours(0, 0, 0, 0);
        const redemption = new Date(start);
        redemption.setDate(start.getDate() + challengeData.challengeDays);
        setRedemptionDate(redemption.toLocaleDateString('he-IL'));
      } catch (error) {
        logger.error('Error calculating redemption date:', error);
        setRedemptionDate('');
      }
    };
    calc();
  }, [challengeId, parentId]);

  useEffect(() => {
    if (!challengeId) return;
    let unsubscribe: (() => void) | null = null;
    const setup = async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore');
        const db = await getFirestoreInstance();
        const challengeRef = doc(db, 'challenges', challengeId);
        unsubscribe = onSnapshot(challengeRef, (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data() as FirestoreChallenge;
          setChallenge(data);
          if (data.weeklyUpload) {
            setWeeklyUploadStatus(data.weeklyUpload.status);
            setExistingUpload(data.weeklyUpload);
            if (data.weeklyUpload.status === 'approved' && currentStep === 'results') {
              setCurrentStep('redemption');
              if (data.weeklyUpload.processedData) {
                setActualScreenTimeMinutes(data.weeklyUpload.processedData.screenTimeMinutes || 0);
                setProcessedApps(data.weeklyUpload.processedData.apps || []);
                if (data.dailyScreenTimeGoal && data.selectedBudget) {
                  const goalMinutes = data.dailyScreenTimeGoal * 60 * data.challengeDays;
                  const actualMinutes = data.weeklyUpload.processedData.screenTimeMinutes || 0;
                  const metGoal = actualMinutes <= goalMinutes;
                  const earnings = metGoal
                    ? data.selectedBudget
                    : Math.max(0, data.selectedBudget * (1 - (actualMinutes - goalMinutes) / goalMinutes));
                  setActualEarnings(Math.round(earnings * 10) / 10);
                }
              }
            }
          }
        });
      } catch (error) {
        logger.error('Error setting up listener:', error);
      }
    };
    setup();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [challengeId, currentStep]);

  const childPronouns = {
    boy: { he: 'הוא', him: 'אותו', his: 'שלו', needs: 'צריך', wants: 'תרצה', get: 'קבל', save: 'שמור', earn: 'תרוויח', think: 'חושב', thought: 'חשבת' },
    girl: { he: 'היא', him: 'אותה', his: 'שלה', needs: 'צריכה', wants: 'תרצי', get: 'קבלי', save: 'שמרי', earn: 'תרוויחי', think: 'חושבת', thought: 'חשבת' },
  };
  const childP = childPronouns[childData.childGender] || childPronouns.boy;
  const parentPronouns = {
    female: { they: 'היא', them: 'אותה', their: 'שלה', with: 'איתה', offers: 'מציעה', decide: 'תחליט', approved: 'אישרה', needs: 'צריכה' },
    male: { they: 'הוא', them: 'אותו', their: 'שלו', with: 'איתו', offers: 'מציע', decide: 'יחליט', approved: 'אישר', needs: 'צריך' },
  };
  const parentP = parentPronouns[childData.parentGender] || parentPronouns.female;
  const parentName = childData.parentGender === 'female' ? 'אמא' : 'אבא';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview((ev.target?.result as string) || '');
      reader.readAsDataURL(file);
    }
  };

  const handleEstimateComplete = () => {
    if (childThinksMet === null) return;
    setCurrentStep('upload');
  };

  const handleUploadComplete = () => {
    if (!uploadedImage) return;
    setCurrentStep('preview');
  };

  const handleConfirmAndProcess = async () => {
    if (!uploadedImage || !challengeId || !parentId) return;
    setIsProcessing(true);
    setCurrentStep('processing');
    try {
      await getFirebaseApp(); // ensure Firebase is initialized before Firestore/Functions
      const screenshotUrl = await compressToDataUrl(uploadedImage);

      let processedData: { screenTimeMinutes: number; minutesPerDay?: Record<string, number>; apps?: Array<{ name: string; timeUsed: number; icon?: string }> } | undefined;
      try {
        const { processScreenshot } = await import('@/lib/api/screenshot');
        const result = await processScreenshot(uploadedImage, 'weekly');
        if (result?.found) {
          processedData = {
            screenTimeMinutes: result.minutes || 0,
            ...(result.minutes_per_day && Object.keys(result.minutes_per_day).length > 0 && { minutesPerDay: result.minutes_per_day }),
          };
          setActualScreenTimeMinutes(result.minutes || 0);
        }
      } catch (ocrError) {
        logger.error('OCR processing failed:', ocrError);
      }

      await updateWeeklyUpload(challengeId, {
        screenshotUrl,
        uploadedBy,
        childEstimate: {
          metGoal: childThinksMet ?? false,
          estimatedEarnings: childEstimatedEarnings,
        },
        processedData,
      });

      if (challenge && processedData) {
        const goalMinutes = (challenge.dailyScreenTimeGoal || 0) * 60 * (challenge.challengeDays || 6);
        const metGoal = processedData.screenTimeMinutes <= goalMinutes;
        const earnings = metGoal
          ? challenge.selectedBudget
          : Math.max(0, challenge.selectedBudget * (1 - (processedData.screenTimeMinutes - goalMinutes) / goalMinutes));
        setActualEarnings(Math.round(earnings * 10) / 10);
      }
      setWeeklyUploadStatus('pending');
      setCurrentStep('results');
    } catch (error) {
      logger.error('Error processing upload:', error);
      alert('שגיאה בהעלאה. נסה שוב.');
      setCurrentStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedemption = async () => {
    if (!selectedOption || !challengeId) return;
    setIsProcessing(true);
    try {
      await deactivateChallenge(challengeId, {
        redemptionAmount: actualEarnings,
        redemptionChoice: selectedOption as 'cash' | 'donation' | 'activity' | 'save',
        redeemedAt: new Date().toISOString(),
      });
      setRedemptionCompleted(true);
    } catch (error) {
      logger.error('Error processing redemption:', error);
      alert('שגיאה בעיבוד הפדיון. נסה שוב.');
    } finally {
      setIsProcessing(false);
    }
  };

  const redemptionOptions = [
    { id: 'cash', label: 'מזומן 💵', description: `${childP.get} את הכסף במטבעות או שטרות ישר אלייך` },
    { id: 'activity', label: 'פעילות 🎮', description: `הצע ל${parentName} חוויה שהיית רוצה ${parentP.with}` },
    { id: 'donation', label: 'תרומה ❤️', description: `תרום את הכסף למטרה טובה ותעשה טוב לאחרים` },
    { id: 'save', label: 'חסכון 🏦', description: `${childP.save} את הכסף בחסכון ו${childP.earn} 20 אגורות על כל שבוע` },
  ];

  if (urlValid === false) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <h1 className="font-heebo font-semibold text-2xl text-[#262135] mb-4">כתובת לא תקינה</h1>
            <p className="font-heebo text-base text-[#282743] mb-4">{urlError || 'הכתובת ששותפה איתך לא תקינה או שהפדיון הושלם כבר.'}</p>
            <p className="font-heebo text-sm text-[#948DA9]">בדוק עם ההורה שלך לקבלת כתובת חדשה.</p>
          </div>
        </div>
      </div>
    );
  }

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

  if (redemptionCompleted) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <Image src="/icon-joystie.png" alt="" width={64} height={64} className="mx-auto mb-4" />
            <h1 className="font-heebo font-semibold text-2xl text-[#262135] mb-4">הפדיון בוצע בהצלחה!</h1>
            <p className="font-heebo text-base text-[#282743] mb-4">לשבוע הבא, ההורה ישלח לך כתובת חדשה.</p>
            <p className="font-heebo text-sm text-[#948DA9]">הכתובת הזו לא פעילה יותר</p>
          </div>
        </div>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center gap-2">
        {['estimate', 'upload', 'preview', 'results'].map((step, index) => {
          const stepIndex = ['estimate', 'upload', 'preview', 'results'].indexOf(currentStep);
          const isActive = index <= stepIndex;
          const isCurrent =
            step === currentStep ||
            (currentStep === 'processing' && step === 'results') ||
            (currentStep === 'redemption' && step === 'results');
          return (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isCurrent ? 'bg-[#273143] text-white' : isActive ? 'bg-[#E6F19A] text-[#273143]' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              {index < 3 && <div className={`w-8 h-1 ${isActive ? 'bg-[#E6F19A]' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-24 relative">
      {isProcessing && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="font-heebo text-lg text-[#262135] mb-4">
              {currentStep === 'processing' ? 'מעבד את התמונה...' : 'מעבד...'}
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#262135] mx-auto" />
          </div>
        </div>
      )}

      <div className={`max-w-md mx-auto px-4 py-8 relative ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="absolute right-4 top-0 pointer-events-none z-10">
          <Image src="/piggy-bank.png" alt="Piggy Bank" width={120} height={120} className="object-contain w-28 h-28 max-w-[112px]" />
        </div>

        <div className="text-center mb-6 mt-16">
          <h1 className="font-heebo font-semibold text-2xl text-[#262135]">יום הפדיון! 🎉</h1>
          <p className="font-heebo text-sm text-[#948DA9] mt-1">{redemptionDate && `תאריך: ${redemptionDate}`}</p>
        </div>

        <StepIndicator />

        {currentStep === 'estimate' && (
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6">
            <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-4 text-center">
              {childData.childName}, מה {childP.think}?
            </h2>
            <div className="mb-6">
              <p className="font-heebo text-base text-[#282743] mb-3 text-center">האם לדעתך עמדת ביעד השבוע?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setChildThinksMet(true)}
                  className={`px-8 py-4 rounded-[18px] border-2 transition-all ${
                    childThinksMet === true ? 'border-[#E6F19A] bg-[#E6F19A] bg-opacity-30' : 'border-gray-200 bg-white hover:border-[#E6F19A]'
                  }`}
                >
                  <span className="text-3xl">👍</span>
                  <p className="font-heebo font-semibold mt-1">כן!</p>
                </button>
                <button
                  onClick={() => setChildThinksMet(false)}
                  className={`px-8 py-4 rounded-[18px] border-2 transition-all ${
                    childThinksMet === false ? 'border-[#BBE9FD] bg-[#BBE9FD] bg-opacity-30' : 'border-gray-200 bg-white hover:border-[#BBE9FD]'
                  }`}
                >
                  <span className="text-3xl">👎</span>
                  <p className="font-heebo font-semibold mt-1">לא</p>
                </button>
              </div>
            </div>
            <div className="mb-6">
              <p className="font-heebo text-base text-[#282743] mb-3 text-center">כמה כסף {childP.think} שצברת?</p>
              <div
                className="rounded-[12px] p-4 bg-cover bg-center bg-no-repeat min-h-[80px] flex flex-col justify-center"
                style={{ backgroundImage: "url('/background.png')" }}
              >
                <input
                  type="range"
                  min="0"
                  max={challenge?.selectedBudget || 100}
                  value={childEstimatedEarnings}
                  onChange={(e) => setChildEstimatedEarnings(Number(e.target.value))}
                  className="w-full h-2 bg-white/80 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center mt-3">
                  <span className="font-heebo font-bold text-3xl text-[#262135]">₪{childEstimatedEarnings}</span>
                  <p className="font-heebo text-xs text-[#948DA9] mt-1">מתוך ₪{challenge?.selectedBudget || 100} אפשריים</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleEstimateComplete}
              disabled={childThinksMet === null}
              className={`w-full py-4 px-6 rounded-[18px] text-lg font-heebo font-semibold transition-all ${
                childThinksMet !== null ? 'bg-[#273143] text-white hover:bg-opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              המשך להעלאת תמונה
            </button>
          </div>
        )}

        {currentStep === 'upload' && (
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6">
            <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-4 text-center">העלאת צילום מסך</h2>
            <p className="font-heebo text-base text-[#282743] mb-4 text-center">יחד עם {parentName}, העלו צילום מסך של זמן המסך השבועי</p>
            <div className="mb-4">
              <p className="font-heebo text-sm text-[#948DA9] mb-2 text-center">מי מעלה?</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setUploadedBy('child')}
                  className={`px-4 py-2 rounded-full text-sm font-heebo transition-all ${
                    uploadedBy === 'child' ? 'bg-[#273143] text-white' : 'bg-gray-100 text-[#282743] hover:bg-gray-200'
                  }`}
                >
                  {childData.childName || 'הילד/ה'}
                </button>
                <button
                  onClick={() => setUploadedBy('parent')}
                  className={`px-4 py-2 rounded-full text-sm font-heebo transition-all ${
                    uploadedBy === 'parent' ? 'bg-[#273143] text-white' : 'bg-gray-100 text-[#282743] hover:bg-gray-200'
                  }`}
                >
                  {parentName}
                </button>
              </div>
            </div>
            <div className="border-2 border-dashed border-[#BBE9FD] rounded-[18px] p-8 text-center mb-6 relative">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-w-full max-h-48 mx-auto rounded-[12px]" />
                  <button
                    onClick={() => { setUploadedImage(null); setImagePreview(''); }}
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-3">📸</div>
                  <p className="font-heebo text-[#282743] mb-2">לחצו להעלאת תמונה</p>
                  <p className="font-heebo text-xs text-[#948DA9]">או גררו תמונה לכאן</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className={imagePreview ? 'hidden' : 'absolute inset-0 w-full h-full opacity-0 cursor-pointer'}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('estimate')}
                className="flex-1 py-4 px-6 rounded-[18px] text-lg font-heebo font-semibold border-2 border-[#273143] text-[#273143] hover:bg-gray-50 transition-all"
              >
                חזרה
              </button>
              <button
                onClick={handleUploadComplete}
                disabled={!uploadedImage}
                className={`flex-1 py-4 px-6 rounded-[18px] text-lg font-heebo font-semibold transition-all ${
                  uploadedImage ? 'bg-[#273143] text-white hover:bg-opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                המשך
              </button>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6">
            <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-4 text-center">אישור לפני עיבוד</h2>
            <div className="bg-gray-50 rounded-[12px] p-4 mb-4">
              <p className="font-heebo text-sm text-[#948DA9] mb-2">ההערכה שלך:</p>
              <p className="font-heebo text-[#282743]">
                {childThinksMet ? '✅ עמדתי ביעד' : '❌ לא עמדתי ביעד'} | הערכה: ₪{childEstimatedEarnings}
              </p>
            </div>
            {imagePreview && (
              <div className="mb-4">
                <p className="font-heebo text-sm text-[#948DA9] mb-2">התמונה שהעלית:</p>
                <img src={imagePreview} alt="Screenshot" className="w-full rounded-[12px] border border-gray-200" />
              </div>
            )}
            <p className="font-heebo text-sm text-[#948DA9] text-center mb-4">לאחר האישור, התמונה תעבור עיבוד וההורה יקבל הודעה לאישור.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('upload')}
                className="flex-1 py-4 px-6 rounded-[18px] text-lg font-heebo font-semibold border-2 border-[#273143] text-[#273143] hover:bg-gray-50 transition-all"
              >
                חזרה
              </button>
              <button onClick={handleConfirmAndProcess} className="flex-1 py-4 px-6 rounded-[18px] text-lg font-heebo font-semibold bg-[#273143] text-white hover:bg-opacity-90 transition-all">
                אשר ושלח
              </button>
            </div>
          </div>
        )}

        {currentStep === 'results' && (
          <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] shadow-card p-6 text-center">
            {weeklyUploadStatus === 'pending' ? (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-4">ממתין לאישור {parentName}</h2>
                <p className="font-heebo text-base text-[#282743] mb-4">
                  התמונה הועלתה בהצלחה! עכשיו {parentName} {parentP.needs} לאשר את הנתונים.
                </p>
                <div className="bg-white bg-opacity-80 rounded-[12px] p-4 mb-4">
                  <p className="font-heebo text-sm text-[#948DA9] mb-1">ההערכה שלך:</p>
                  <p className="font-heebo font-bold text-xl text-[#262135]">₪{childEstimatedEarnings}</p>
                </div>
                <p className="font-heebo text-sm text-[#948DA9]">העמוד יתעדכן אוטומטית לאחר האישור</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-4">התוצאות שלך!</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                    <p className="font-heebo text-sm text-[#948DA9] mb-1">{childP.thought}:</p>
                    <p className="font-heebo font-bold text-xl text-[#282743]">₪{childEstimatedEarnings}</p>
                  </div>
                  <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                    <p className="font-heebo text-sm text-[#948DA9] mb-1">בפועל:</p>
                    <p className="font-heebo font-bold text-xl text-[#262135]">₪{actualEarnings}</p>
                  </div>
                </div>
                {Math.abs(actualEarnings - childEstimatedEarnings) > 0.5 && (
                  <div className="bg-white bg-opacity-80 rounded-[12px] p-3 mb-4">
                    <p className="font-heebo text-sm text-[#282743]">
                      {actualEarnings > childEstimatedEarnings
                        ? `🎊 הפתעה! הרווחת יותר ממה ש${childP.thought}!`
                        : `💡 ההערכה שלך הייתה קצת גבוהה, אבל עדיין הרווחת יפה!`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {currentStep === 'redemption' && (
          <>
            <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] rounded-[18px] shadow-card p-6 mb-6 text-center">
              <h2 className="font-heebo font-semibold text-xl text-[#262135] mb-2">{parentName} {parentP.approved}! 🎉</h2>
              <p className="font-heebo text-base text-[#282743] mb-4">{childData.childName}, הרווחת השבוע:</p>
              <div className="bg-white bg-opacity-80 rounded-[12px] p-4">
                <p className="font-heebo font-bold text-3xl text-[#262135]">₪{actualEarnings}</p>
              </div>
              {existingUpload?.childEstimate && (
                <div className="mt-4 bg-white bg-opacity-60 rounded-[12px] p-3">
                  <p className="font-heebo text-sm text-[#282743]">
                    {childP.thought} ש{childP.earn} ₪{existingUpload.childEstimate.estimatedEarnings} -{' '}
                    {actualEarnings >= existingUpload.childEstimate.estimatedEarnings ? 'הצלחת!' : 'קרוב!'}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
              <h2 className="font-heebo font-semibold text-lg text-[#262135] mb-4 text-center">איך {childP.wants} לקחת את הכסף?</h2>
              <div className="space-y-3">
                {redemptionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full p-4 rounded-[18px] border-2 transition-all text-right ${
                      selectedOption === option.id ? 'border-[#273143] bg-[#273143] bg-opacity-10' : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heebo font-semibold text-base text-[#282743] mb-1">{option.label}</h3>
                        <p className="font-heebo text-sm text-[#948DA9] whitespace-pre-line">{option.description}</p>
                      </div>
                      {selectedOption === option.id && <div className="text-2xl flex-shrink-0 mr-2">✓</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleRedemption}
              disabled={!selectedOption || isProcessing}
              className={`w-full py-4 px-6 rounded-[18px] text-lg font-heebo font-semibold transition-all ${
                selectedOption && !isProcessing ? 'bg-[#273143] text-white hover:bg-opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              קח את הכסף!
            </button>
          </>
        )}

        <div className="mt-6 bg-[#FFFCF8] rounded-[18px] shadow-card p-4 text-center">
          <p className="font-heebo text-xs text-[#948DA9]">תאריך הפדיון: {redemptionDate || 'טוען...'}</p>
        </div>
      </div>
    </div>
  );
}
