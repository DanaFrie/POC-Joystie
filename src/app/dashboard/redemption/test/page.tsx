'use client';

import { useState } from 'react';
import { ChallengeTestShell } from '@/components/dashboard/challenge/ChallengeTestShell';
import {
  ParentRedemptionConfirmOverlay,
  type ParentRedemptionConfirmResult,
} from '@/components/dashboard/challenge/ParentRedemptionConfirmOverlay';
import { CHALLENGE_TEST_DEFAULTS } from '@/lib/challenge/challengeTestFixtures';
import { PLACEHOLDER_CHILD } from '@/constants/placeholder-child';
import { formatNumber } from '@/utils/formatting';

/**
 * UI test — parent redemption confirmation (6-day hours sum, no graphs).
 * Route: /dashboard/redemption/test
 */
export default function ParentRedemptionConfirmTestPage() {
  const [open, setOpen] = useState(true);
  const [lastResult, setLastResult] = useState<ParentRedemptionConfirmResult | null>(null);
  const childName = PLACEHOLDER_CHILD.name;
  const { weeklyBudget, hourlyRate, estimatedDailyHours, ocrTotalMinutes } =
    CHALLENGE_TEST_DEFAULTS;
  const initialHours = ocrTotalMinutes / 60;

  return (
    <ChallengeTestShell
      title="TEST · אישור בדיקת שבוע (הורה)"
      subtitle="/dashboard/redemption/test"
      childName={childName}
      averageMinutes={Math.round(estimatedDailyHours * 60)}
    >
      {!open && (
        <div className="absolute inset-0 z-[55] flex flex-col items-center justify-center gap-4 px-6">
          {lastResult ? (
            <pre className="max-h-[40vh] w-full max-w-sm overflow-auto rounded-2xl bg-black/50 p-4 font-mono text-[11px] text-[#00FFB3]">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-[22px] bg-[#00FFB3] px-8 py-3 font-simpler text-[16px] font-bold text-[#092125]"
          >
            פתיחת אישור בדיקת השבוע
          </button>
          {lastResult ? (
            <p className="text-center font-simpler text-[13px] text-white/60">
              אושר: {formatNumber(lastResult.totalScreenHours)} שע׳ → ₪
              {formatNumber(lastResult.redeemAmount)}
            </p>
          ) : null}
        </div>
      )}

      <ParentRedemptionConfirmOverlay
        visible={open}
        childName={childName}
        weeklyBudget={weeklyBudget}
        hourlyRate={hourlyRate}
        initialTotalHours={initialHours}
        onClose={() => setOpen(false)}
        onConfirm={(result) => {
          setLastResult(result);
          setOpen(false);
        }}
      />
    </ChallengeTestShell>
  );
}
