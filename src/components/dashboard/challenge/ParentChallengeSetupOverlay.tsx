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
  remainingOnCard,
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
  /** First-ever deal — show onboarding estimate + onboarding-based savings copy. */
  isFirstDeal?: boolean;
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
  isFirstDeal = true,
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

  /** Hours that empty the wallet at the current rate (weekly total). */
  const hoursUntilEmpty =
    hourlyRate > 0 ? roundMoney(weeklyBudget / hourlyRate, 1) : 0;

  /** Example daily usage for the savings line — onboarding (first) or 2h/day (return). */
  const exampleDailyHours = isFirstDeal
    ? roundMoney(Math.max(0, estimatedDailyHours), 1)
    : 2;
  const exampleWeeklyHours = roundMoney(exampleDailyHours * V03_CHALLENGE_DAYS, 1);
  const exampleSaveAmount = roundMoney(
    remainingOnCard(weeklyBudget, exampleWeeklyHours, hourlyRate)
  );

  const beOnScreen = childGender === 'girl' ? 'תהיה' : 'יהיה';
  const pronoun = childGender === 'girl' ? 'היא' : 'הוא';
  const canBe = childGender === 'girl' ? 'יכולה' : 'יכול';
  const possessive = childGender === 'girl' ? 'שלה' : 'שלו';

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

          {isFirstDeal ? (
            <ChallengeBody>
              {`הערכת את זמן המסך בכ־${formatNumber(exampleDailyHours)} שעות ביום.`}
            </ChallengeBody>
          ) : null}

          <div className="flex w-full flex-col items-center gap-4">
            <p className="w-full text-right font-simpler text-[15px] font-bold text-white" dir="rtl">
              הדיל שאתה מציע:
            </p>

            <div className="flex w-full flex-col items-center gap-2">
              <p className="text-center font-simpler text-[13px] font-semibold text-white/70">
                דמי כיס לארנק
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
                שקלים לשעת מסך
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
          </div>

          <div
            className="flex w-full flex-col gap-3 rounded-[16px] bg-white/5 px-4 py-4 text-right outline outline-1 outline-white/15"
            dir="rtl"
          >
            <ChallengeBody>
              {isFirstDeal
                ? `כמה זמן ${childName} ${beOnScreen} במסך — ${formatNumber(exampleDailyHours)} שעות ביום ותחסוך ${formatNumber(exampleSaveAmount)} ש״ח או יותר.`
                : `במידה ו${childName} ${beOnScreen} במסך — שעתיים ביום במסך ותחסוך ${formatNumber(exampleSaveAmount)} ש״ח או יותר.`}
            </ChallengeBody>
            <ChallengeBody>
              {`${pronoun} גם ${canBe} להיות ${formatNumber(hoursUntilEmpty)} שעות ולהישאר בלי דמי כיס השבוע, הבחירה ${possessive}, שבוע הבא שבוע חדש.`}
            </ChallengeBody>
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

