'use client';

import { useState } from 'react';
import { ChallengeTestShell } from '@/components/dashboard/challenge/ChallengeTestShell';
import {
  ChildChallengeSetupOverlay,
  type ChildChallengeSetupResult,
} from '@/components/dashboard/challenge/ChildChallengeSetupOverlay';
import { CHALLENGE_TEST_DEFAULTS } from '@/lib/challenge/challengeTestFixtures';
import { formatNumber } from '@/utils/formatting';

/**
 * UI test — child challenge summary + goals on blurred child dashboard.
 * Route: /dashboard/child/challenge/test
 */
export default function ChildChallengeSetupTestPage() {
  const [open, setOpen] = useState(true);
  const [lastResult, setLastResult] = useState<ChildChallengeSetupResult | null>(null);
  const childName = 'יואב';
  const { weeklyBudget, hourlyRate, estimatedDailyHours } = CHALLENGE_TEST_DEFAULTS;

  return (
    <ChallengeTestShell
      title="TEST · אישור דיל (ילד)"
      subtitle="/dashboard/child/challenge/test"
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
            פתיחת הדיל
          </button>
          <p className="text-center font-simpler text-[13px] text-white/60">
            דמי כיס: ₪{formatNumber(weeklyBudget, 0)} · ₪{formatNumber(hourlyRate, 0)} כסף לשעה מהארנק
          </p>
        </div>
      )}

      <ChildChallengeSetupOverlay
        visible={open}
        childName={childName}
        parentLabel="אמא"
        weeklyBudget={weeklyBudget}
        hourlyRate={hourlyRate}
        onClose={() => setOpen(false)}
        onSubmit={(result) => {
          setLastResult(result);
          setOpen(false);
        }}
      />
    </ChallengeTestShell>
  );
}
