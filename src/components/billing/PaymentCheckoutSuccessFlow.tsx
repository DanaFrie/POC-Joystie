'use client';

import { useEffect, useState } from 'react';
import { ChallengeTestShell } from '@/components/dashboard/challenge/ChallengeTestShell';
import {
  ParentChallengeSetupOverlay,
  type ParentChallengeSetupResult,
} from '@/components/dashboard/challenge/ParentChallengeSetupOverlay';
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import {
  V03_CHALLENGE_SETUP_ASSETS,
  V03_CHALLENGE_SETUP_LAYOUT,
} from '@/constants/v03-challenge-layout';
import {
  CHALLENGE_TEST_DEFAULTS,
} from '@/lib/challenge/challengeTestFixtures';

type PaymentCheckoutSuccessFlowProps = {
  childName?: string;
  /** Wait for Firestore `trialing` before opening challenge card. */
  subscriptionReady: boolean;
  subscriptionLoading: boolean;
};

/**
 * Post-checkout success — confetti over challenge setup card.
 * Shown after Cardcom redirect while webhook may still be in flight.
 */
export function PaymentCheckoutSuccessFlow({
  childName = 'יואב',
  subscriptionReady,
  subscriptionLoading,
}: PaymentCheckoutSuccessFlowProps) {
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastResult, setLastResult] = useState<ParentChallengeSetupResult | null>(null);
  const estimatedDailyHours = CHALLENGE_TEST_DEFAULTS.estimatedDailyHours;

  useEffect(() => {
    if (!subscriptionReady) return;
    setChallengeOpen(true);
    setShowConfetti(true);
    const timer = window.setTimeout(
      () => setShowConfetti(false),
      V03_CHALLENGE_SETUP_LAYOUT.celebrationMs
    );
    return () => window.clearTimeout(timer);
  }, [subscriptionReady]);

  const waiting = subscriptionLoading || !subscriptionReady;

  return (
    <ChallengeTestShell
      title="תשלום הצליח"
      subtitle="/dashboard/subscription/pay/success"
      childName={childName}
      averageMinutes={Math.round(estimatedDailyHours * 60)}
      dimmed={!waiting}
    >
      {waiting ? (
        <OnboardingWaitingScreenShell zIndex={55} ariaBusy staticLayout>
          <OnboardingWaitingCenterContent
            headline="מאמתים את התשלום"
            ariaLabel="מאמתים את התשלום"
          />
        </OnboardingWaitingScreenShell>
      ) : null}

      {showConfetti ? (
        <div
          className="pointer-events-none absolute inset-0 z-[65] flex items-start justify-center pt-[72px]"
          aria-hidden
        >
          <div
            style={{
              width: V03_CHALLENGE_SETUP_LAYOUT.confettiSize,
              height: V03_CHALLENGE_SETUP_LAYOUT.confettiSize,
            }}
          >
            <ChildCastleConfetti
              src={V03_CHALLENGE_SETUP_ASSETS.confetti}
              className="size-full"
            />
          </div>
        </div>
      ) : null}

      {!waiting && !challengeOpen && lastResult ? (
        <div className="absolute inset-0 z-[55] flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-center font-simpler text-[18px] font-bold text-white">
            הדיל נשמר — אפשר להמשיך לדשבורד
          </p>
          <pre className="max-h-[40vh] w-full max-w-sm overflow-auto rounded-2xl bg-black/50 p-4 font-mono text-[11px] text-[#00FFB3]">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      ) : null}

      <ParentChallengeSetupOverlay
        visible={challengeOpen}
        childName={childName}
        estimatedDailyHours={estimatedDailyHours}
        onClose={() => setChallengeOpen(false)}
        onSubmit={(result) => {
          setLastResult(result);
          setChallengeOpen(false);
        }}
      />
    </ChallengeTestShell>
  );
}
