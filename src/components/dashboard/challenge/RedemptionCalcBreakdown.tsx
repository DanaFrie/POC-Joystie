'use client';

import {
  formatMinutesAsHours,
  REDEMPTION_CHALLENGE_DAYS_LABEL,
  type RedemptionSettlement,
} from '@/lib/challenge/redemptionOcr';
import { formatNumber } from '@/utils/formatting';

type RedemptionCalcBreakdownProps = {
  settlement: RedemptionSettlement;
  /** Child redemption — screen-time total only. */
  variant?: 'full' | 'screenTimeOnly';
};

export function RedemptionCalcBreakdown({
  settlement,
  variant = 'full',
}: RedemptionCalcBreakdownProps) {
  const {
    weeklyBudget,
    hourlyRate,
    totalMinutes,
    totalHours,
    burnedAmount,
    remainingAmount,
  } = settlement;

  if (variant === 'screenTimeOnly') {
    return (
      <div className="flex w-full flex-col gap-3 rounded-[16px] bg-white/5 px-4 py-4 outline outline-1 outline-white/15">
        <CalcRow
          label={`זמן מסך · ${REDEMPTION_CHALLENGE_DAYS_LABEL}`}
          value={formatMinutesAsHours(totalMinutes)}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-[16px] bg-white/5 px-4 py-4 outline outline-1 outline-white/15">
      <CalcRow label="דמי כיס בארנק" value={`₪${formatNumber(weeklyBudget, 0)}`} />
      <CalcRow
        label={`זמן מסך · ${REDEMPTION_CHALLENGE_DAYS_LABEL}`}
        value={formatMinutesAsHours(totalMinutes)}
      />
      <div className="h-px w-full bg-white/10" />
      <CalcRow
        label={`כסף מהארנק (₪${formatNumber(hourlyRate, 0)} × ${formatNumber(totalHours)} שע׳)`}
        value={`₪${formatNumber(burnedAmount)}`}
      />
      <CalcRow
        label="נשאר לך בארנק"
        value={`₪${formatNumber(remainingAmount)}`}
        emphasize
        accent={remainingAmount > 0}
      />
    </div>
  );
}

function CalcRow({
  label,
  value,
  emphasize,
  accent,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3" dir="rtl">
      <span
        className={`font-simpler text-[13px] ${
          emphasize ? 'font-bold text-white' : 'font-normal text-white/65'
        }`}
      >
        {label}
      </span>
      <span
        className={`font-simpler ${
          emphasize
            ? `text-[20px] font-black ${accent ? 'text-[#00FFB3]' : 'text-white/80'}`
            : 'text-[15px] font-bold text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
