'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { DashboardFigmaBackground } from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardScreenTimeRing } from '@/components/dashboard/DashboardScreenTimeRing';
import { DashboardSavingsCard } from '@/components/dashboard/DashboardSavingsCard';
import { DashboardWeekTracker } from '@/components/dashboard/DashboardWeekTracker';
import { DashboardComboBanner } from '@/components/dashboard/DashboardComboBanner';
import { DashboardContractSection } from '@/components/dashboard/DashboardContractSection';
import { DashboardNotificationsSheet } from '@/components/dashboard/DashboardNotificationsSheet';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import CompleteContent from '@/components/onboarding/CompleteContent';
import {
  PARENT_DASHBOARD_ASSETS,
  PARENT_DASHBOARD_COLORS,
  PARENT_DASHBOARD_LAYOUT,
} from '@/constants/parent-dashboard-layout';
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
};

function DashboardLoadingState({ label }: { label: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
    >
      <div className="text-center">
        <p className="mb-4 font-simpler text-[18px] font-bold text-white">{label}</p>
        <div
          className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: `${PARENT_DASHBOARD_COLORS.mintBright} transparent transparent transparent` }}
        />
      </div>
    </div>
  );
}

function countNotificationAlerts(props: {
  noChallengeExists?: boolean;
  consultationCompleted?: boolean;
  challengeNotStarted?: boolean;
  weeklyUploadStatus?: string;
  showCopyButton?: boolean;
}): number {
  let count = 0;
  if (props.noChallengeExists) count += 1;
  if (props.consultationCompleted === false) count += 1;
  if (props.consultationCompleted === true && props.challengeNotStarted) count += 1;
  if (props.weeklyUploadStatus === 'pending') count += 1;
  if (props.weeklyUploadStatus === 'approved') count += 1;
  if (props.showCopyButton) count += 1;
  return count;
}

export function ParentDashboardScreen({
  dashboardData,
  displayWeek,
  weeklyUpload,
  setupUrl,
  uploadUrl,
  redemptionUrl,
  consultationCompleted,
  noChallengeExists,
  onApproveWeeklyUpload,
  onRejectWeeklyUpload,
  showCompleteModal,
  onCloseCompleteModal,
}: ParentDashboardScreenProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const childName = dashboardData.child.name;
  const parentName = dashboardData.parent.name || 'הורה';
  const hasChallenge = !noChallengeExists && Boolean(childName);

  const weeklyEarned = dashboardData.weeklyTotals?.coinsEarned ?? 0;
  const weeklyBudget = dashboardData.challenge.weeklyBudget ?? 0;

  const today = dashboardData.today;
  const goalHours = today?.screenTimeGoal ?? dashboardData.challenge.dailyScreenTimeGoal ?? 0;
  const usedHours = today?.screenTimeUsed ?? 0;
  const hasGoal = goalHours > 0;
  const savedMinutes = hasGoal ? Math.max(0, (goalHours - usedHours) * 60) : 0;
  const goalMinutes = hasGoal ? goalHours * 60 : 0;

  const childSetupCompleted = Boolean(
    dashboardData.child.nickname &&
      dashboardData.child.moneyGoals &&
      dashboardData.child.moneyGoals.length > 0
  );

  let shareUrl = redemptionUrl;
  if (!childSetupCompleted && setupUrl) shareUrl = setupUrl;

  const notificationCount = useMemo(
    () =>
      countNotificationAlerts({
        noChallengeExists,
        consultationCompleted: consultationCompleted ?? undefined,
        challengeNotStarted: dashboardData.challengeNotStarted,
        weeklyUploadStatus: weeklyUpload?.status,
        showCopyButton: Boolean(hasChallenge && shareUrl && weeklyUpload?.status !== 'approved'),
      }),
    [
      noChallengeExists,
      consultationCompleted,
      dashboardData.challengeNotStarted,
      weeklyUpload?.status,
      hasChallenge,
      shareUrl,
    ]
  );

  const panelProps = {
    challengeNotStarted: dashboardData.challengeNotStarted,
    challengeStartDate: dashboardData.challengeStartDate,
    childName: dashboardData.child.name,
    childGender: dashboardData.child.gender,
    parentName: dashboardData.parent.name,
    parentGender: dashboardData.parent.gender,
    setupUrl,
    uploadUrl,
    redemptionUrl,
    weeklyUpload,
    childSetupCompleted,
    consultationCompleted: consultationCompleted ?? undefined,
    noChallengeExists,
  };

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      dir="rtl"
    >
      <DashboardFigmaBackground />

      <DashboardTopBar
        balance={weeklyEarned}
        notificationCount={notificationCount}
        onNotificationsClick={() => setNotificationsOpen(true)}
        menuSlot={<DashboardHeaderMenu />}
      />

      <div className="relative min-h-0 flex-1 overflow-y-auto v03-scroll-hidden pb-10">
        {hasChallenge && (
          <div className="pointer-events-none absolute -left-6 top-[180px] z-[1] opacity-90">
            <Image
              src={PARENT_DASHBOARD_ASSETS.companion}
              alt=""
              width={152}
              height={152}
              className="rotate-[9deg] object-contain"
              unoptimized
            />
          </div>
        )}

        <div
          className="relative z-[2] mx-auto flex w-full max-w-[328px] flex-col items-center px-[23px] pt-4"
          style={{ gap: PARENT_DASHBOARD_LAYOUT.contentGap }}
        >
          <div className="flex w-full flex-col items-center" style={{ gap: 28 }}>
            <DashboardScreenTimeRing
              savedMinutes={savedMinutes}
              goalMinutes={goalMinutes}
              hasGoal={hasGoal}
            />

            <div className="flex w-full max-w-[225px] flex-col items-center gap-2 text-center">
              <h1
                className="font-simpler text-[20px] font-black"
                style={{ color: PARENT_DASHBOARD_COLORS.textPrimary }}
              >
                היי {parentName}!
              </h1>
              <p
                className="font-simpler text-[16px] font-normal leading-[19.2px]"
                style={{ color: PARENT_DASHBOARD_COLORS.textPrimary }}
              >
                {hasChallenge
                  ? `כאן תראו את ההתקדמות של ${childName} בזמן מסך ובחיסכון!`
                  : 'כשתגדירו אתגר ראשון, כאן יופיעו הנתונים של הילד.'}
              </p>
            </div>
          </div>

          <DashboardSavingsCard balance={weeklyEarned} childName={childName} />

          <div className="flex w-full flex-col" style={{ gap: PARENT_DASHBOARD_LAYOUT.sectionGap }}>
            <DashboardWeekTracker
              week={displayWeek}
              dailyScreenTimeGoal={dashboardData.challenge.dailyScreenTimeGoal}
              childName={childName}
            />

            <DashboardComboBanner weeklyBudget={weeklyBudget} />

            {noChallengeExists && (
              <div className="w-full">
                <NotificationsPanel variant="dark" {...panelProps} />
              </div>
            )}
          </div>

          {hasChallenge && (
            <DashboardContractSection
              childName={childName}
              parentName={parentName}
              shareUrl={shareUrl}
              weeklyUpload={weeklyUpload}
              onApprove={onApproveWeeklyUpload}
              onReject={onRejectWeeklyUpload}
            />
          )}
        </div>
      </div>

      <DashboardNotificationsSheet
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        {...panelProps}
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

export { DashboardLoadingState };
