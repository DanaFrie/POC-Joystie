'use client';

import { useState } from 'react';
import { ChallengeTestShell } from '@/components/dashboard/challenge/ChallengeTestShell';
import {
  ChildRedemptionOverlay,
  type ChildRedemptionFlowResult,
} from '@/components/dashboard/challenge/ChildRedemptionOverlay';
import { CHALLENGE_TEST_DEFAULTS } from '@/lib/challenge/challengeTestFixtures';
import { formatNumber } from '@/utils/formatting';

/**
 * UI test — child weekly redemption funnel (v0.3 card).
 * Route: /dashboard/child/redemption/test
 */
export default function ChildRedemptionTestPage() {
  const [open, setOpen] = useState(true);
  const [lastResult, setLastResult] = useState<ChildRedemptionFlowResult | null>(null);
  const childName = 'יואב';
  const { weeklyBudget, hourlyRate, estimatedDailyHours, ocrTotalMinutes } =
    CHALLENGE_TEST_DEFAULTS;
  const suggestedHours = ocrTotalMinutes / 60;

  return (
    <ChallengeTestShell
      title="TEST · פדיון (ילד)"
      subtitle="/dashboard/child/redemption/test"
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
            פתיחת פדיון
          </button>
          <p className="text-center font-simpler text-[13px] text-white/60">
            תקציב ₪{formatNumber(weeklyBudget, 0)} · OCR מדומה {formatNumber(suggestedHours)} שע׳
          </p>
        </div>
      )}

      <ChildRedemptionOverlay
        visible={open}
        childName={childName}
        weeklyBudget={weeklyBudget}
        hourlyRate={hourlyRate}
        suggestedTotalHours={suggestedHours}
        onClose={() => setOpen(false)}
        onComplete={(result) => {
          setLastResult(result);
        }}
      />
    </ChallengeTestShell>
  );
}
