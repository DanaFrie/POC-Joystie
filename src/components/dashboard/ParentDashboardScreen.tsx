'use client';

import { useEffect, useState } from 'react';
import { DashboardFigmaBackground, DashboardBottomGlows } from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardDailyAverageCard } from '@/components/dashboard/DashboardDailyAverageCard';
import { DashboardChallengeBanner } from '@/components/dashboard/DashboardChallengeBanner';
import { DashboardWeekTracker } from '@/components/dashboard/DashboardWeekTracker';
import { DashboardContractSection } from '@/components/dashboard/DashboardContractSection';
import { DashboardSubscriptionOverlay } from '@/components/dashboard/DashboardSubscriptionOverlay';
import CompleteContent from '@/components/onboarding/CompleteContent';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import {
  PARENT_DASHBOARD_COLORS,
  PARENT_DASHBOARD_LAYOUT,
} from '@/constants/parent-dashboard-layout';
import { usePostGameSync } from '@/hooks/usePostGameSync';
import { postGameChildChangeText } from '@/lib/onboarding/postGameSync';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';

type ParentDashboardScreenProps = {
  dashboardData: DashboardState;
  displayWeek: WeekDay[];
  totalWeeklyHours: number;
  weeklyUpload: WeeklyUpload | null;
  activeChallengeData: FirestoreChallenge | null;
  setupUrl: string;
  uploadUrl: string;
  redemptionUrl: string;
  consultationCompleted: boolean | null;
  noChallengeExists: boolean;
  onApproveWeeklyUpload: () => Promise<void>;
  onRejectWeeklyUpload: () => Promise<void>;
  showCompleteModal: boolean;
  onCloseCompleteModal: () => void;
  /** Open subscription popup on load (e.g. after onboarding completion). */
  initialSubscriptionOpen?: boolean;
};

const DASHBOARD_LOADING_HEADLINE = 'אנחנו בדרך';

/** Waiting-style loader for parent + child dashboard data fetch. */
export function DashboardLoadingState() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      role="status"
      aria-live="polite"
      aria-busy
    >
      <FunnelViewport surface="dark" scaleMode="scroll" className="font-simpler text-v03-text-on-dark">
        <OnboardingGrid />
        <OnboardingWaitingScreenShell zIndex={20} ariaBusy staticLayout>
          <OnboardingWaitingCenterContent
            headline={DASHBOARD_LOADING_HEADLINE}
            ariaLabel={DASHBOARD_LOADING_HEADLINE}
          />
        </OnboardingWaitingScreenShell>
      </FunnelViewport>
    </div>
  );
}

export function ParentDashboardScreen({
  dashboardData,
  displayWeek,
  weeklyUpload,
  setupUrl,
  redemptionUrl,
  noChallengeExists,
  onApproveWeeklyUpload,
  onRejectWeeklyUpload,
  showCompleteModal,
  onCloseCompleteModal,
  initialSubscriptionOpen = false,
}: ParentDashboardScreenProps) {
  const childName = dashboardData.child.name;
  const parentName = dashboardData.parent.name || 'הורה';
  const hasChallenge = !noChallengeExists && Boolean(childName);
  const weeklyEarned = dashboardData.weeklyTotals?.coinsEarned ?? 0;

  const childSetupCompleted = Boolean(
    dashboardData.child.nickname &&
      dashboardData.child.moneyGoals &&
      dashboardData.child.moneyGoals.length > 0
  );

  let shareUrl = redemptionUrl;
  if (!childSetupCompleted && setupUrl) shareUrl = setupUrl;

  const { merged } = usePostGameSync({
    parentId: dashboardData.parent.id,
    role: 'parent',
    enabled: Boolean(dashboardData.parent.id),
  });

  const changeText =
    postGameChildChangeText(merged) ||
    'לנסות ללכת לישון בשעה קצת יותר מוקדמת';

  const [subscriptionOpen, setSubscriptionOpen] = useState(initialSubscriptionOpen);

  useEffect(() => {
    if (initialSubscriptionOpen) setSubscriptionOpen(true);
  }, [initialSubscriptionOpen]);

  const closeSubscription = () => setSubscriptionOpen(false);

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

          <div
            className="relative z-[2] mx-auto flex w-full max-w-full flex-col items-center"
            style={{
              width: 328,
              maxWidth: '100%',
              gap: 45,
              paddingTop: PARENT_DASHBOARD_LAYOUT.contentTop,
            }}
          >
            {/* Frame 1 — daily average + start challenge */}
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: PARENT_DASHBOARD_LAYOUT.frame1Gap }}
            >
              <DashboardDailyAverageCard childName={childName || 'יואב'} week={displayWeek} />
              <DashboardChallengeBanner
                childName={childName || 'יואב'}
                reductionPercent={55}
                onClick={() => setSubscriptionOpen(true)}
              />
            </div>

            {/* Frame 2 — contract */}
            <DashboardContractSection
              childName={childName || 'יואב'}
              parentName={parentName}
              shareUrl={shareUrl || '#'}
              weeklyUpload={weeklyUpload}
              variant="parent"
              onApprove={hasChallenge ? onApproveWeeklyUpload : undefined}
              onReject={hasChallenge ? onRejectWeeklyUpload : undefined}
            />

            {/* Frame 3 — change graph cards */}
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: PARENT_DASHBOARD_LAYOUT.frame3Gap }}
            >
              <DashboardWeekTracker
                week={displayWeek}
                dailyScreenTimeGoal={dashboardData.challenge.dailyScreenTimeGoal}
                childName={childName || 'יואב'}
                changeText={changeText}
              />
            </div>
          </div>
        </div>
      </div>

      <DashboardSubscriptionOverlay
        visible={subscriptionOpen}
        onClose={closeSubscription}
        onContinue={closeSubscription}
      />

      {showCompleteModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onClick={onCloseCompleteModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] bg-v03-white shadow-v03-display"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onCloseCompleteModal}
              className="absolute left-4 top-4 z-10 font-simpler text-2xl font-bold text-v03-green-900"
              aria-label="סגור"
            >
              ×
            </button>
            <CompleteContent
              childName={dashboardData.child.name}
              childGender={dashboardData.child.gender || 'boy'}
              childId={dashboardData.child.id}
              onClose={onCloseCompleteModal}
              isModal
            />
          </div>
        </div>
      )}
    </div>
  );
}
