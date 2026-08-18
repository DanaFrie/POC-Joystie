'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import nextDynamic from 'next/dynamic';
import { DashboardFigmaBackground } from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardEnter } from '@/components/dashboard/DashboardEnter';
import { DashboardDailyAverageCard } from '@/components/dashboard/DashboardDailyAverageCard';
import {
  DashboardChallengeBanner,
} from '@/components/dashboard/DashboardChallengeBanner';
import { DashboardWeekTracker } from '@/components/dashboard/DashboardWeekTracker';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import {
  DashboardContractImageCard,
  DashboardDealRunningCard,
} from '@/components/dashboard/DashboardQuickActionCards';
import {
  DashboardCompletedDealsView,
  DashboardDealsSection,
} from '@/components/dashboard/DashboardDealsSection';
import type { ParentChallengeSetupResult } from '@/components/dashboard/challenge/ParentChallengeSetupOverlay';
import type { ParentRedemptionConfirmResult } from '@/components/dashboard/challenge/ParentRedemptionConfirmOverlay';
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';

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
import { getChildShareCardAccess } from '@/lib/api/shareCard';
import { loadImageBlob, shareImageFile } from '@/lib/share/shareImage';
import { generateChildUrl } from '@/utils/url-encoding';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import type { FirestoreChallenge, WeeklyUpload } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const ParentChallengeSetupOverlay = nextDynamic(
  () =>
    import('@/components/dashboard/challenge/ParentChallengeSetupOverlay').then((m) => ({
      default: m.ParentChallengeSetupOverlay,
    })),
  { ssr: false }
);
const ParentRedemptionConfirmOverlay = nextDynamic(
  () =>
    import('@/components/dashboard/challenge/ParentRedemptionConfirmOverlay').then((m) => ({
      default: m.ParentRedemptionConfirmOverlay,
    })),
  { ssr: false }
);
const DashboardSubscriptionOverlay = nextDynamic(
  () =>
    import('@/components/dashboard/DashboardSubscriptionOverlay').then((m) => ({
      default: m.DashboardSubscriptionOverlay,
    })),
  { ssr: false }
);

const logger = createContextLogger('ParentDashboard');

/** Re-show parent redemption card after dismiss without confirm. */
const PARENT_REDEMPTION_REOPEN_MS = 15_000;

type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPwaInstall: BeforeInstallPromptEventLike | null = null;
let pwaInstallListenerAttached = false;

function ensurePwaInstallListener() {
  if (typeof window === 'undefined' || pwaInstallListenerAttached) return;
  pwaInstallListenerAttached = true;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPwaInstall = event as BeforeInstallPromptEventLike;
  });
}

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
  /** Open subscription popup on load (e.g. after onboarding or failed checkout). */
  initialSubscriptionOpen?: boolean;
  /** Open challenge setup + confetti after successful Cardcom checkout. */
  initialChallengeSetupOpen?: boolean;
  challengeEnabled?: boolean;
  onRefresh: () => Promise<void>;
};

/** Direct /dashboard loader — session restore uses the root SessionRouteWaiter instead. */
export function DashboardLoadingState() {
  return <FunnelRouteLoading />;
}

export function ParentDashboardScreen({
  dashboardData,
  displayWeek,
  weeklyUpload,
  childShareUrl,
  noChallengeExists,
  initialSubscriptionOpen = false,
  initialChallengeSetupOpen = false,
  challengeEnabled = true,
  onRefresh,
}: ParentDashboardScreenProps) {
  const childName = dashboardData.child.name;

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
  const [completedDealsOpen, setCompletedDealsOpen] = useState(false);
  const [contractImageOpen, setContractImageOpen] = useState(false);
  const [contractImageUrl, setContractImageUrl] = useState<string | null>(null);
  const contractBlobRef = useRef<Blob | null>(null);
  const [dealRunningOpen, setDealRunningOpen] = useState(false);
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

  const completedChallenges = useMemo(
    () =>
      challengesHistory.filter(
        (c) =>
          Boolean(c.redemptionAmount != null || c.redeemedAt) ||
          (!c.isActive && Boolean(c.startDate))
      ),
    [challengesHistory]
  );

  /** Live deal card — not during freemium, setup-empty, or week-summary CTA. */
  const showActiveDealCard = challengeEnabled && dealSet && !summaryMode;
  /** Paid, no active deal, never redeemed — first-deal hero. */
  const showFirstDealHero =
    challengeEnabled && canSetup && completedChallenges.length === 0 && !dealSet;
  /** Paid, no active deal, after at least one redemption. */
  const showEmptyActiveDeals =
    challengeEnabled && canSetup && completedChallenges.length > 0 && !dealSet;
  const showQuickActions = true;

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

  const handleCopyChildUrl = useCallback(async (): Promise<boolean> => {
    const url = await resolveChildShareUrl();
    if (!url || !isChildDashboardTokenUrl(url)) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, [resolveChildShareUrl]);

  const resolveContractImageUrl = useCallback(async (): Promise<string | null> => {
    const parentId = dashboardData.parent.id;
    if (!parentId) return null;
    try {
      let imageUrl = dashboardData.child.shareCardUrl || '';
      if (dashboardData.child.shareCardStored) {
        const access = await getChildShareCardAccess({
          parentId,
          childId: dashboardData.child.id || undefined,
        });
        imageUrl = access?.url || imageUrl;
      }
      return imageUrl || null;
    } catch (error) {
      logger.warn('Could not resolve contract image:', error);
      return null;
    }
  }, [
    dashboardData.parent.id,
    dashboardData.child.id,
    dashboardData.child.shareCardUrl,
    dashboardData.child.shareCardStored,
  ]);

  /** Prefetch agreement bytes so share stays inside the user-gesture window. */
  useEffect(() => {
    let cancelled = false;
    contractBlobRef.current = null;
    if (!dashboardData.child.shareCardStored && !dashboardData.child.shareCardUrl) {
      return;
    }
    void (async () => {
      try {
        const imageUrl = await resolveContractImageUrl();
        if (!imageUrl || cancelled) return;
        const blob = await loadImageBlob({ imageUrl });
        if (!cancelled) contractBlobRef.current = blob;
      } catch (error) {
        logger.warn('Contract image prefetch failed:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    dashboardData.child.shareCardStored,
    dashboardData.child.shareCardUrl,
    dashboardData.child.id,
    resolveContractImageUrl,
  ]);

  const handleViewContract = useCallback(async () => {
    const imageUrl = await resolveContractImageUrl();
    setContractImageUrl(imageUrl);
    setContractImageOpen(true);
  }, [resolveContractImageUrl]);

  const handleShareContract = useCallback(async () => {
    try {
      let blob = contractBlobRef.current;
      if (!blob) {
        const imageUrl = await resolveContractImageUrl();
        if (!imageUrl) {
          logger.warn('No contract image to share');
          return;
        }
        blob = await loadImageBlob({ imageUrl });
        contractBlobRef.current = blob;
      }
      await shareImageFile({
        imageBlob: blob,
        fileName: 'joystie-handshake.jpg',
        title: 'Joystie',
        text: 'החוזה שלנו ב- joystie.com',
      });
    } catch (error) {
      logger.warn('Contract share failed:', error);
    }
  }, [resolveContractImageUrl]);

  const handleAddToHome = useCallback(async (): Promise<boolean> => {
    ensurePwaInstallListener();
    if (deferredPwaInstall) {
      try {
        await deferredPwaInstall.prompt();
        const choice = await deferredPwaInstall.userChoice;
        deferredPwaInstall = null;
        return choice.outcome === 'accepted';
      } catch {
        return false;
      }
    }

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'Joystie',
          text: 'הוסיפו את ג׳ויסטי למסך הבית',
          url: window.location.origin,
        });
        return true;
      }
    } catch {
      // dismissed
    }
    return false;
  }, []);

  useEffect(() => {
    ensurePwaInstallListener();
  }, []);

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

  /** Quick-action create deal — setup / subscription / already-running card. */
  const handleCreateDeal = () => {
    if (canSetup) {
      setParentSetupOpen(true);
      return;
    }
    if (!challengeEnabled) {
      setSubscriptionOpen(true);
      return;
    }
    setDealRunningOpen(true);
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
  const displayChildName = childName || 'יואב';

  return (
    <div
      className="absolute inset-0 flex h-full w-full min-w-0 max-w-none flex-col overflow-hidden"
      style={{ background: PARENT_DASHBOARD_COLORS.canvas }}
      dir="rtl"
      data-v03-dashboard-screen
    >
      <DashboardEnter variant="fade" index={0} className="pointer-events-none absolute inset-x-0 top-0 z-20">
        <div className="pointer-events-auto">
          <DashboardTopBar
            balance={topBarBalance}
            menuSlot={<DashboardHeaderMenu variant="parent" />}
          />
        </div>
      </DashboardEnter>

      {/* One scroll surface — background + cards move together. */}
      <div
        data-dashboard-scroll
        className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-y-none v03-scroll-hidden"
      >
        <div className="relative min-h-full w-full max-w-[100vw] pb-10">
          <DashboardFigmaBackground mode="embedded" />

          <DashboardEnter
            variant="frame"
            index={0}
            className="relative z-[2] mx-auto flex h-auto w-full max-w-full flex-col items-center"
          >
            <div
              className="flex w-full max-w-full flex-col items-center"
              style={{
                gap: PARENT_DASHBOARD_LAYOUT.contentGap,
                paddingTop: PARENT_DASHBOARD_LAYOUT.contentTop,
                paddingInline: PARENT_DASHBOARD_LAYOUT.gutter,
              }}
            >
              {completedDealsOpen ? (
                <DashboardEnter index={1} className="w-full">
                  <DashboardCompletedDealsView
                    childName={displayChildName}
                    challenges={completedChallenges}
                    onBack={() => setCompletedDealsOpen(false)}
                  />
                </DashboardEnter>
              ) : (
                <>
                  <div
                    className="flex w-full flex-col items-center"
                    style={{ gap: PARENT_DASHBOARD_LAYOUT.frame1Gap }}
                  >
                    <DashboardEnter index={1} className="w-full">
                      <DashboardDailyAverageCard
                        childName={displayChildName}
                        week={displayWeek}
                        averageMinutes={metrics.averageMinutes}
                        weekOverWeekPercent={metrics.weekOverWeekPercent}
                        withDori={showActiveDealCard}
                      />
                    </DashboardEnter>

                    {!challengeEnabled ? (
                      <DashboardEnter index={2} className="w-full">
                        <DashboardChallengeBanner
                          childName={displayChildName}
                          reductionPercent={reductionPercent}
                          onClick={handleBannerClick}
                          dealActive={false}
                        />
                      </DashboardEnter>
                    ) : null}

                    {showFirstDealHero ? (
                      <DashboardEnter index={2} className="w-full">
                        <DashboardChallengeBanner
                          childName={displayChildName}
                          reductionPercent={reductionPercent}
                          headline={`להתחלת הדיל הראשון עם ${displayChildName} >>`}
                          onClick={handleBannerClick}
                        />
                      </DashboardEnter>
                    ) : null}

                    {showActiveDealCard || showEmptyActiveDeals ? (
                      <DashboardEnter index={2} className="w-full">
                        <DashboardDealsSection
                          childName={displayChildName}
                          reductionPercent={reductionPercent}
                          activeChallenge={
                            showActiveDealCard
                              ? {
                                  startDate: dashboardData.challenge.startDate,
                                  challengeDays: dashboardData.challenge.challengeDays,
                                  weeklyBudget,
                                  hourlyRate,
                                  countdownTarget,
                                }
                              : null
                          }
                          completedChallenges={completedChallenges}
                          showEmptyActiveCta={showEmptyActiveDeals}
                          onCreateDeal={handleCreateDeal}
                          onOpenCompleted={() => setCompletedDealsOpen(true)}
                        />
                      </DashboardEnter>
                    ) : null}

                    {summaryMode ? (
                      <DashboardEnter index={2} className="w-full">
                        <DashboardChallengeBanner
                          childName={displayChildName}
                          reductionPercent={reductionPercent}
                          onClick={handleBannerClick}
                          dealActive
                          countdownTarget={countdownTarget}
                          countdownStart={countdownStart}
                          summaryMode
                          onCopyChildUrl={handleCopyChildUrl}
                        />
                      </DashboardEnter>
                    ) : null}
                  </div>

                  {showQuickActions ? (
                    <DashboardEnter index={3} className="w-full">
                      <DashboardQuickActions
                        childName={displayChildName}
                        showCreateDeal
                        onCreateDeal={handleCreateDeal}
                        onCopyWalletLink={handleCopyChildUrl}
                        onShareContract={() => void handleShareContract()}
                        onViewContract={() => void handleViewContract()}
                        onAddToHome={handleAddToHome}
                      />
                    </DashboardEnter>
                  ) : null}

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
                        childName={displayChildName}
                        childId={dashboardData.child.id}
                        parentId={dashboardData.parent.id}
                        changes={changeTexts}
                        changeDayChecks={dashboardData.child.changeDayChecks}
                      />
                    </div>
                  </DashboardEnter>
                </>
              )}
            </div>
          </DashboardEnter>
        </div>
      </div>

      {parentSetupOpen ? (
        <ParentChallengeSetupOverlay
          visible
          childName={displayChildName}
          childGender={dashboardData.child.gender || 'boy'}
          estimatedDailyHours={estimatedDailyHours}
          isFirstDeal={completedChallenges.length === 0}
          onClose={() => setParentSetupOpen(false)}
          onSubmit={handleParentSetupSubmit}
        />      ) : null}

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

      {parentRedemptionOpen ? (
        <ParentRedemptionConfirmOverlay
          visible
          childName={displayChildName}
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
      ) : null}

      {subscriptionOpen ? (
        <DashboardSubscriptionOverlay visible onClose={closeSubscription} />
      ) : null}

      <DashboardContractImageCard
        visible={contractImageOpen}
        imageUrl={contractImageUrl}
        childName={displayChildName}
        onClose={() => setContractImageOpen(false)}
      />

      <DashboardDealRunningCard
        visible={dealRunningOpen}
        childName={displayChildName}
        countdownTarget={countdownTarget}
        onClose={() => setDealRunningOpen(false)}
      />
    </div>
  );
}
