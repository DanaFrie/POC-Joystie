'use client';

import { useEffect, useState } from 'react';
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
import { ChallengeDealSummaryCard } from '@/components/dashboard/challenge/ChallengeDealSummary';
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
  redemptionOpenDateFromStart,
  remainingOnCard,
  roundMoney,
  V03_CHALLENGE_DAYS,
} from '@/lib/challenge/v03ChallengeMath';
import { formatHebrewHoursLabel, formatNumber } from '@/utils/formatting';

/** Default target screentime = 30% less than estimation (70% of baseline). */
const DEFAULT_TARGET_RATIO = 0.7;
const TARGET_HOURS_STEP = 0.5;
const TARGET_HOURS_MIN = 0.5;

/** Auto-dismiss sent summary after submit confirmation UI. */
const SENT_AUTO_DISMISS_MS = 15_000;

function defaultTargetDailyHours(estimatedDailyHours: number): number {
  const baseline = Math.max(0, estimatedDailyHours);
  if (baseline <= 0) return 1;
  const raw = baseline * DEFAULT_TARGET_RATIO;
  const stepped = Math.round(raw / TARGET_HOURS_STEP) * TARGET_HOURS_STEP;
  return Math.max(TARGET_HOURS_MIN, roundMoney(stepped, 1));
}

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
  /** Parent gender for את/אתה copy. */
  parentGender?: 'male' | 'female';
  estimatedDailyHours: number;
  onClose: () => void;
  onSubmit: (result: ParentChallengeSetupResult) => void;
};

type SetupStep = 'intro' | 'explain' | 'configure' | 'sent';

/** Weekday only — strip leading «יום» so copy can say «ביום ראשון». */
function hebrewWeekdayLabel(d: Date): string {
  return d.toLocaleDateString('he-IL', { weekday: 'long' }).replace(/^יום\s+/, '');
}

/**
 * Parent challenge setup — intro → explain → configure → sent (auto-dismiss 15s).
 */
export function ParentChallengeSetupOverlay({
  visible,
  childName,
  childGender = 'boy',
  parentGender = 'female',
  estimatedDailyHours,
  onClose,
  onSubmit,
}: ParentChallengeSetupOverlayProps) {
  const [step, setStep] = useState<SetupStep>('intro');
  const [weeklyBudget, setWeeklyBudget] = useState<number>(V03_CHALLENGE_BUDGET.default);
  const [hourlyRate, setHourlyRate] = useState<number>(V03_CHALLENGE_HOURLY_RATE.default);
  const [targetDailyHours, setTargetDailyHours] = useState<number>(() =>
    defaultTargetDailyHours(estimatedDailyHours)
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setStep('intro');
    setWeeklyBudget(V03_CHALLENGE_BUDGET.default);
    setHourlyRate(V03_CHALLENGE_HOURLY_RATE.default);
    setTargetDailyHours(defaultTargetDailyHours(estimatedDailyHours));
    setSubmitted(false);
  }, [visible, estimatedDailyHours]);

  const isMother = parentGender === 'female';
  const isGirl = childGender === 'girl';
  /** Singular parent address. */
  const you = isMother ? 'את' : 'אתה';
  const defining = isMother ? 'מגדירה' : 'מגדיר';
  const setting = isMother ? 'קובעת' : 'קובע';
  /** Parent-facing plural — always masculine (אתם / בוחרים). */
  const youPluralParents = 'אתם';
  /** Parent + child together — feminine only if mother + daughter. */
  const dyadFeminine = isMother && isGirl;
  const youPluralDyad = dyadFeminine ? 'אתן' : 'אתם';
  const meeting = dyadFeminine ? 'נפגשות' : 'נפגשים';
  const uploading = dyadFeminine ? 'מעלות' : 'מעלים';

  const keepVerb = isGirl ? 'תשמור' : 'ישמור';
  const beOnScreen = isGirl ? 'תהיה' : 'יהיה';

  const baselineDaily = roundMoney(Math.max(0, estimatedDailyHours), 1);
  const targetHoursMax = Math.max(
    TARGET_HOURS_MIN,
    roundMoney(Math.max(baselineDaily * 1.5, baselineDaily || 4), 1)
  );
  const targetWeeklyHours = roundMoney(targetDailyHours * V03_CHALLENGE_DAYS, 1);
  const exampleSaveAmount = roundMoney(
    remainingOnCard(weeklyBudget, targetWeeklyHours, hourlyRate)
  );
  const targetHoursLabel = formatHebrewHoursLabel(targetDailyHours);
  const baselineHoursLabel = formatHebrewHoursLabel(baselineDaily);

  const startDate = challengeStartDateFromSetup();
  const redemptionOpen = redemptionOpenDateFromStart(startDate);
  const redemptionWeekdayLabel = hebrewWeekdayLabel(redemptionOpen);
  const titleId = 'parent-challenge-setup-title';

  const handleConfirmSend = () => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit({
      weeklyBudget,
      hourlyRate,
      estimatedDailyHours,
      projectedRemaining: exampleSaveAmount,
      startDateIso: startDate.toISOString(),
      redemptionOpenIso: redemptionOpen.toISOString(),
    });
  };

  useEffect(() => {
    if (step !== 'sent') return;
    handleConfirmSend();
    const id = window.setTimeout(() => {
      onClose();
    }, SENT_AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on enter sent
  }, [step]);

  const footer = (() => {
    switch (step) {
      case 'intro':
        return (
          <OverlayPrimaryButton onClick={() => setStep('explain')}>
            המשך
          </OverlayPrimaryButton>
        );
      case 'explain':
        return (
          <OverlayPrimaryButton onClick={() => setStep('configure')}>
            בואו נגדיר את הדיל השבוע
          </OverlayPrimaryButton>
        );
      case 'configure':
        return (
          <OverlayPrimaryButton onClick={() => setStep('sent')}>
            אישור ושליחה ל{childName}
          </OverlayPrimaryButton>
        );
      case 'sent':
        return null;
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
            בואו נטען את דמי הכיס לארנק, {you} {defining} את הדיל
          </ChallengeTitle>
          <ul
            className="w-full list-disc space-y-1 pr-5 text-right font-simpler text-[15px] leading-[22px] text-white/85 marker:text-white/60"
            dir="rtl"
          >
            <li>
              כמה דמי כיס {youPluralParents} טוענים ל{childName} לארנק?
            </li>
            <li>
              מה העלות של כל שימוש בשעת מסך? {you} {setting}!
            </li>
          </ul>
        </>
      )}

      {step === 'explain' && (
        <>
          <ChallengeEyebrow>הדיל השבועי</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>איך זה עובד?</ChallengeTitle>
          <div className="flex w-full flex-col gap-3">
            <ChallengeBody>
              ככל ש{childName} {keepVerb} על פחות זמן מסך, יישאר יותר כסף בארנק…
            </ChallengeBody>
            <ChallengeBody>
              הארנק מדמה את הכסף שנטען ל{childName} בתחילת השבוע
            </ChallengeBody>
            <ChallengeBody>
              לאחר 6 ימים, ביום השביעי {youPluralDyad} {meeting} ו{uploading}{' '}
              צילום מסך מ-Family Link / Screen Time של גרף השימוש השבועי
            </ChallengeBody>
            <ChallengeBody>
              בוחרים יחד מה לעשות עם הכסף שנשאר, ואז {childName} פודה מכם את הכסף
              :)
            </ChallengeBody>
          </div>
        </>
      )}

      {step === 'configure' && (
        <>
          <ChallengeEyebrow>הגדרת הדיל</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>שחקו עם המספרים</ChallengeTitle>

          {estimatedDailyHours > 0 ? (
            <ChallengeBody>
              {`הערכת את זמן המסך של ${childName} בכ-${baselineHoursLabel}`}
            </ChallengeBody>
          ) : null}

          <div className="flex w-full flex-col items-center gap-4">
            <div className="flex w-full flex-col items-center gap-2">
              <p className="text-center font-simpler text-[13px] font-semibold text-white/70">
                {`כמה זמן מסך ${youPluralParents} רוצים ל${childName}?`}
              </p>
              <BudgetStepper
                value={targetDailyHours}
                min={TARGET_HOURS_MIN}
                max={targetHoursMax}
                step={TARGET_HOURS_STEP}
                decimals={1}
                prefix=""
                suffix="ש'"
                rtlValue
                onChange={setTargetDailyHours}
              />
            </div>

            <div className="flex w-full flex-col items-center gap-2">
              <p className="text-center font-simpler text-[13px] font-semibold text-white/70">
                דמי כיס השבוע
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
          </div>

          <ChallengeDealSummaryCard>
            <ChallengeBody>
              {`אם ${childName} ${beOnScreen} במסך כ־${targetHoursLabel} ביום, יישאר בארנק כ־${formatNumber(exampleSaveAmount)} ש״ח.`}
            </ChallengeBody>
          </ChallengeDealSummaryCard>
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
          <ChallengeTitle id={titleId}>השבוע מתחיל מחר!</ChallengeTitle>

          <ChallengeParentDealSentCard
            childName={childName}
            childGender={childGender}
            weeklyBudget={weeklyBudget}
            hourlyRate={hourlyRate}
            redemptionWeekdayLabel={redemptionWeekdayLabel}
          />
        </>
      )}
    </DashboardBlurCardOverlay>
  );
}
