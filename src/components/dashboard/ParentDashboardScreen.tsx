'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DashboardFigmaBackground, DashboardBottomGlows } from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardEnter } from '@/components/dashboard/DashboardEnter';
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
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import {
  PARENT_DASHBOARD_COLORS,
  PARENT_DASHBOARD_LAYOUT,
} from '@/constants/parent-dashboard-layout';
import {
  V03_CHALLENGE_SETUP_ASSETS,
  V03_CHALLENGE_SETUP_LAYOUT,
} from '@/constants/v03-challenge-layout';
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
import { generateChildUrl } from '@/utils/url-encoding';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ParentDashboard');

/** Re-show parent redemption card after dismiss without confirm. */
const PARENT_REDEMPTION_REOPEN_MS = 15_000;

function isChildDashboardTokenUrl(url: string): boolean {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://joystie.local');
    return parsed.pathname.includes('/dashboard/child') && Boolean(parsed.searchParams.get('token')?.trim());
  } catch {
    return false;
  }
}

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
  /** Open subscription popup on load (e.g. after onboarding or failed checkout). */
  initialSubscriptionOpen?: boolean;
  /** Open challenge setup + confetti after successful Cardcom checkout. */
  initialChallengeSetupOpen?: boolean;
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
  initialChallengeSetupOpen = false,
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
  const [showChallengeConfetti, setShowChallengeConfetti] = useState(false);
  const [parentRedemptionOpen, setParentRedemptionOpen] = useState(false);
  const [redemptionDismissedAt, setRedemptionDismissedAt] = useState<number | null>(null);
  const [challengesHistory, setChallengesHistory] = useState<FirestoreChallenge[]>([]);
  const [copyHint, setCopyHint] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible'
  );
  const parentRedemptionOpenRef = useRef(parentRedemptionOpen);
  parentRedemptionOpenRef.current = parentRedemptionOpen;

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
  const countdownDone = Boolean(countdownTarget) && now >= (countdownTarget?.getTime() ?? Infinity);
  const summaryMode = dealSet && countdownDone;

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

  // Flip to summary / redemption window when the countdown hits zero (no 1s polling).
  useEffect(() => {
    if (!countdownTarget) return;
    const remaining = countdownTarget.getTime() - Date.now();
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setNow(Date.now()), remaining + 50);
    return () => window.clearTimeout(id);
  }, [countdownTarget]);

  useEffect(() => {
    const onVisibility = () => {
      setPageVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

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
    const childId = dashboardData.child.id || undefined;
    if (!parentId) {
      return isChildDashboardTokenUrl(shareUrl) ? shareUrl : '';
    }
    try {
      const url = await resolveDashboardChildShareUrl({
        parentId,
        childId: childId || null,
      });
      if (isChildDashboardTokenUrl(url)) return url;
    } catch {
      // fall through to local token URL
    }
    if (isChildDashboardTokenUrl(shareUrl)) return shareUrl;
    return generateChildUrl(parentId, childId);
  }, [dashboardData.parent.id, dashboardData.child.id, shareUrl]);

  const handleCopyChildUrl = useCallback(async () => {
    const url = await resolveChildShareUrl();
    if (!url || !isChildDashboardTokenUrl(url)) {
      setCopyHint('לא ניתן ליצור קישור לילד');
      window.setTimeout(() => setCopyHint(''), 2500);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopyHint('הקישור הועתק');
      window.setTimeout(() => setCopyHint(''), 2000);
    } catch {
      setCopyHint(url);
    }
  }, [resolveChildShareUrl]);

  const tryOpenParentRedemption = useCallback(() => {
    if (!challengeEnabled || !countdownDone || !pageVisible) return;
    if (weeklyUpload?.status !== 'pending') return;
    if (parentRedemptionOpenRef.current) return;
    if (
      redemptionDismissedAt != null &&
      Date.now() - redemptionDismissedAt < PARENT_REDEMPTION_REOPEN_MS
    ) {
      return;
    }
    setParentRedemptionOpen(true);
  }, [
    challengeEnabled,
    countdownDone,
    pageVisible,
    weeklyUpload?.status,
    redemptionDismissedAt,
  ]);

  useEffect(() => {
    tryOpenParentRedemption();
  }, [tryOpenParentRedemption]);

  // After dismiss without confirm — reopen in 15s while still pending.
  useEffect(() => {
    if (redemptionDismissedAt == null) return;
    if (!challengeEnabled || !countdownDone) return;
    if (weeklyUpload?.status !== 'pending') return;
    const wait = Math.max(
      0,
      PARENT_REDEMPTION_REOPEN_MS - (Date.now() - redemptionDismissedAt)
    );
    const id = window.setTimeout(() => {
      setRedemptionDismissedAt(null);
    }, wait);
    return () => window.clearTimeout(id);
  }, [
    redemptionDismissedAt,
    challengeEnabled,
    countdownDone,
    weeklyUpload?.status,
  ]);

  const handleBannerClick = () => {
    if (!challengeEnabled) {
      setSubscriptionOpen(true);
      return;
    }
    if (canSetup) {
      setParentSetupOpen(true);
      return;
    }
    if (countdownDone && weeklyUpload?.status === 'pending') {
      setRedemptionDismissedAt(null);
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
      setRedemptionDismissedAt(null);
      await persistParentRedemptionConfirm(parentId, challengeId, result);
      setParentRedemptionOpen(false);
      await onRefresh();
    },
    [dashboardData.parent.id, dashboardData.activeChallengeId, onRefresh]
  );

  const handleParentRedemptionClose = useCallback(() => {
    setParentRedemptionOpen(false);
    if (weeklyUpload?.status === 'pending') {
      setRedemptionDismissedAt(Date.now());
    }
  }, [weeklyUpload?.status]);

  const handleContractApprove = async () => {
    if (challengeEnabled && countdownDone && weeklyUpload?.status === 'pending') {
      setRedemptionDismissedAt(null);
      setParentRedemptionOpen(true);
      return;
    }
    await onApproveWeeklyUpload();
  };

  useEffect(() => {
    if (initialSubscriptionOpen) setSubscriptionOpen(true);
  }, [initialSubscriptionOpen]);

  useEffect(() => {
    if (!initialChallengeSetupOpen) return;
    setParentSetupOpen(true);
    setShowChallengeConfetti(true);
    const timer = window.setTimeout(
      () => setShowChallengeConfetti(false),
      V03_CHALLENGE_SETUP_LAYOUT.celebrationMs
    );
    return () => window.clearTimeout(timer);
  }, [initialChallengeSetupOpen]);

  const closeSubscription = () => setSubscriptionOpen(false);

  const topBarBalance = dealSet ? weeklyBudget : dashboardData.weeklyTotals?.coinsEarned ?? 0;

  return (
    <div
      className="absolute inset-0 flex h-full w-full min-w-0 max-w-none flex-col overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      dir="rtl"
    >
      <DashboardFigmaBackground showBottomGlows={false} />

      <DashboardEnter variant="fade" index={0} className="absolute inset-x-0 top-0 z-20">
        <DashboardTopBar balance={topBarBalance} menuSlot={<DashboardHeaderMenu />} />
      </DashboardEnter>

      <div className="absolute inset-0 overflow-x-hidden overflow-y-auto v03-scroll-hidden">
        <div className="relative min-h-full w-full max-w-[100vw] overflow-x-hidden pb-10">
          <DashboardBottomGlows />

          <DashboardEnter
            variant="frame"
            index={0}
            className="relative z-[2] mx-auto flex w-full max-w-full flex-col items-center"
          >
            <div
              className="flex w-full max-w-full flex-col items-center"
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
                <DashboardEnter index={1} className="w-full">
                  <DashboardDailyAverageCard
                    childName={childName || 'יואב'}
                    week={displayWeek}
                    averageMinutes={metrics.averageMinutes}
                    weekOverWeekPercent={metrics.weekOverWeekPercent}
                  />
                </DashboardEnter>
                <DashboardEnter index={2} className="w-full">
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
                </DashboardEnter>
                <DashboardEnter index={3} className="w-full">
                  <ParentDealExtras visible={dealSet} hourlyRate={hourlyRate} />
                  {copyHint ? (
                    <p className="text-center font-simpler text-[13px] text-white/70">{copyHint}</p>
                  ) : null}
                </DashboardEnter>
              </div>

              <DashboardEnter index={4} className="w-full">
                <DashboardContractSection
                  childName={childName || 'יואב'}
                  parentName={parentName}
                  shareUrl={shareUrl || '#'}
                  weeklyUpload={weeklyUpload}
                  variant="parent"
                  onApprove={hasChallenge ? handleContractApprove : undefined}
                  onReject={hasChallenge ? onRejectWeeklyUpload : undefined}
                />
              </DashboardEnter>

              <DashboardEnter
                index={5}
                className="flex w-full flex-col items-center"
              >
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
              </DashboardEnter>
            </div>
          </DashboardEnter>
        </div>
      </div>

      <ParentChallengeSetupOverlay
        visible={parentSetupOpen}
        childName={childName || 'יואב'}
        childGender={dashboardData.child.gender || 'boy'}
        estimatedDailyHours={estimatedDailyHours}
        onClose={() => setParentSetupOpen(false)}
        onSubmit={handleParentSetupSubmit}
      />

      {showChallengeConfetti ? (
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
        onClose={handleParentRedemptionClose}
        onConfirm={handleParentRedemptionConfirm}
      />

      <DashboardSubscriptionOverlay
        visible={subscriptionOpen}
        onClose={closeSubscription}
      />
    </div>
  );
}
