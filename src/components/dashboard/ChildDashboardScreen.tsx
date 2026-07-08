'use client';

import { useState } from 'react';
import { DashboardFigmaBackground, DashboardBottomGlows } from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardScreenTimeRing } from '@/components/dashboard/DashboardScreenTimeRing';
import { DashboardSavingsCard } from '@/components/dashboard/DashboardSavingsCard';
import { DashboardContractSection } from '@/components/dashboard/DashboardContractSection';
import { ChildDashboardNonPaidOverlay } from '@/components/dashboard/ChildDashboardNonPaidOverlay';
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
import type { DashboardState } from '@/types/dashboard';

type ChildDashboardScreenProps = {
  dashboardData: DashboardState;
  shareUrl?: string;
  noChallengeExists: boolean;
  /** When true, disappointed Dori card can be raised (e.g. on challenge CTA). Default true. */
  isNonPaidPlan?: boolean;
  /** Start with gate closed; open only when challenge CTA is tapped. */
  openGateOnMount?: boolean;
  onStartChallenge?: () => void;
};

function parentDisplayName(parent: DashboardState['parent']): string {
  if (parent.gender === 'female') return 'אמא';
  if (parent.gender === 'male') return 'אבא';
  return parent.name || 'אבא';
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
  isNonPaidPlan = true,
  openGateOnMount = false,
  onStartChallenge,
}: ChildDashboardScreenProps) {
  const childName = dashboardData.child.name || 'יואב';
  const parentName = parentDisplayName(dashboardData.parent);
  const gateHeadline = parentWalletHeadline(dashboardData.parent);
  const weeklyEarned = dashboardData.weeklyTotals?.coinsEarned ?? 0;

  const today = dashboardData.today;
  const goalHours = today?.screenTimeGoal ?? dashboardData.challenge.dailyScreenTimeGoal ?? 0;
  const usedHours = today?.screenTimeUsed ?? 0;
  const hasGoal = goalHours > 0;
  const savedMinutes = hasGoal ? Math.max(0, (goalHours - usedHours) * 60) : 0;
  const goalMinutes = hasGoal ? goalHours * 60 : 0;

  const walletLocked = noChallengeExists || !hasGoal;
  const showStartCta = noChallengeExists || Boolean(dashboardData.challengeNotStarted);

  const [gateVisible, setGateVisible] = useState(isNonPaidPlan && openGateOnMount);

  const handleStartCta = () => {
    if (isNonPaidPlan) {
      setGateVisible(true);
      return;
    }
    onStartChallenge?.();
  };

  return (
    <div
      className="absolute inset-0 flex h-full w-full min-w-0 max-w-none flex-col overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      dir="rtl"
    >
      <DashboardFigmaBackground showBottomGlows={false} />

      <DashboardTopBar balance={weeklyEarned} menuSlot={<DashboardHeaderMenu />} />

      <div className="absolute inset-0 overflow-x-hidden overflow-y-auto v03-scroll-hidden">
        <div className="relative min-h-full w-full max-w-[100vw] overflow-x-hidden pb-10">
          <DashboardBottomGlows />

          <DashboardChildCompanion src={CHILD_DASHBOARD_ASSETS.companion} />

          <div
            className="relative z-[2] mx-auto flex w-full max-w-full flex-col items-center"
            style={{
              width: CHILD_DASHBOARD_LAYOUT.contentWidth,
              maxWidth: '100%',
              gap: CHILD_DASHBOARD_LAYOUT.contentGap,
              paddingTop: CHILD_DASHBOARD_LAYOUT.contentTop,
            }}
          >
            {/* Frame 1 — savings card */}
            <div className="relative w-full">
              <DashboardSavingsCard
                balance={weeklyEarned}
                dimmed={walletLocked}
                variant="child"
              />
            </div>

            {/* Frame 2 — greeting / CTA / conversion, circle last */}
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: CHILD_DASHBOARD_LAYOUT.frame2Gap }}
            >
              <DashboardChildGreeting childName={childName} />

              {showStartCta && <DashboardChildStartCta onClick={handleStartCta} />}

              <DashboardConversionBar savedMinutes={savedMinutes} balance={weeklyEarned} />

              <DashboardScreenTimeRing
                savedMinutes={savedMinutes}
                goalMinutes={goalMinutes}
                hasGoal={hasGoal}
                variant="child"
                dimmed={walletLocked}
              />
            </div>

            {/* Frame 3 — contract */}
            <DashboardContractSection
              childName={childName}
              parentName={parentName}
              shareUrl={shareUrl || '#'}
              variant="child"
            />
          </div>
        </div>
      </div>

      {isNonPaidPlan && (
        <ChildDashboardNonPaidOverlay
          visible={gateVisible}
          headline={gateHeadline}
          onDismiss={() => setGateVisible(false)}
        />
      )}
    </div>
  );
}
