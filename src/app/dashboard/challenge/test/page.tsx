'use client';

import { useState } from 'react';
import { ChallengeTestShell } from '@/components/dashboard/challenge/ChallengeTestShell';
import {
  ParentChallengeSetupOverlay,
  type ParentChallengeSetupResult,
} from '@/components/dashboard/challenge/ParentChallengeSetupOverlay';
import {
  CHALLENGE_TEST_DEFAULTS,
} from '@/lib/challenge/challengeTestFixtures';
import { formatNumber } from '@/utils/formatting';

/**
 * UI test — parent challenge setup card on blurred dashboard.
 * Route: /dashboard/challenge/test
 */
export default function ParentChallengeSetupTestPage() {
  const [open, setOpen] = useState(true);
  const [lastResult, setLastResult] = useState<ParentChallengeSetupResult | null>(null);
  const childName = 'יואב';
  const estimatedDailyHours = CHALLENGE_TEST_DEFAULTS.estimatedDailyHours;

  return (
    <ChallengeTestShell
      title="TEST · הגדרת דיל (הורה)"
      subtitle="/dashboard/challenge/test"
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
            פתיחת הגדרת הדיל
          </button>
          {lastResult ? (
            <p className="text-center font-simpler text-[13px] text-white/60">
              כמה כסף יישאר בארנק ₪{formatNumber(lastResult.projectedRemaining)} · דמי כיס ₪
              {formatNumber(lastResult.weeklyBudget, 0)}
            </p>
          ) : null}
        </div>
      )}

      <ParentChallengeSetupOverlay
        visible={open}
        childName={childName}
        estimatedDailyHours={estimatedDailyHours}
        onClose={() => setOpen(false)}
        onSubmit={(result) => {
          setLastResult(result);
          setOpen(false);
        }}
      />
    </ChallengeTestShell>
  );
}
