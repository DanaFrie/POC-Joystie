'use client';

import { useMemo, useState } from 'react';
import {
  DashboardBlurCardOverlay,
  OverlayPrimaryButton,
  OverlaySecondaryButton,
} from '@/components/dashboard/challenge/DashboardBlurCardOverlay';
import { V03_REDEMPTION_OPTIONS, type V03RedemptionChoiceId } from '@/constants/v03-challenge';
import { remainingOnCard, roundMoney } from '@/lib/challenge/v03ChallengeMath';
import { formatNumber } from '@/utils/formatting';

export type ChildRedemptionFlowResult = {
  estimatedRemaining: number;
  uploadedBy: 'child' | 'parent';
  redemptionChoice: V03RedemptionChoiceId;
  totalScreenHoursEstimate: number;
};

type ChildRedemptionOverlayProps = {
  visible: boolean;
  childName: string;
  weeklyBudget: number;
  hourlyRate: number;
  /** Pre-filled OCR hours (mock on test route). */
  suggestedTotalHours?: number;
  onClose: () => void;
  onComplete: (result: ChildRedemptionFlowResult) => void;
};

type RedemptionStep =
  | 'estimate'
  | 'upload'
  | 'processing'
  | 'results'
  | 'choice'
  | 'done';

/**
 * Child redemption funnel — v0.2 steps, v0.3 card (loss-aversion remaining balance).
 * Screenshot OCR is mocked on the test route; real upload hooks later.
 */
export function ChildRedemptionOverlay({
  visible,
  childName,
  weeklyBudget,
  hourlyRate,
  suggestedTotalHours = 9,
  onClose,
  onComplete,
}: ChildRedemptionOverlayProps) {
  const [step, setStep] = useState<RedemptionStep>('estimate');
  const [estimatedHours, setEstimatedHours] = useState(suggestedTotalHours);
  const [uploadedBy, setUploadedBy] = useState<'child' | 'parent'>('child');
  const [choice, setChoice] = useState<V03RedemptionChoiceId | null>(null);
  const [ocrHours, setOcrHours] = useState(suggestedTotalHours);

  const estimatedRemaining = useMemo(
    () => roundMoney(remainingOnCard(weeklyBudget, estimatedHours, hourlyRate)),
    [weeklyBudget, estimatedHours, hourlyRate]
  );

  const ocrRemaining = useMemo(
    () => roundMoney(remainingOnCard(weeklyBudget, ocrHours, hourlyRate)),
    [weeklyBudget, ocrHours, hourlyRate]
  );

  const titleId = 'child-redemption-title';

  const runMockProcess = () => {
    setStep('processing');
    window.setTimeout(() => {
      setOcrHours(suggestedTotalHours);
      setStep('results');
    }, 1200);
  };

  const finish = () => {
    if (!choice) return;
    onComplete({
      estimatedRemaining,
      uploadedBy,
      redemptionChoice: choice,
      totalScreenHoursEstimate: ocrHours,
    });
    setStep('done');
  };

  const footer = (() => {
    switch (step) {
      case 'estimate':
        return (
          <div className="flex w-full flex-col gap-2">
            <OverlayPrimaryButton onClick={() => setStep('upload')}>המשך להעלאה</OverlayPrimaryButton>
            <OverlaySecondaryButton onClick={onClose}>סגור</OverlaySecondaryButton>
          </div>
        );
      case 'upload':
        return (
          <div className="flex w-full flex-col gap-2">
            <OverlayPrimaryButton onClick={runMockProcess}>אישור והמשך</OverlayPrimaryButton>
            <OverlaySecondaryButton onClick={() => setStep('estimate')}>חזרה</OverlaySecondaryButton>
          </div>
        );
      case 'processing':
        return (
          <p className="text-center font-simpler text-[14px] text-white/60">מעבדים את צילום המסך…</p>
        );
      case 'results':
        return (
          <div className="flex w-full flex-col gap-2">
            <OverlayPrimaryButton onClick={() => setStep('choice')}>
              ממתין לאישור הורה · המשך
            </OverlayPrimaryButton>
            <OverlaySecondaryButton onClick={() => setStep('upload')}>חזרה</OverlaySecondaryButton>
          </div>
        );
      case 'choice':
        return (
          <div className="flex w-full flex-col gap-2">
            <OverlayPrimaryButton disabled={!choice} onClick={finish}>
              סימון פדיון
            </OverlayPrimaryButton>
            <OverlaySecondaryButton onClick={() => setStep('results')}>חזרה</OverlaySecondaryButton>
          </div>
        );
      case 'done':
        return <OverlayPrimaryButton onClick={onClose}>חזרה ללוח</OverlayPrimaryButton>;
    }
  })();

  return (
    <DashboardBlurCardOverlay visible={visible} titleId={titleId} footer={footer} compact>
      {step === 'estimate' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold text-[#00E7A2]">
            פדיון שבועי
          </p>
          <h2 id={titleId} className="w-full text-center font-simpler text-[24px] font-black text-white">
            כמה נשאר על הכרטיס?
          </h2>
          <p className="text-center font-simpler text-[14px] text-white/70">
            הערכה לפני צילום המסך — סה״כ שעות מסך ב־6 הימים
          </p>
          <div className="flex w-full items-center justify-center gap-4" dir="ltr">
            <button
              type="button"
              className="flex size-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white"
              onClick={() => setEstimatedHours((h) => Math.min(48, roundMoney(h + 0.5, 1)))}
              aria-label="הוסף חצי שעה"
            >
              +
            </button>
            <span className="min-w-[5ch] text-center font-simpler text-[36px] font-black text-white">
              {formatNumber(estimatedHours)}
            </span>
            <button
              type="button"
              className="flex size-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white"
              onClick={() => setEstimatedHours((h) => Math.max(0, roundMoney(h - 0.5, 1)))}
              aria-label="הפחת חצי שעה"
            >
              −
            </button>
          </div>
          <p className="text-center font-simpler text-[14px] text-white/60">שעות מסך (סה״כ)</p>
          <p className="text-center font-simpler text-[20px] font-black text-[#00FFB3]">
            יתרה משוערת ₪{formatNumber(estimatedRemaining)}
          </p>
        </>
      )}

      {step === 'upload' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold text-[#00E7A2]">
            צילום מסך שבועי
          </p>
          <h2 id={titleId} className="w-full text-center font-simpler text-[24px] font-black text-white">
            מי מעלה את הצילום?
          </h2>
          <div className="flex w-full flex-col gap-2">
            {(
              [
                { id: 'child' as const, label: `${childName} מעלה` },
                { id: 'parent' as const, label: 'הורה מעלה' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setUploadedBy(opt.id)}
                className={`rounded-[16px] px-4 py-3 text-center font-simpler text-[16px] font-bold ${
                  uploadedBy === opt.id
                    ? 'bg-[#00FFB3] text-[#092125]'
                    : 'bg-white/5 text-white outline outline-1 outline-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex h-[120px] w-full items-center justify-center rounded-[16px] border border-dashed border-white/30 bg-white/5">
            <p className="px-4 text-center font-simpler text-[13px] text-white/55">
              (טסט) סימולציית העלאה — לחיצה על אישור תריץ OCR מדומה
            </p>
          </div>
        </>
      )}

      {step === 'processing' && (
        <>
          <h2 id={titleId} className="w-full text-center font-simpler text-[24px] font-black text-white">
            קוראים את זמן המסך…
          </h2>
          <div className="size-12 animate-pulse rounded-full bg-[#00FFB3]/40" />
        </>
      )}

      {step === 'results' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold text-[#00E7A2]">
            תוצאות השבוע
          </p>
          <h2 id={titleId} className="w-full text-center font-simpler text-[24px] font-black text-white">
            סיכום פריקה מהכרטיס
          </h2>
          <div className="flex w-full flex-col gap-3 rounded-[16px] bg-white/5 px-4 py-4 outline outline-1 outline-white/15">
            <Row label="סה״כ שעות מסך (6 ימים)" value={formatNumber(ocrHours)} />
            <Row label="נטען בתחילת השבוע" value={`₪${formatNumber(weeklyBudget, 0)}`} />
            <Row label="נותר לפדיון" value={`₪${formatNumber(ocrRemaining)}`} emphasize />
          </div>
          <p className="text-center font-simpler text-[13px] text-white/55">
            ההורה מאשר את הסכום בלוח הבקרה. אחרי אישור — בוחרים איך לפדות יחד.
          </p>
        </>
      )}

      {step === 'choice' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold text-[#00E7A2]">
            פדיון עם ההורה
          </p>
          <h2 id={titleId} className="w-full text-center font-simpler text-[24px] font-black text-white">
            איך לממש ₪{formatNumber(ocrRemaining)}?
          </h2>
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
        <>
          <h2 id={titleId} className="w-full text-center font-simpler text-[26px] font-black text-white">
            כל הכבוד, {childName}!
          </h2>
          <p className="text-center font-simpler text-[15px] text-white/75">
            הפדיון סומן. האתגר הבא ייפתח רק אחרי שההורה מאשר שהמימוש בוצע.
          </p>
        </>
      )}
    </DashboardBlurCardOverlay>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3" dir="rtl">
      <span className={`font-simpler text-[14px] ${emphasize ? 'font-bold text-[#00E7A2]' : 'text-white/70'}`}>
        {label}
      </span>
      <span className={`font-simpler text-[16px] font-black text-white`}>{value}</span>
    </div>
  );
}
