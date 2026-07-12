'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardFigmaBackground, DashboardBottomGlows } from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardEnter } from '@/components/dashboard/DashboardEnter';
import { DashboardScreenTimeRing } from '@/components/dashboard/DashboardScreenTimeRing';
import { DashboardSavingsCard } from '@/components/dashboard/DashboardSavingsCard';
import { DashboardContractSection } from '@/components/dashboard/DashboardContractSection';
import { ChildDashboardNonPaidOverlay } from '@/components/dashboard/ChildDashboardNonPaidOverlay';
import {
  ChildChallengeSetupOverlay,
  type ChildChallengeSetupResult,
} from '@/components/dashboard/challenge/ChildChallengeSetupOverlay';
import {
  ChildRedemptionOverlay,
  type ChildRedemptionFlowResult,
} from '@/components/dashboard/challenge/ChildRedemptionOverlay';
import {
  DashboardChildCompanion,
  DashboardChildGreeting,
  DashboardChildStartCta,
  DashboardConversionBar,
} from '@/components/dashboard/DashboardChildSections';
import {
  CHILD_DASHBOARD_ASSETS,
  CHILD_DASHBOARD_LAYOUT,
} from '@/constants/child-dashboard-layout';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';
import {
  persistChildChallengeAccept,
  persistChildRedemptionUpload,
} from '@/lib/challenge/v03ChallengeFirestore';
import {
  canOpenChildChallengeSetup,
  canOpenChildRedemption,
  deriveHourlyRate,
  deriveWeeklyBudget,
  getRedemptionCountdownTarget,
  isChildDealSetupComplete,
  isParentChallengeSet,
  isV03DealLive,
  parentLabelFromGender,
} from '@/lib/challenge/v03DashboardChallenge';
import type { DashboardState } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatting';

type ChildDashboardScreenProps = {
  dashboardData: DashboardState;
  shareUrl?: string;
  noChallengeExists: boolean;
  challengeEnabled: boolean;
  onRefresh: () => Promise<void>;
  /** Present when opened via ?token= or parent session (optional UI hint). */
  accessMode?: 'token' | 'parent';
};

function parentDisplayName(parent: DashboardState['parent']): string {
  return parentLabelFromGender(parent.gender);
}

function parentWalletHeadline(parent: DashboardState['parent']): string {
  const label = parentDisplayName(parent);
  const verb = parent.gender === 'female' ? 'תפתח' : 'יפתח';
  return `מחכים ש${label} ${verb} גישה לארנק`;
}

export function ChildDashboardScreen({
  dashboardData,
  shareUrl,
  noChallengeExists,
  challengeEnabled,
  onRefresh,
  accessMode: _accessMode,
}: ChildDashboardScreenProps) {
  const childName = dashboardData.child.name || 'יואב';
  const parentLabel = parentDisplayName(dashboardData.parent);
  const gateHeadline = parentWalletHeadline(dashboardData.parent);
  const weeklyEarned = dashboardData.weeklyTotals?.coinsEarned ?? 0;

  const { challenge, child, challengeNotStarted } = dashboardData;
  const [gateVisible, setGateVisible] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [redemptionOpenOverlay, setRedemptionOpenOverlay] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const weeklyBudget = deriveWeeklyBudget(challenge);
  const hourlyRate = deriveHourlyRate(challenge);
  const childDealComplete = isChildDealSetupComplete(child, challenge);
  const parentChallengeSet = isParentChallengeSet(challenge, noChallengeExists);
  const dealLive = isV03DealLive(challengeEnabled, challenge, child, challengeNotStarted);
  const parentDealPending = challengeEnabled && parentChallengeSet && !childDealComplete;
  const redemptionOpen = canOpenChildRedemption(
    challengeEnabled,
    challenge,
    child,
    null,
    new Date(now)
  );
  const waitingForNextChallenge =
    challengeEnabled && !dealLive && !parentDealPending && !redemptionOpen;

  const ctaLabel = !challengeEnabled
    ? 'הגדרת הדיל הראשון בארנק שלי'
    : redemptionOpen
      ? 'לסיכום הדיל השבועי'
      : 'הדיל השבועי';

  const ctaEnabled = challengeEnabled
    ? parentChallengeSet &&
      (parentDealPending ||
        redemptionOpen ||
        canOpenChildChallengeSetup(
          challengeEnabled,
          challenge,
          child,
          noChallengeExists,
          challengeNotStarted
        ))
    : true;

  const showCta =
    !challengeEnabled ||
    !dealLive ||
    redemptionOpen ||
    parentDealPending ||
    waitingForNextChallenge;

  const walletBalance = dealLive ? weeklyBudget : weeklyEarned;
  const walletLocked = !challengeEnabled || (!dealLive && !parentDealPending);
  const cardRaised = parentDealPending;

  const countdownStart = challenge.startDate ? new Date(challenge.startDate) : null;
  const countdownTarget = getRedemptionCountdownTarget(challenge.startDate);
  const showCountdown = Boolean(
    challengeEnabled && dealLive && countdownTarget && countdownStart
  );
  const ringAvgMinutes =
    dashboardData.lastWeeklyAvgMinutes ??
    (typeof child.baselineDailyMinutes === 'number' ? child.baselineDailyMinutes : 0);

  // Flip redemption CTA when countdown hits zero without requiring a refresh.
  useEffect(() => {
    if (!countdownTarget || !dealLive) return;
    const remaining = countdownTarget.getTime() - Date.now();
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setNow(Date.now()), remaining + 50);
    return () => window.clearTimeout(id);
  }, [countdownTarget, dealLive]);

  // Parent set the deal, child hasn't confirmed — show setup on every load.
  useEffect(() => {
    if (parentDealPending) setSetupOpen(true);
  }, [parentDealPending]);

  const handleStartCta = () => {
    if (!challengeEnabled) {
      setGateVisible(true);
      return;
    }
    if (!ctaEnabled) return;

    if (redemptionOpen) {
      setRedemptionOpenOverlay(true);
      return;
    }
    if (
      canOpenChildChallengeSetup(
        challengeEnabled,
        challenge,
        child,
        noChallengeExists,
        challengeNotStarted
      )
    ) {
      setSetupOpen(true);
    }
  };

  const handleSetupSubmit = useCallback(
    async (result: ChildChallengeSetupResult) => {
      if (!dashboardData.parent.id) return;
      const { ensureChildForParent } = await import('@/lib/api/children');
      const childId =
        child.id || (await ensureChildForParent(dashboardData.parent.id)).id;
      await persistChildChallengeAccept(dashboardData.parent.id, childId, result);
      await onRefresh();
    },
    [dashboardData.parent.id, child.id, onRefresh]
  );

  const handleRedemptionAwaitParent = useCallback(
    async (result: ChildRedemptionFlowResult) => {
      const challengeId = dashboardData.activeChallengeId;
      if (!challengeId || !dashboardData.parent.id) return;
      await persistChildRedemptionUpload(dashboardData.parent.id, challengeId, result);
    },
    [dashboardData.activeChallengeId, dashboardData.parent.id]
  );

  const handleRedemptionComplete = useCallback(
    async (_result: ChildRedemptionFlowResult) => {
      setRedemptionOpenOverlay(false);
      await onRefresh();
    },
    [onRefresh]
  );

  const conversionMoneyLabel = useMemo(
    () => (dealLive ? `${formatNumber(hourlyRate, 1)} ₪` : undefined),
    [dealLive, hourlyRate]
  );

  return (
    <div
      className="absolute inset-0 flex h-full w-full min-w-0 max-w-none flex-col overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      dir="rtl"
    >
      <DashboardFigmaBackground showBottomGlows={false} />
      <DashboardEnter variant="fade" index={0} className="absolute inset-x-0 top-0 z-20">
        <DashboardTopBar balance={walletBalance} menuSlot={<DashboardHeaderMenu />} />
      </DashboardEnter>

      <div className="absolute inset-0 overflow-x-hidden overflow-y-auto v03-scroll-hidden">
        <div className="relative min-h-full w-full max-w-[100vw] overflow-x-hidden pb-10">
          <DashboardBottomGlows />
          <DashboardEnter variant="fade" index={1} className="pointer-events-none absolute inset-0 z-[1]">
            <DashboardChildCompanion src={CHILD_DASHBOARD_ASSETS.companion} />
          </DashboardEnter>

          <DashboardEnter
            variant="frame"
            index={0}
            className="relative z-[2] mx-auto flex w-full max-w-full flex-col items-center"
          >
            <div
              className="flex w-full max-w-full flex-col items-center"
              style={{
                width: CHILD_DASHBOARD_LAYOUT.contentWidth,
                maxWidth: '100%',
                gap: CHILD_DASHBOARD_LAYOUT.contentGap,
                paddingTop: CHILD_DASHBOARD_LAYOUT.contentTop,
              }}
            >
              <DashboardEnter index={1} className="w-full">
                <div
                  className={`relative w-full transition-transform duration-500 ease-out ${
                    cardRaised ? '-translate-y-3' : ''
                  }`}
                >
                  <DashboardSavingsCard
                    balance={walletBalance}
                    dimmed={walletLocked}
                    variant="child"
                  />
                </div>
              </DashboardEnter>

              <div
                className="flex w-full flex-col items-center"
                style={{ gap: CHILD_DASHBOARD_LAYOUT.frame2Gap }}
              >
                <DashboardEnter index={2} className="w-full">
                  <DashboardChildGreeting childName={childName} showWalletTeaser={!dealLive} />
                </DashboardEnter>
                {showCta ? (
                  <DashboardEnter index={3} className="w-full">
                    <DashboardChildStartCta
                      onClick={handleStartCta}
                      label={ctaLabel}
                      disabled={!ctaEnabled}
                    />
                  </DashboardEnter>
                ) : null}

                <DashboardEnter index={4} className="w-full">
                  <DashboardConversionBar
                    savedMinutes={dealLive ? 60 : 0}
                    balance={dealLive ? hourlyRate : weeklyEarned}
                    moneyLabel={conversionMoneyLabel}
                  />
                </DashboardEnter>

                <DashboardEnter index={5}>
                  <DashboardScreenTimeRing
                    variant="child"
                    dimmed={!challengeEnabled || walletLocked}
                    countdownTarget={showCountdown ? countdownTarget : null}
                    countdownStart={showCountdown ? countdownStart : null}
                    hasGoal={false}
                    savedMinutes={showCountdown ? 0 : ringAvgMinutes}
                    goalMinutes={60}
                  />
                </DashboardEnter>
              </div>

              <DashboardEnter index={6} className="w-full">
                <DashboardContractSection
                  childName={childName}
                  parentName={parentLabel}
                  shareUrl={shareUrl || '#'}
                  variant="child"
                />
              </DashboardEnter>
            </div>
          </DashboardEnter>
        </div>
      </div>

      <ChildDashboardNonPaidOverlay
        visible={gateVisible}
        headline={gateHeadline}
        onDismiss={() => setGateVisible(false)}
      />

      <ChildChallengeSetupOverlay
        visible={setupOpen}
        childName={childName}
        parentLabel={parentLabel}
        weeklyBudget={weeklyBudget}
        hourlyRate={hourlyRate}
        onClose={() => setSetupOpen(false)}
        onSubmit={handleSetupSubmit}
      />

      <ChildRedemptionOverlay
        visible={redemptionOpenOverlay}
        childName={childName}
        parentLabel={parentLabel}
        weeklyBudget={weeklyBudget}
        hourlyRate={hourlyRate}
        challengeId={dashboardData.activeChallengeId}
        onClose={() => setRedemptionOpenOverlay(false)}
        onSubmitForParentApproval={handleRedemptionAwaitParent}
        onComplete={handleRedemptionComplete}
      />
    </div>
  );
}
