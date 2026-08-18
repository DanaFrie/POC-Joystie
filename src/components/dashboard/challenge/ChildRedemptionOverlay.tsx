'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChallengeBody,
  ChallengeEyebrow,
  ChallengeTitle,
} from '@/components/dashboard/challenge/ChallengeCardPrimitives';
import { ChallengeGlowContinueButton } from '@/components/dashboard/challenge/ChallengeGlowContinueButton';
import { ChallengeScreenshotGuide } from '@/components/dashboard/challenge/ChallengeScreenshotGuide';
import { ChallengeUploadPickButton } from '@/components/dashboard/challenge/ChallengeUploadPickButton';
import { DashboardBlurCardOverlay } from '@/components/dashboard/challenge/DashboardBlurCardOverlay';
import { SelectableOptionCard } from '@/components/onboarding/parent/SelectableOptionCard';
import { RedemptionCalcBreakdown } from '@/components/dashboard/challenge/RedemptionCalcBreakdown';
import { RedemptionOutcomeHero } from '@/components/dashboard/challenge/RedemptionOutcomeHero';
import { V03_REDEMPTION_OPTIONS, type V03RedemptionChoiceId } from '@/constants/v03-challenge';
import {
  V03_REDEMPTION_CELEBRATE_VIDEO,
  V03_CHALLENGE_SETUP_LAYOUT,
} from '@/constants/v03-challenge-layout';
import { SIGNUP_CHILD_INVITE_WAITING_LOGO } from '@/constants/onboarding-figma';
import { SIGNUP_CHILD_INVITE_WAITING_LOGO_PX } from '@/constants/signup-child-invite-layout';
import { processScreenshot } from '@/lib/api/screenshot';
import {
  computeRedemptionSettlement,
  type RedemptionSettlement,
} from '@/lib/challenge/redemptionOcr';
import { compressScreenshotToDataUrl } from '@/lib/challenge/screenshotImage';
import { formatNumber } from '@/utils/formatting';

export type ChildRedemptionFlowResult = {
  remainingAmount: number;
  totalScreenMinutes: number;
  totalScreenHours: number;
  burnedAmount: number;
  uploadedBy: 'child' | 'parent';
  redemptionChoice?: V03RedemptionChoiceId;
  screenshotDataUrl?: string;
  minutesPerDay?: Record<string, number>;
  usedMockOcr: boolean;
};

type ChildRedemptionOverlayProps = {
  visible: boolean;
  childName: string;
  parentLabel?: string;
  weeklyBudget: number;
  hourlyRate: number;
  /** Active challenge — required for live parent-approval listening. */
  challengeId?: string;
  /** Fallback OCR minutes when API unavailable (test route). */
  fallbackOcrMinutes?: number;
  onClose: () => void;
  /** Persist pending weekly upload so the parent can confirm. */
  onSubmitForParentApproval?: (result: ChildRedemptionFlowResult) => Promise<void> | void;
  onComplete: (result: ChildRedemptionFlowResult) => void;
};

type RedemptionStep =
  | 'upload'
  | 'guide'
  | 'preview'
  | 'processing'
  | 'results'
  | 'choice'
  | 'done';

export function ChildRedemptionOverlay({
  visible,
  childName,
  parentLabel = 'אמא',
  weeklyBudget,
  hourlyRate,
  challengeId,
  fallbackOcrMinutes = 540,
  onClose,
  onSubmitForParentApproval,
  onComplete,
}: ChildRedemptionOverlayProps) {
  const [step, setStep] = useState<RedemptionStep>('upload');
  const [uploadedBy, setUploadedBy] = useState<'child' | 'parent'>('child');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [settlement, setSettlement] = useState<RedemptionSettlement | null>(null);
  const [choice, setChoice] = useState<V03RedemptionChoiceId | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [usedMockOcr, setUsedMockOcr] = useState(false);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | undefined>();
  const [parentApprovalReady, setParentApprovalReady] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleId = 'child-redemption-title';
  const uploadedByRef = useRef(uploadedBy);
  uploadedByRef.current = uploadedBy;

  useEffect(() => {
    if (!visible) return;
    setStep('upload');
    setUploadedBy('child');
    setUploadedImage(null);
    setImagePreview('');
    setSettlement(null);
    setChoice(null);
    setProcessError(null);
    setUsedMockOcr(false);
    setScreenshotDataUrl(undefined);
    setParentApprovalReady(false);
    setUploadPending(false);
  }, [visible]);

  const remaining = settlement?.remainingAmount ?? 0;

  // Only parent↔child live sync: wait for parent redemption confirm.
  useEffect(() => {
    if (step !== 'results' || remaining <= 0) {
      setParentApprovalReady(false);
      return;
    }

    setParentApprovalReady(false);

    // Test route without a challenge — short local fallback.
    if (!challengeId) {
      const timer = window.setTimeout(() => setParentApprovalReady(true), 3000);
      return () => window.clearTimeout(timer);
    }

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore');
        const { getFirestoreInstance } = await import('@/lib/firebase');
        const db = await getFirestoreInstance();
        const challengeRef = doc(db, 'challenges', challengeId);
        unsubscribe = onSnapshot(challengeRef, (snapshot) => {
          if (cancelled || !snapshot.exists()) return;
          const data = snapshot.data() as { weeklyUpload?: { status?: string } };
          if (data.weeklyUpload?.status === 'approved') {
            setParentApprovalReady(true);
          }
        });
      } catch {
        // Keep waiting UI; parent confirm is the source of truth.
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [step, remaining, challengeId]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setUploadedImage(file);
    setProcessError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview((ev.target?.result as string) || '');
    reader.readAsDataURL(file);
    setStep('preview');
  };

  const goBackToUpload = () => {
    setUploadedImage(null);
    setImagePreview('');
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buildResult = useCallback(
    (
      next: RedemptionSettlement,
      dataUrl: string | undefined,
      mock: boolean,
      redemptionChoice?: V03RedemptionChoiceId
    ): ChildRedemptionFlowResult => ({
      remainingAmount: next.remainingAmount,
      totalScreenMinutes: next.totalMinutes,
      totalScreenHours: next.totalHours,
      burnedAmount: next.burnedAmount,
      uploadedBy: uploadedByRef.current,
      redemptionChoice,
      screenshotDataUrl: dataUrl,
      minutesPerDay: next.minutesPerDay,
      usedMockOcr: mock,
    }),
    []
  );

  const runOcr = useCallback(async () => {
    if (!uploadedImage) return;
    setStep('processing');
    setProcessError(null);

    try {
      const dataUrl = await compressScreenshotToDataUrl(uploadedImage);
      setScreenshotDataUrl(dataUrl);

      let ocrMinutes = 0;
      let minutesPerDay: Record<string, number> | undefined;
      let mock = false;

      try {
        const result = await processScreenshot(uploadedImage, 'weekly');
        if (result.found && (result.minutes > 0 || result.minutes_per_day)) {
          ocrMinutes = result.minutes;
          minutesPerDay = result.minutes_per_day;
        } else if (result.manual_review_required) {
          setProcessError('לא הצלחנו לקרוא את הצילום — ההורה יוכל לעדכן ידנית.');
          mock = true;
          ocrMinutes = fallbackOcrMinutes;
        } else {
          mock = true;
          ocrMinutes = fallbackOcrMinutes;
        }
      } catch {
        mock = true;
        ocrMinutes = fallbackOcrMinutes;
        setProcessError('במצב טסט — משתמשים בנתוני דוגמה לחישוב.');
      }

      setUsedMockOcr(mock);
      const next = computeRedemptionSettlement(weeklyBudget, hourlyRate, {
        minutes: ocrMinutes,
        minutes_per_day: minutesPerDay,
      });
      setSettlement(next);
      setStep('results');

      // Push pending upload so parent redemption card can confirm.
      if (onSubmitForParentApproval && next.remainingAmount > 0) {
        setUploadPending(true);
        try {
          await onSubmitForParentApproval(buildResult(next, dataUrl, mock));
        } catch {
          setProcessError('שגיאה בשליחה להורה. נסו שוב.');
        } finally {
          setUploadPending(false);
        }
      }
    } catch {
      setProcessError('שגיאה בעיבוד התמונה. נסו שוב.');
      setStep('preview');
    }
  }, [
    uploadedImage,
    fallbackOcrMinutes,
    weeklyBudget,
    hourlyRate,
    onSubmitForParentApproval,
    buildResult,
  ]);

  const finish = useCallback(() => {
    if (!settlement) return;
    onComplete(
      buildResult(settlement, screenshotDataUrl, usedMockOcr, choice ?? undefined)
    );
    setStep('done');
  }, [settlement, onComplete, buildResult, screenshotDataUrl, usedMockOcr, choice]);

  const footer = useMemo(() => {
    switch (step) {
      case 'upload':
        return (
          <ChallengeGlowContinueButton
            enabled={!!uploadedImage}
            onClick={() => setStep('preview')}
            label="המשך לתצוגה מקדימה"
          />
        );
      case 'guide':
        return null;
      case 'preview':
        return (
          <ChallengeGlowContinueButton
            enabled
            onClick={runOcr}
            label="אישור וקריאת זמן מסך"
          />
        );
      case 'processing':
        return null;
      case 'results':
        return remaining > 0 ? (
          <ChallengeGlowContinueButton
            enabled={parentApprovalReady && !uploadPending}
            onClick={() => setStep('choice')}
            label={
              parentApprovalReady
                ? 'בואו נבחר מה עושים'
                : uploadPending
                  ? 'שולחים להורה...'
                  : `מחכים ש${parentLabel} יאשרו...`
            }
          />
        ) : (
          <ChallengeGlowContinueButton enabled onClick={finish} label="הבנתי" />
        );
      case 'choice':
        return (
          <ChallengeGlowContinueButton
            enabled={!!choice}
            onClick={finish}
            label="סימון הבחירה"
          />
        );
      case 'done':
        return null;
    }
  }, [
    step,
    uploadedImage,
    remaining,
    choice,
    finish,
    runOcr,
    parentApprovalReady,
    parentLabel,
    uploadPending,
  ]);

  return (
    <DashboardBlurCardOverlay
      visible={visible}
      titleId={titleId}
      footer={footer}
      onClose={step === 'guide' ? undefined : onClose}
      onBack={step === 'guide' ? () => setStep('upload') : undefined}
      compact
    >
      {step === 'guide' && <ChallengeScreenshotGuide titleId={titleId} />}

      {step === 'upload' && (
        <>
          <ChallengeEyebrow>בדיקת השבוע</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>צילום מסך של זמן מסך</ChallengeTitle>
          <ChallengeBody>
            <button
              type="button"
              onClick={() => setStep('guide')}
              className="font-simpler text-[14px] font-semibold text-[#00E7A2] underline"
            >
              מה לצלם?
            </button>
          </ChallengeBody>

          <div className="flex w-full flex-col gap-2">
            <p className="text-center font-simpler text-[13px] font-semibold text-white/70">
              מי מעלה?
            </p>
            <div
              className="grid w-full grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="מי מעלה את צילום המסך"
            >
              {(
                [
                  { id: 'child' as const, label: `${childName} מעלה` },
                  { id: 'parent' as const, label: 'הורה מעלה' },
                ] as const
              ).map((opt) => (
                <div key={opt.id} className="h-[52px] [&>button]:h-full">
                  <SelectableOptionCard
                    selected={uploadedBy === opt.id}
                    onSelect={() => setUploadedBy(opt.id)}
                    borderRadius={16}
                    paddingX={10}
                    paddingY={8}
                    textLayout="flex"
                    textAlign="center"
                    borderTone="white"
                    showSelectedGlow
                    compactGlow
                  >
                    <span className="font-simpler text-[12px] font-bold leading-[14px] text-white">
                      {opt.label}
                    </span>
                  </SelectableOptionCard>
                </div>
              ))}
            </div>
          </div>

          <ChallengeBody>
            מעלים את הצילום ואנחנו מסכמים את זמן המסך וכמה כסף נשאר בארנק
          </ChallengeBody>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <ChallengeUploadPickButton
            hasFile={!!uploadedImage}
            label={uploadedImage ? uploadedImage.name : 'בחירת צילום מסך'}
            onClick={() => fileInputRef.current?.click()}
          />
        </>
      )}

      {step === 'preview' && imagePreview && (
        <>
          <ChallengeEyebrow>תצוגה מקדימה</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>זה הצילום הנכון?</ChallengeTitle>
          <div className="relative max-h-[200px] w-full overflow-hidden rounded-[12px] bg-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="תצוגה מקדימה של צילום מסך"
              className="max-h-[200px] w-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={goBackToUpload}
            className="font-simpler text-[13px] font-semibold text-[#00E7A2] underline"
          >
            החלפת תמונה
          </button>
        </>
      )}

      {step === 'processing' && (
        <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-6 rounded-[16px] bg-white/5 px-4 py-6 outline outline-1 outline-white/15">
          <ChallengeTitle id={titleId}>קוראים את זמן המסך</ChallengeTitle>
          <div className="h-px w-full bg-white/10" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SIGNUP_CHILD_INVITE_WAITING_LOGO}
            alt=""
            className="shrink-0 object-cover"
            style={{
              width: SIGNUP_CHILD_INVITE_WAITING_LOGO_PX,
              height: SIGNUP_CHILD_INVITE_WAITING_LOGO_PX,
            }}
            decoding="async"
          />
        </div>
      )}

      {step === 'results' && settlement && (
        <>
          <ChallengeTitle id={titleId}>
            {remaining > 0 ? `נשאר לך ₪${formatNumber(remaining)}` : 'הארנק ריק השבוע'}
          </ChallengeTitle>

          <RedemptionOutcomeHero remainingAmount={remaining} childName={childName} />
          <RedemptionCalcBreakdown settlement={settlement} />

          {processError ? (
            <p className="text-center font-simpler text-[12px] leading-[17px] text-amber-200/80">
              {processError}
            </p>
          ) : null}
        </>
      )}

      {step === 'choice' && settlement && remaining > 0 && (
        <>
          <ChallengeEyebrow>בחירה עם ההורה</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>
            מה עושים עם ₪{formatNumber(remaining)}?
          </ChallengeTitle>
          <ChallengeBody>הבחירה בפועל היא פנים אל פנים — כאן רק מסמנים אותה.</ChallengeBody>
          <div className="flex w-full flex-col gap-2">
            {V03_REDEMPTION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setChoice(opt.id)}
                className={`rounded-[16px] px-4 py-3 text-center font-simpler text-[16px] font-bold ${
                  choice === opt.id
                    ? 'bg-[#00FFB3] text-[#092125]'
                    : 'bg-white/5 text-white outline outline-1 outline-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'done' && (
        <div className="flex w-full flex-col items-center gap-4 py-2">
          <ChallengeTitle id={titleId}>
            {remaining > 0 ? `${childName}, הצלחת!` : 'המשך לנסות בשבוע הבא'}
          </ChallengeTitle>
          {remaining > 0 ? (
            <video
              src={V03_REDEMPTION_CELEBRATE_VIDEO}
              autoPlay
              muted
              playsInline
              loop
              className="object-contain"
              style={{
                width: V03_CHALLENGE_SETUP_LAYOUT.redemptionCelebrateVideo.width,
                height: V03_CHALLENGE_SETUP_LAYOUT.redemptionCelebrateVideo.height,
              }}
              aria-hidden
            />
          ) : null}
        </div>
      )}
    </DashboardBlurCardOverlay>
  );
}
