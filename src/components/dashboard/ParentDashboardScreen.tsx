'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardFigmaBackground, DashboardBottomGlows } from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardDailyAverageCard } from '@/components/dashboard/DashboardDailyAverageCard';
import {
  DashboardChallengeBanner,
  ParentDealExtras,
} from '@/components/dashboard/DashboardChallengeBanner';
import { DashboardWeekTracker } from '@/components/dashboard/DashboardWeekTracker';
import { DashboardContractSection } from '@/components/dashboard/DashboardContractSection';
import { DashboardSubscriptionOverlay } from '@/components/dashboard/DashboardSubscriptionOverlay';
import {
  ParentChallengeSetupOverlay,
  type ParentChallengeSetupResult,
} from '@/components/dashboard/challenge/ParentChallengeSetupOverlay';
import {
  ParentRedemptionConfirmOverlay,
  type ParentRedemptionConfirmResult,
} from '@/components/dashboard/challenge/ParentRedemptionConfirmOverlay';
import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import {
  PARENT_DASHBOARD_COLORS,
  PARENT_DASHBOARD_LAYOUT,
} from '@/constants/parent-dashboard-layout';
import { usePostGameSync } from '@/hooks/usePostGameSync';
import {
  postGameChildChangeText,
  postGameParentSuggestedChangeText,
} from '@/lib/onboarding/postGameSync';
import {
  canOpenParentChallengeSetup,
  deriveHourlyRate,
  deriveWeeklyBudget,
  estimatedDailyHoursFromDashboard,
  getRedemptionCountdownTarget,
  isParentChallengeSet,
} from '@/lib/challenge/v03DashboardChallenge';
import {
  persistParentChallengeSetup,
  persistParentRedemptionConfirm,
} from '@/lib/challenge/v03ChallengeFirestore';
import { computeParentDailyAverageMetrics } from '@/lib/dashboard/parentDailyAverage';
import { getUserChallenges } from '@/lib/api/challenges';
import { resolveDashboardChildShareUrl } from '@/lib/api/bondingInvites';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ParentDashboard');

type ParentDashboardScreenProps = {
  dashboardData: DashboardState;
  displayWeek: WeekDay[];
  totalWeeklyHours: number;
  weeklyUpload: WeeklyUpload | null;
  activeChallengeData: FirestoreChallenge | null;
  childShareUrl: string;
  noChallengeExists: boolean;
  onApproveWeeklyUpload: () => Promise<void>;
  onRejectWeeklyUpload: () => Promise<void>;
  initialSubscriptionOpen?: boolean;
  challengeEnabled?: boolean;
  onRefresh: () => Promise<void>;
};

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
        <OnboardingMintGridBackdrop showGrid />
        <OnboardingWaitingScreenShell skipMintGlow zIndex={20} ariaBusy staticLayout>
          <OnboardingWaitingCenterContent headline="" ariaLabel="טוען" />
        </OnboardingWaitingScreenShell>
      </FunnelViewport>
    </div>
  );
}

export function ParentDashboardScreen({
  dashboardData,
  displayWeek,
  weeklyUpload,
  childShareUrl,
  noChallengeExists,
  onApproveWeeklyUpload,
  onRejectWeeklyUpload,
  initialSubscriptionOpen = false,
  challengeEnabled = true,
  onRefresh,
}: ParentDashboardScreenProps) {
  const childName = dashboardData.child.name;
  const parentName = dashboardData.parent.name || 'הורה';
  const hasChallenge = !noChallengeExists && Boolean(childName);

  const shareUrl = childShareUrl || '#';

  const { merged } = usePostGameSync({
    parentId: dashboardData.parent.id,
    role: 'parent',
    enabled: Boolean(dashboardData.parent.id),
  });

  const changeTexts = useMemo(() => {
    if (dashboardData.child.changes?.length) {
      return dashboardData.child.changes.slice(0, 2);
    }
    const texts: string[] = [];
    const first = postGameChildChangeText(merged);
    const second = postGameParentSuggestedChangeText(merged);
    if (first) texts.push(first);
    if (second && second !== first) texts.push(second);
    return texts;
  }, [dashboardData.child.changes, merged]);

  const [subscriptionOpen, setSubscriptionOpen] = useState(initialSubscriptionOpen);
  const [parentSetupOpen, setParentSetupOpen] = useState(false);
  const [parentRedemptionOpen, setParentRedemptionOpen] = useState(false);
  const [challengesHistory, setChallengesHistory] = useState<FirestoreChallenge[]>([]);
  const [copyHint, setCopyHint] = useState('');

  const weeklyBudget = deriveWeeklyBudget(dashboardData.challenge);
  const hourlyRate = deriveHourlyRate(dashboardData.challenge);
  const estimatedDailyHours = estimatedDailyHoursFromDashboard(dashboardData);
  const dealSet = isParentChallengeSet(dashboardData.challenge, noChallengeExists);
  const canSetup = canOpenParentChallengeSetup(
    challengeEnabled,
    dashboardData.challenge,
    noChallengeExists
  );

  const countdownStart = dashboardData.challenge.startDate
    ? new Date(dashboardData.challenge.startDate)
    : null;
  const countdownTarget = getRedemptionCountdownTarget(dashboardData.challenge.startDate);
  const summaryMode =
    dealSet &&
    Boolean(countdownTarget) &&
    Date.now() >= (countdownTarget?.getTime() ?? Infinity);

  const metrics = useMemo(
    () =>
      computeParentDailyAverageMetrics({
        child: dashboardData.child,
        challenges: challengesHistory,
      }),
    [dashboardData.child, challengesHistory]
  );

  const reductionPercent =
    metrics.source === 'baseline' || metrics.weekOverWeekPercent === 0
      ? null
      : Math.abs(metrics.weekOverWeekPercent);

  useEffect(() => {
    const parentId = dashboardData.parent.id;
    if (!parentId) return;
    let cancelled = false;
    void getUserChallenges(parentId)
      .then((list) => {
        if (!cancelled) setChallengesHistory(list);
      })
      .catch((error) => logger.warn('Could not load challenge history:', error));
    return () => {
      cancelled = true;
    };
  }, [dashboardData.parent.id, dashboardData.activeChallengeId]);

  const resolveChildShareUrl = useCallback(async () => {
    const parentId = dashboardData.parent.id;
    if (!parentId) return shareUrl;
    try {
      return await resolveDashboardChildShareUrl({
        parentId,
        childId: dashboardData.child.id || null,
      });
    } catch {
      return shareUrl;
    }
  }, [dashboardData.parent.id, dashboardData.child.id, shareUrl]);

  const handleCopyChildUrl = useCallback(async () => {
    const url = await resolveChildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopyHint('הקישור הועתק');
      window.setTimeout(() => setCopyHint(''), 2000);
    } catch {
      setCopyHint(url);
    }
  }, [resolveChildShareUrl]);

  const handleBannerClick = () => {
    if (!challengeEnabled) {
      setSubscriptionOpen(true);
      return;
    }
    if (canSetup) {
      setParentSetupOpen(true);
      return;
    }
    if (weeklyUpload?.status === 'pending') {
      setParentRedemptionOpen(true);
    }
  };

  const handleParentSetupSubmit = useCallback(
    async (result: ParentChallengeSetupResult) => {
      const parentId = dashboardData.parent.id;
      if (!parentId) return;
      try {
        await persistParentChallengeSetup(parentId, dashboardData.child.id || undefined, result);
        setParentSetupOpen(false);
        await onRefresh();
      } catch (error) {
        logger.error('Parent challenge setup failed:', error);
      }
    },
    [dashboardData.parent.id, dashboardData.child.id, onRefresh]
  );

  const handleParentRedemptionConfirm = useCallback(
    async (result: ParentRedemptionConfirmResult) => {
      const parentId = dashboardData.parent.id;
      const challengeId = dashboardData.activeChallengeId;
      if (!parentId || !challengeId) return;
      await persistParentRedemptionConfirm(parentId, challengeId, result);
      setParentRedemptionOpen(false);
      await onRefresh();
    },
    [dashboardData.parent.id, dashboardData.activeChallengeId, onRefresh]
  );

  const handleContractApprove = async () => {
    if (challengeEnabled && weeklyUpload?.status === 'pending') {
      setParentRedemptionOpen(true);
      return;
    }
    await onApproveWeeklyUpload();
  };

  useEffect(() => {
    if (initialSubscriptionOpen) setSubscriptionOpen(true);
  }, [initialSubscriptionOpen]);

  // Redemption-only live sync: open confirm card when child upload is pending.
  useEffect(() => {
    if (challengeEnabled && weeklyUpload?.status === 'pending') {
      setParentRedemptionOpen(true);
    }
  }, [challengeEnabled, weeklyUpload?.status]);

  const closeSubscription = () => setSubscriptionOpen(false);

  const topBarBalance = dealSet ? weeklyBudget : dashboardData.weeklyTotals?.coinsEarned ?? 0;

  return (
    <div
      className="absolute inset-0 flex h-full w-full min-w-0 max-w-none flex-col overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      dir="rtl"
    >
      <DashboardFigmaBackground showBottomGlows={false} />

      <DashboardTopBar balance={topBarBalance} menuSlot={<DashboardHeaderMenu />} />

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
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: PARENT_DASHBOARD_LAYOUT.frame1Gap }}
            >
              <DashboardDailyAverageCard
                childName={childName || 'יואב'}
                week={displayWeek}
                averageMinutes={metrics.averageMinutes}
                weekOverWeekPercent={metrics.weekOverWeekPercent}
              />
              <DashboardChallengeBanner
                childName={childName || 'יואב'}
                reductionPercent={reductionPercent}
                onClick={handleBannerClick}
                dealActive={dealSet}
                countdownTarget={countdownTarget}
                countdownStart={countdownStart}
                summaryMode={summaryMode}
                onCopyChildUrl={handleCopyChildUrl}
              />
              <ParentDealExtras visible={dealSet} hourlyRate={hourlyRate} />
              {copyHint ? (
                <p className="text-center font-simpler text-[13px] text-white/70">{copyHint}</p>
              ) : null}
            </div>

            <DashboardContractSection
              childName={childName || 'יואב'}
              parentName={parentName}
              shareUrl={shareUrl || '#'}
              weeklyUpload={weeklyUpload}
              variant="parent"
              onApprove={hasChallenge ? handleContractApprove : undefined}
              onReject={hasChallenge ? onRejectWeeklyUpload : undefined}
            />

            <div
              className="flex w-full flex-col items-center"
              style={{ gap: PARENT_DASHBOARD_LAYOUT.frame3Gap }}
            >
              <DashboardWeekTracker
                week={displayWeek}
                dailyScreenTimeGoal={dashboardData.challenge.dailyScreenTimeGoal}
                childName={childName || 'יואב'}
                childId={dashboardData.child.id}
                parentId={dashboardData.parent.id}
                changes={changeTexts}
                changeDayChecks={dashboardData.child.changeDayChecks}
              />
            </div>
          </div>
        </div>
      </div>

      <ParentChallengeSetupOverlay
        visible={parentSetupOpen}
        childName={childName || 'יואב'}
        estimatedDailyHours={estimatedDailyHours}
        onClose={() => setParentSetupOpen(false)}
        onSubmit={handleParentSetupSubmit}
      />

      <ParentRedemptionConfirmOverlay
        visible={parentRedemptionOpen}
        childName={childName || 'יואב'}
        weeklyBudget={weeklyBudget}
        hourlyRate={hourlyRate}
        initialTotalHours={
          weeklyUpload?.processedData?.screenTimeMinutes
            ? weeklyUpload.processedData.screenTimeMinutes / 60
            : 0
        }
        onClose={() => setParentRedemptionOpen(false)}
        onConfirm={handleParentRedemptionConfirm}
      />

      <DashboardSubscriptionOverlay
        visible={subscriptionOpen}
        onClose={closeSubscription}
      />
    </div>
  );
}
