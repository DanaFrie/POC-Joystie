'use client';

import { useMemo, useState } from 'react';
import {
  DashboardBlurCardOverlay,
  OverlayPrimaryButton,
  OverlaySecondaryButton,
} from '@/components/dashboard/challenge/DashboardBlurCardOverlay';
import { BudgetStepper } from '@/components/dashboard/challenge/BudgetStepper';
import { ChallengeConversionRateControl } from '@/components/dashboard/challenge/ChallengeConversionRateControl';
import {
  V03_CHALLENGE_BUDGET,
  V03_CHALLENGE_HOURLY_RATE,
} from '@/constants/v03-challenge';
import {
  challengeStartDateFromSetup,
  projectedRemainingAtEstimatedUsage,
  redemptionOpenDateFromStart,
  roundMoney,
  weeklyHourAllowance,
} from '@/lib/challenge/v03ChallengeMath';
import { formatNumber } from '@/utils/formatting';

export type ParentChallengeSetupResult = {
  weeklyBudget: number;
  hourlyRate: number;
  estimatedDailyHours: number;
  projectedRemaining: number;
  startDateIso: string;
  redemptionOpenIso: string;
};

type ParentChallengeSetupOverlayProps = {
  visible: boolean;
  childName: string;
  /** Estimated daily screen hours — last challenge average, or onboarding. */
  estimatedDailyHours: number;
  onClose: () => void;
  onSubmit: (result: ParentChallengeSetupResult) => void;
};

type SetupStep = 'preview' | 'budget' | 'rate' | 'note';

function formatHeDate(d: Date): string {
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
}

/**
 * Parent challenge setup — paid state card on blurred dashboard.
 * Steps: preview → budget → ₪/hour → savings note → submit.
 */
export function ParentChallengeSetupOverlay({
  visible,
  childName,
  estimatedDailyHours,
  onClose,
  onSubmit,
}: ParentChallengeSetupOverlayProps) {
  const [step, setStep] = useState<SetupStep>('preview');
  const [weeklyBudget, setWeeklyBudget] = useState<number>(V03_CHALLENGE_BUDGET.default);
  const [hourlyRate, setHourlyRate] = useState<number>(V03_CHALLENGE_HOURLY_RATE.default);

  const projected = useMemo(
    () =>
      roundMoney(
        projectedRemainingAtEstimatedUsage({
          weeklyBudget,
          hourlyRate,
          estimatedDailyHours,
        })
      ),
    [weeklyBudget, hourlyRate, estimatedDailyHours]
  );

  const allowanceHours = roundMoney(weeklyHourAllowance(weeklyBudget, hourlyRate), 1);
  const startDate = challengeStartDateFromSetup();
  const redemptionOpen = redemptionOpenDateFromStart(startDate);

  const titleId = 'parent-challenge-setup-title';

  const handleSubmit = () => {
    onSubmit({
      weeklyBudget,
      hourlyRate,
      estimatedDailyHours,
      projectedRemaining: projected,
      startDateIso: startDate.toISOString(),
      redemptionOpenIso: redemptionOpen.toISOString(),
    });
  };

  const footer = (() => {
    switch (step) {
      case 'preview':
        return (
          <div className="flex w-full flex-col gap-2">
            <OverlayPrimaryButton onClick={() => setStep('budget')}>המשך</OverlayPrimaryButton>
            <OverlaySecondaryButton onClick={onClose}>סגור</OverlaySecondaryButton>
          </div>
        );
      case 'budget':
        return (
          <div className="flex w-full flex-col gap-2">
            <OverlayPrimaryButton onClick={() => setStep('rate')}>המשך</OverlayPrimaryButton>
            <OverlaySecondaryButton onClick={() => setStep('preview')}>חזרה</OverlaySecondaryButton>
          </div>
        );
      case 'rate':
        return (
          <div className="flex w-full flex-col gap-2">
            <OverlayPrimaryButton onClick={() => setStep('note')}>המשך</OverlayPrimaryButton>
            <OverlaySecondaryButton onClick={() => setStep('budget')}>חזרה</OverlaySecondaryButton>
          </div>
        );
      case 'note':
        return (
          <div className="flex w-full flex-col gap-2">
            <OverlayPrimaryButton onClick={handleSubmit}>טעינת כרטיס והתחלת אתגר</OverlayPrimaryButton>
            <OverlaySecondaryButton onClick={() => setStep('rate')}>חזרה</OverlaySecondaryButton>
          </div>
        );
    }
  })();

  return (
    <DashboardBlurCardOverlay visible={visible} titleId={titleId} footer={footer} compact>
      {step === 'preview' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold leading-[18px] text-[#00E7A2]">
            הגדרת אתגר מסך
          </p>
          <h2
            id={titleId}
            className="w-full text-center font-simpler text-[26px] font-black leading-[30px] tracking-[-0.4px] text-white"
          >
            טוענים כסף לכרטיס של {childName}
          </h2>
          <div className="flex w-full flex-col gap-3 text-center font-simpler text-[15px] font-normal leading-[22px] text-white/80">
            <p>
              הכסף על הכרטיס וירטואלי — אין ארנק אמיתי. בסוף השבוע תפדו יחד, פנים אל פנים.
            </p>
            <p>
              כל שעת מסך יורדת מהכרטיס. ככל ש{childName} יחסוך זמן מסך — יישאר יותר לפדיון.
            </p>
            <p>
              האתגר: 6 ימים מ־{formatHeDate(startDate)}. פדיון מה־{formatHeDate(redemptionOpen)}{' '}
              ואילך (צילום מסך שבועי).
            </p>
          </div>
        </>
      )}

      {step === 'budget' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold leading-[18px] text-[#00E7A2]">
            תקציב שבועי
          </p>
          <h2
            id={titleId}
            className="w-full text-center font-simpler text-[26px] font-black leading-[30px] text-white"
          >
            כמה טוענים לכרטיס?
          </h2>
          <BudgetStepper
            value={weeklyBudget}
            min={V03_CHALLENGE_BUDGET.min}
            max={V03_CHALLENGE_BUDGET.max}
            step={V03_CHALLENGE_BUDGET.step}
            onChange={setWeeklyBudget}
          />
          <p className="text-center font-simpler text-[14px] text-white/60">₪ לתקציב השבועי</p>
        </>
      )}

      {step === 'rate' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold leading-[18px] text-[#00E7A2]">
            המרת זמן־כסף
          </p>
          <h2
            id={titleId}
            className="w-full text-center font-simpler text-[24px] font-black leading-[28px] text-white"
          >
            מחיר שעת מסך
          </h2>
          <ChallengeConversionRateControl
            minutes={60}
            hourlyRate={hourlyRate}
            onHourlyRateChange={setHourlyRate}
            minRate={V03_CHALLENGE_HOURLY_RATE.min}
            maxRate={V03_CHALLENGE_HOURLY_RATE.max}
          />
          <p className="text-center font-simpler text-[13px] leading-[18px] text-white/55">
            עם ₪{formatNumber(weeklyBudget, 0)} ו־₪{formatNumber(hourlyRate, 0)} לשעה — יש על הכרטיס
            כ־{formatNumber(allowanceHours)} שעות מסך לשבוע.
          </p>
        </>
      )}

      {step === 'note' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold leading-[18px] text-[#00E7A2]">
            הערכת חסכון
          </p>
          <h2
            id={titleId}
            className="w-full text-center font-simpler text-[24px] font-black leading-[28px] text-white"
          >
            כמה יכול להישאר על הכרטיס?
          </h2>
          <div className="flex w-full flex-col gap-3 rounded-[16px] bg-white/5 px-4 py-4 outline outline-1 outline-white/15">
            <Row label="תקציב שבועי" value={`₪${formatNumber(weeklyBudget, 0)}`} />
            <Row label="₪ / שעת מסך" value={`₪${formatNumber(hourlyRate, 0)}`} />
            <Row
              label="ממוצע יומי משוער"
              value={`${formatNumber(estimatedDailyHours)} שע׳`}
            />
            <div className="h-px w-full bg-white/10" />
            <Row
              label="צפי יתרה אחרי 6 ימים"
              value={`₪${formatNumber(projected)}`}
              emphasize
            />
          </div>
          <p className="text-center font-simpler text-[13px] leading-[18px] text-white/55">
            לפי ממוצע יומי מאונבורדינג / אתגר קודם. אם {childName} יוריד זמן מסך — יישאר יותר.
            המימוש אחרי צילום מסך שבועי.
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
      <span
        className={`font-simpler text-[14px] ${
          emphasize ? 'font-bold text-[#00E7A2]' : 'font-normal text-white/70'
        }`}
      >
        {label}
      </span>
      <span
        className={`font-simpler text-[16px] ${
          emphasize ? 'font-black text-white' : 'font-bold text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
