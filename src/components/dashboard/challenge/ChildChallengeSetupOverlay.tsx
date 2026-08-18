'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChallengeBody,
  ChallengeCardHero,
  ChallengeEyebrow,
  ChallengeTitle,
} from '@/components/dashboard/challenge/ChallengeCardPrimitives';
import { ChallengeGlowContinueButton } from '@/components/dashboard/challenge/ChallengeGlowContinueButton';
import { ChallengeCollapsibleGoalsList } from '@/components/dashboard/challenge/ChallengeCollapsibleGoalsList';
import { ChallengeDealWalletPreview } from '@/components/dashboard/challenge/ChallengeDealWalletPreview';
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import {
  DashboardBlurCardOverlay,
} from '@/components/dashboard/challenge/DashboardBlurCardOverlay';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { V03_MONEY_GOAL_OPTIONS } from '@/constants/v03-challenge';
import {
  V03_CHALLENGE_SETUP_ASSETS,
  V03_CHALLENGE_SETUP_LAYOUT,
  V03_REDEMPTION_CELEBRATE_VIDEO,
} from '@/constants/v03-challenge-layout';

export type ChildChallengeSetupResult = {
  moneyGoals: string[];
  customGoal?: string;
};

type ChildChallengeSetupOverlayProps = {
  visible: boolean;
  childName: string;
  parentLabel: string;
  childGender?: 'boy' | 'girl';
  weeklyBudget: number;
  hourlyRate: number;
  onClose: () => void;
  onSubmit: (result: ChildChallengeSetupResult) => void;
};

type ChildSetupStep = 'goals' | 'deal' | 'celebrate';

export function ChildChallengeSetupOverlay({
  visible,
  childName,
  parentLabel,
  childGender = 'boy',
  weeklyBudget,
  hourlyRate,
  onClose,
  onSubmit,
}: ChildChallengeSetupOverlayProps) {
  const [step, setStep] = useState<ChildSetupStep>('goals');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoalText, setCustomGoalText] = useState('');
  const [goalsListOpen, setGoalsListOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const titleId = 'child-challenge-setup-title';
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setExiting(false);
      setShowConfetti(false);
      submittedRef.current = false;
      return;
    }
    setStep('goals');
    setSelectedGoals([]);
    setCustomGoalText('');
    setGoalsListOpen(false);
    setExiting(false);
    setShowConfetti(false);
    submittedRef.current = false;
  }, [visible]);

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleConfirmDeal = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const trimmedCustom = customGoalText.trim();
    onSubmit({
      moneyGoals: selectedGoals,
      customGoal: trimmedCustom || undefined,
    });
    setStep('celebrate');
    setShowConfetti(true);
  }, [customGoalText, selectedGoals, onSubmit]);

  useEffect(() => {
    if (step !== 'celebrate') return;
    const fadeTimer = window.setTimeout(() => {
      setShowConfetti(false);
      setExiting(true);
    }, V03_CHALLENGE_SETUP_LAYOUT.celebrationMs);
    return () => window.clearTimeout(fadeTimer);
  }, [step]);

  const handleExitComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  const hasGoals = selectedGoals.length > 0 || customGoalText.trim().length > 0;

  const goalChipLabels: string[] = [
    ...selectedGoals.flatMap((id) => {
      const label = V03_MONEY_GOAL_OPTIONS.find((o) => o.id === id)?.label;
      return label ? [label] : [];
    }),
    ...(customGoalText.trim() ? [customGoalText.trim()] : []),
  ];

  const footer =
    step === 'goals' ? (
      <ChallengeGlowContinueButton
        enabled={hasGoals}
        onClick={() => setStep('deal')}
        label="המשך לדיל"
      />
    ) : step === 'deal' ? (
      <ChallengeGlowContinueButton enabled onClick={handleConfirmDeal} label="בואו נתחיל!" />
    ) : null;

  const confettiSize = V03_CHALLENGE_SETUP_LAYOUT.confettiSize;

  return (
    <DashboardBlurCardOverlay
      visible={visible}
      titleId={titleId}
      footer={footer}
      onClose={step === 'celebrate' ? undefined : onClose}
      compact
      fillViewport={step === 'goals' && !goalsListOpen}
      exiting={exiting}
      onExitComplete={handleExitComplete}
    >
      {step === 'celebrate' && (
        <div className="relative flex min-h-[300px] w-full flex-col items-center justify-center gap-4 py-4">
          {showConfetti ? (
            <div
              className="pointer-events-none absolute left-1/2 top-0 z-0 flex -translate-x-1/2 items-start justify-center"
              style={{ width: confettiSize * 1.35, height: confettiSize }}
              aria-hidden
            >
              <ChildCastleConfetti
                src={CHILD_ONBOARDING_ASSETS.confettiPurple}
                className="absolute left-0 top-0 size-full max-w-[70%] object-contain"
              />
              <ChildCastleConfetti
                src={CHILD_ONBOARDING_ASSETS.confettiPurple}
                className="absolute right-0 top-2 size-full max-w-[70%] object-contain"
              />
            </div>
          ) : null}

          <div className="relative z-[1] flex w-full flex-col items-center gap-3">
            <ChallengeTitle id={titleId}>
              {childName}, אמרתי לך שאתה אלוף
            </ChallengeTitle>
            <ChallengeBody>אני אגיד לך את זה שוב!</ChallengeBody>

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
          </div>
        </div>
      )}

      {step === 'goals' && (
        <>
          <div className="flex w-full flex-col items-center gap-[15px]">
            <ChallengeCardHero
              src={V03_CHALLENGE_SETUP_ASSETS.childHero}
              frameWidth={V03_CHALLENGE_SETUP_LAYOUT.childHero.width}
              frameHeight={V03_CHALLENGE_SETUP_LAYOUT.childHero.height}
            />
            <ChallengeEyebrow>הפתעה טובה מ{parentLabel}</ChallengeEyebrow>
            <ChallengeTitle id={titleId}>
              {childName}, למה כדאי לשמור על הכסף בארנק השבוע?
            </ChallengeTitle>
            <ChallengeBody>
              {childGender === 'girl'
                ? 'בחרי מה הכי מתאים לך, ככה תזכרי למה שווה לשמור על דמי הכיס בארנק.'
                : 'בחר מה הכי מתאים לך, ככה תזכור למה שווה לשמור על דמי הכיס בארנק.'}
            </ChallengeBody>
          </div>

          <ChallengeCollapsibleGoalsList
            options={V03_MONEY_GOAL_OPTIONS}
            selectedIds={selectedGoals}
            onToggle={toggleGoal}
            expanded={goalsListOpen}
            onExpandedChange={setGoalsListOpen}
          />

          <div className="flex w-full flex-col gap-[15px]">
            <div className="flex w-full items-center gap-2 px-1">
              <div className="h-px flex-1 border-t border-dashed border-white/25" aria-hidden />
              <span className="shrink-0 font-simpler text-[12px] font-normal tracking-[0.12em] text-white/50">
                או
              </span>
              <div className="h-px flex-1 border-t border-dashed border-white/25" aria-hidden />
            </div>

            <textarea
              value={customGoalText}
              onChange={(event) => setCustomGoalText(event.target.value)}
              placeholder={childGender === 'girl' ? 'כתבי מטרה משלך…' : 'כתוב מטרה משלך…'}
              rows={3}
              dir="rtl"
              className="min-h-[80px] w-full resize-none rounded-[16px] border border-white bg-white/[0.05] px-3 py-3 text-right font-simpler text-[14px] font-normal leading-[20px] text-white placeholder:text-white/40 focus:outline-none focus:outline-offset-0"
              aria-label="מטרה חופשית"
            />
          </div>
        </>
      )}

      {step === 'deal' && (
        <>
          <ChallengeEyebrow>הדיל שלך</ChallengeEyebrow>
          <ChallengeTitle id={titleId}>דמי הכיס כבר בארנק שלך</ChallengeTitle>

          <ChallengeDealWalletPreview weeklyBudget={weeklyBudget} hourlyRate={hourlyRate} />

          <ChallengeBody>
            כל שעת מסך שווה כסף מתוך דמי הכיס שבארנק שלך.
            <br />
            פחות זמן מסך זה יותר כסף בארנק שתוכל לנצל בסוף השבוע.
          </ChallengeBody>

          {goalChipLabels.length > 0 ? (
            <div className="flex w-full flex-wrap justify-center gap-1.5">
              {goalChipLabels.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="rounded-full bg-white/10 px-3 py-1 font-simpler text-[12px] font-semibold text-white/90"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}
        </>
      )}
    </DashboardBlurCardOverlay>
  );
}
