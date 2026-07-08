'use client';

import { useMemo, useState } from 'react';
import {
  DashboardBlurCardOverlay,
  OverlayPrimaryButton,
  OverlaySecondaryButton,
} from '@/components/dashboard/challenge/DashboardBlurCardOverlay';
import { HoursStepper } from '@/components/dashboard/challenge/HoursStepper';
import { remainingOnCard, roundMoney } from '@/lib/challenge/v03ChallengeMath';
import { formatNumber } from '@/utils/formatting';

export type ParentRedemptionConfirmResult = {
  totalScreenHours: number;
  redeemAmount: number;
};

type ParentRedemptionConfirmOverlayProps = {
  visible: boolean;
  childName: string;
  weeklyBudget: number;
  hourlyRate: number;
  /** Hours from OCR (sum of 6 days). Editable manually. */
  initialTotalHours: number;
  onClose: () => void;
  onConfirm: (result: ParentRedemptionConfirmResult) => void;
};

/**
 * Parent redemption confirmation — total 6-day hours (manual override) + redeem amount.
 * No graphs.
 */
export function ParentRedemptionConfirmOverlay({
  visible,
  childName,
  weeklyBudget,
  hourlyRate,
  initialTotalHours,
  onClose,
  onConfirm,
}: ParentRedemptionConfirmOverlayProps) {
  const [totalHours, setTotalHours] = useState(() => roundMoney(initialTotalHours, 1));
  const titleId = 'parent-redemption-confirm-title';

  const redeemAmount = useMemo(
    () => roundMoney(remainingOnCard(weeklyBudget, totalHours, hourlyRate)),
    [weeklyBudget, totalHours, hourlyRate]
  );

  return (
    <DashboardBlurCardOverlay
      visible={visible}
      titleId={titleId}
      compact
      footer={
        <div className="flex w-full flex-col gap-2">
          <OverlayPrimaryButton
            onClick={() =>
              onConfirm({
                totalScreenHours: totalHours,
                redeemAmount,
              })
            }
          >
            אישור פדיון ₪{formatNumber(redeemAmount)}
          </OverlayPrimaryButton>
          <OverlaySecondaryButton onClick={onClose}>סגור</OverlaySecondaryButton>
        </div>
      }
    >
      <p className="w-full text-center font-simpler text-[14px] font-semibold text-[#00E7A2]">
        אישור פדיון
      </p>
      <h2 id={titleId} className="w-full text-center font-simpler text-[24px] font-black text-white">
        סיכום 6 הימים של {childName}
      </h2>

      <div className="flex w-full flex-col items-center gap-2">
        <p className="text-center font-simpler text-[14px] text-white/70">
          סה״כ שעות מסך (ניתן לערוך ידנית)
        </p>
        <HoursStepper valueHours={totalHours} onChange={setTotalHours} />
        <p className="text-center font-simpler text-[14px] text-white/60">שעות · 6 ימים</p>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-[16px] bg-white/5 px-4 py-4 outline outline-1 outline-white/15">
        <Row label="נטען לכרטיס" value={`₪${formatNumber(weeklyBudget, 0)}`} />
        <Row label="₪ / שעת מסך" value={`₪${formatNumber(hourlyRate, 0)}`} />
        <Row
          label="יורד מהכרטיס"
          value={`₪${formatNumber(roundMoney(totalHours * hourlyRate))}`}
        />
        <div className="h-px w-full bg-white/10" />
        <Row label="סכום לפדיון" value={`₪${formatNumber(redeemAmount)}`} emphasize />
      </div>

      <p className="text-center font-simpler text-[13px] leading-[18px] text-white/55">
        המימוש בפועל הוא פנים אל פנים עם {childName}. אחרי אישור אפשר לפתוח אתגר חדש.
      </p>
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
          emphasize ? 'font-bold text-[#00E7A2]' : 'text-white/70'
        }`}
      >
        {label}
      </span>
      <span className="font-simpler text-[16px] font-black text-white">{value}</span>
    </div>
  );
}
