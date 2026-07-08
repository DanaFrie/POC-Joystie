'use client';

import { useState } from 'react';
import {
  DashboardBlurCardOverlay,
  OverlayPrimaryButton,
  OverlaySecondaryButton,
} from '@/components/dashboard/challenge/DashboardBlurCardOverlay';
import { V03_MONEY_GOAL_OPTIONS } from '@/constants/v03-challenge';
import { formatNumber } from '@/utils/formatting';

export type ChildChallengeSetupResult = {
  moneyGoals: string[];
};

type ChildChallengeSetupOverlayProps = {
  visible: boolean;
  childName: string;
  parentLabel: string;
  weeklyBudget: number;
  hourlyRate: number;
  onClose: () => void;
  onSubmit: (result: ChildChallengeSetupResult) => void;
};

type ChildSetupStep = 'summary' | 'goals';

/**
 * Child challenge accept — summary of parent deal, then money-goal pick (v0.2 goals, v0.3 card).
 */
export function ChildChallengeSetupOverlay({
  visible,
  childName,
  parentLabel,
  weeklyBudget,
  hourlyRate,
  onClose,
  onSubmit,
}: ChildChallengeSetupOverlayProps) {
  const [step, setStep] = useState<ChildSetupStep>('summary');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const titleId = 'child-challenge-setup-title';

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const footer =
    step === 'summary' ? (
      <div className="flex w-full flex-col gap-2">
        <OverlayPrimaryButton onClick={() => setStep('goals')}>הבנתי, בוחרים מטרה</OverlayPrimaryButton>
        <OverlaySecondaryButton onClick={onClose}>סגור</OverlaySecondaryButton>
      </div>
    ) : (
      <div className="flex w-full flex-col gap-2">
        <OverlayPrimaryButton
          disabled={selectedGoals.length === 0}
          onClick={() => onSubmit({ moneyGoals: selectedGoals })}
        >
          מתחילים את האתגר
        </OverlayPrimaryButton>
        <OverlaySecondaryButton onClick={() => setStep('summary')}>חזרה</OverlaySecondaryButton>
      </div>
    );

  return (
    <DashboardBlurCardOverlay visible={visible} titleId={titleId} footer={footer} compact>
      {step === 'summary' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold leading-[18px] text-[#00E7A2]">
            הדיל עם {parentLabel}
          </p>
          <h2
            id={titleId}
            className="w-full text-center font-simpler text-[26px] font-black leading-[30px] text-white"
          >
            היי {childName} — הכסף כבר על הכרטיס
          </h2>
          <div className="flex w-full flex-col gap-3 rounded-[16px] bg-white/5 px-4 py-4 outline outline-1 outline-white/15">
            <SummaryRow label="נטען לכרטיס" value={`₪${formatNumber(weeklyBudget, 0)}`} />
            <SummaryRow label="שעת מסך עולה" value={`₪${formatNumber(hourlyRate, 0)}`} />
          </div>
          <p className="text-center font-simpler text-[14px] leading-[20px] text-white/75">
            כל שעת מסך יורדת מהכרטיס. ככל שתשמרו על פחות זמן מסך — יישאר יותר לפדיון בסוף השבוע
            (אחרי צילום מסך).
          </p>
        </>
      )}

      {step === 'goals' && (
        <>
          <p className="w-full text-center font-simpler text-[14px] font-semibold leading-[18px] text-[#00E7A2]">
            מטרות לכסף
          </p>
          <h2
            id={titleId}
            className="w-full text-center font-simpler text-[24px] font-black leading-[28px] text-white"
          >
            למה כדאי לחסוך?
          </h2>
          <div className="grid w-full grid-cols-2 gap-2">
            {V03_MONEY_GOAL_OPTIONS.map((option) => {
              const selected = selectedGoals.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleGoal(option.id)}
                  className={`relative rounded-[14px] px-2 py-3 text-center font-simpler text-[13px] font-bold leading-[16px] transition ${
                    selected
                      ? 'bg-[#00FFB3] text-[#092125] outline outline-[1.5px] outline-[#00FFB3]'
                      : 'bg-white/5 text-white outline outline-1 outline-white/20 hover:outline-white/40'
                  }`}
                >
                  {option.label}
                  {selected && (
                    <span className="absolute left-1.5 top-1 text-[12px]" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </DashboardBlurCardOverlay>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-3" dir="rtl">
      <span className="font-simpler text-[14px] text-white/70">{label}</span>
      <span className="font-simpler text-[18px] font-black text-white">{value}</span>
    </div>
  );
}
