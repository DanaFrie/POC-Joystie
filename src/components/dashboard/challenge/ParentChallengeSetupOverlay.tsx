'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChallengeBody,
  ChallengeCardHero,
  ChallengeEyebrow,
  ChallengeTitle,
} from '@/components/dashboard/challenge/ChallengeCardPrimitives';
import {
  DashboardBlurCardOverlay,
  OverlayPrimaryButton,
} from '@/components/dashboard/challenge/DashboardBlurCardOverlay';
import { BudgetStepper } from '@/components/dashboard/challenge/BudgetStepper';
import { ChallengeParentDealSentCard } from '@/components/dashboard/challenge/ChallengeParentDealSentCard';
import {
  V03_CHALLENGE_BUDGET,
  V03_CHALLENGE_HOURLY_RATE,
} from '@/constants/v03-challenge';
import {
  V03_CHALLENGE_SETUP_ASSETS,
  V03_CHALLENGE_SETUP_LAYOUT,
} from '@/constants/v03-challenge-layout';
import {
  challengeStartDateFromSetup,
  projectedRemainingAtEstimatedUsage,
  redemptionOpenDateFromStart,
  roundMoney,
  V03_CHALLENGE_DAYS,
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
  childGender?: 'boy' | 'girl';
  estimatedDailyHours: number;
  onClose: () => void;
  onSubmit: (result: ParentChallengeSetupResult) => void;
};

type SetupStep = 'intro' | 'configure' | 'sent';

function formatHeDate(d: Date): string {
  const weekday = d.toLocaleDateString('he-IL', { weekday: 'long' });
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = String(d.getFullYear()).slice(-2);
  return `${weekday} ${day}/${month}/${year}`;
}

/**
 * Parent challenge setup — intro → live configure (budget + rate + savings) → sent summary.
 */
export function ParentChallengeSetupOverlay({
  visible,
  childName,
  childGender = 'boy',
  estimatedDailyHours,
  onClose,
  onSubmit,
}: ParentChallengeSetupOverlayProps) {
  const [step, setStep] = useState<SetupStep>('intro');
  const [weeklyBudget, setWeeklyBudget] = useState<number>(V03_CHALLENGE_BUDGET.default);
  const [hourlyRate, setHourlyRate] = useState<number>(V03_CHALLENGE_HOURLY_RATE.default);

  useEffect(() => {
    if (!visible) return;
    setStep('intro');
    setWeeklyBudget(V03_CHALLENGE_BUDGET.default);
    setHourlyRate(V03_CHALLENGE_HOURLY_RATE.default);
  }, [visible]);

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

  const estimatedWeeklyHours = roundMoney(estimatedDailyHours * V03_CHALLENGE_DAYS, 1);

  const startDate = challengeStartDateFromSetup();
  const redemptionOpen = redemptionOpenDateFromStart(startDate);
  const titleId = 'parent-challenge-setup-title';

  const handleConfirmSend = () => {
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
      case 'intro':
        return (
          <OverlayPrimaryButton onClick={() => setStep('configure')}>
            בואו נגדיר את השבוע
          </OverlayPrimaryButton>
        );
      case 'configure':
        return (
          <OverlayPrimaryButton onClick={() => setStep('sent')}>
            שליחה ל{childName}
          </OverlayPrimaryButton>
        );
      case 'sent':
        return (
          <OverlayPrimaryButton onClick={handleConfirmSend}>מעולה, נתחיל!</OverlayPrimaryButton>
        );
    }
  })();

  return (
    <DashboardBlurCardOverlay
      visible={visible}
      titleId={titleId}
      footer={footer}
      onClose={onClose}
      compact
    >
      {step === 'intro' && (
        <>
          <ChallengeCardHero
            src={V03_CHALLENGE_SETUP_ASSETS.parentHero}
            frameWidth={V03_CHALLENGE_SETUP_LAYOUT.parentHero.width}
            frameHeight={V03_CHALLENGE_SETUP_LAYOUT.parentHero.height}
          />
          <ChallengeEyebrow>הדיל השבועי</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>
            בואו נטען את דמי הכיס של {childName} לארנק
          </ChallengeTitle>
          <div className="flex w-full flex-col gap-3">
            <ChallengeBody>
              בשלב הבא תגדירו את הדיל:
            </ChallengeBody>
            <ul
              className="w-full list-disc space-y-1 pr-5 text-right font-simpler text-[15px] leading-[22px] text-white/85 marker:text-white/60"
              dir="rtl"
            >
              <li>כמה דמי כיס נטענים לארנק?</li>
              <li>כמה כסף שווה כל שימוש בשעת מסך?</li>
            </ul>
            <ChallengeBody>
              ככל ש{childName} {childGender === 'girl' ? 'תשמור' : 'ישמור'} על פחות זמן מסך, יישאר
              יותר כסף בארנק. זה העיקרון שעוזר לבחור בחוכמה.
            </ChallengeBody>
            <ChallengeBody>
              הארנק וירטואלי, בסוף השבוע מעלים צילום מסך של גרף השימוש במסך ובוחרים יחד מה לעשות
              עם הכסף שנשאר בארנק.
            </ChallengeBody>
          </div>
        </>
      )}

      {step === 'configure' && (
        <>
          <ChallengeEyebrow>הגדרת הדיל</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>שחקו עם המספרים</ChallengeTitle>
          <ChallengeBody>
            קבעו כמה דמי כיס נכנסים לארנק וכמה כסף צפוי להישאר בו בסוף השבוע.
          </ChallengeBody>

          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-center font-simpler text-[13px] font-semibold text-white/70">
              התאימו את דמי הכיס השבועיים
            </p>
            <BudgetStepper
              value={weeklyBudget}
              min={V03_CHALLENGE_BUDGET.min}
              max={V03_CHALLENGE_BUDGET.max}
              step={V03_CHALLENGE_BUDGET.step}
              onChange={setWeeklyBudget}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-center font-simpler text-[13px] font-semibold text-white/70">
              עלות שעת מסך
            </p>
            <BudgetStepper
              value={hourlyRate}
              min={V03_CHALLENGE_HOURLY_RATE.min}
              max={V03_CHALLENGE_HOURLY_RATE.max}
              step={V03_CHALLENGE_HOURLY_RATE.step}
              decimals={1}
              onChange={setHourlyRate}
            />
          </div>

          <div className="flex w-full flex-col gap-2 rounded-[16px] bg-white/5 px-4 py-4 outline outline-1 outline-white/15">
            <Row
              label="שעות שבועיות על פי הערכה שלך"
              value={`~${formatNumber(estimatedWeeklyHours)} שע׳`}
            />
            <div className="h-px w-full bg-white/10" />
            <Row
              label={`כמה כסף יישמר ל${childName}?`}
              value={`₪${formatNumber(projected)}`}
              emphasize
            />
          </div>
        </>
      )}

      {step === 'sent' && (
        <>
          <ChallengeCardHero
            src={V03_CHALLENGE_SETUP_ASSETS.parentSentHero}
            frameWidth={V03_CHALLENGE_SETUP_LAYOUT.parentSentHero.width}
            frameHeight={V03_CHALLENGE_SETUP_LAYOUT.parentSentHero.height}
          />
          <ChallengeEyebrow>נשלח ל{childName}</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>השבוע עומד להתחיל!</ChallengeTitle>

          <ChallengeParentDealSentCard
            childName={childName}
            childGender={childGender}
            weeklyBudget={weeklyBudget}
            hourlyRate={hourlyRate}
            startDateLabel={formatHeDate(startDate)}
          />
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
          emphasize ? 'font-bold text-white' : 'font-normal text-white/70'
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
