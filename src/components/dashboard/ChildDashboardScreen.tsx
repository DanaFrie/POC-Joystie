'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import nextDynamic from 'next/dynamic';
import { DashboardFigmaBackground } from '@/components/dashboard/DashboardFigmaBackground';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { DashboardHeaderMenu } from '@/components/dashboard/DashboardHeaderMenu';
import { DashboardEnter } from '@/components/dashboard/DashboardEnter';
import { formatCountdown } from '@/components/dashboard/DashboardScreenTimeRing';
import { DashboardSavingsCard } from '@/components/dashboard/DashboardSavingsCard';
import { DashboardWeekTracker } from '@/components/dashboard/DashboardWeekTracker';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import {
  DashboardContractImageCard,
} from '@/components/dashboard/DashboardQuickActionCards';
import { ChildDashboardNonPaidOverlay } from '@/components/dashboard/ChildDashboardNonPaidOverlay';
import type { ChildChallengeSetupResult } from '@/components/dashboard/challenge/ChildChallengeSetupOverlay';
import type { ChildRedemptionFlowResult } from '@/components/dashboard/challenge/ChildRedemptionOverlay';

import {
  DashboardChildDealCountdown,
  DashboardChildDealEndedBanner,
  DashboardChildGreeting,
  DashboardChildStartCta,
  DashboardChildWeeklyScreenTimeCard,
  DashboardConversionBar,
} from '@/components/dashboard/DashboardChildSections';
import { CHILD_DASHBOARD_LAYOUT } from '@/constants/child-dashboard-layout';
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
import { remainingOnCard } from '@/lib/challenge/v03ChallengeMath';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatting';
import { getChildShareCardAccess } from '@/lib/api/shareCard';
import { areAllDaysChecked } from '@/lib/onboarding/changeDayChecks';
import { createContextLogger } from '@/utils/logger';

const ChildChallengeSetupOverlay = nextDynamic(
  () =>
    import('@/components/dashboard/challenge/ChildChallengeSetupOverlay').then((m) => ({
      default: m.ChildChallengeSetupOverlay,
    })),
  { ssr: false }
);
const ChildRedemptionOverlay = nextDynamic(
  () =>
    import('@/components/dashboard/challenge/ChildRedemptionOverlay').then((m) => ({
      default: m.ChildRedemptionOverlay,
    })),
  { ssr: false }
);

const logger = createContextLogger('ChildDashboard');

const DOCUMENT_SCREEN_TIME_LABEL = 'תיעוד זמן מסך שבועי';

type ChildDashPhase = 'beforePayment' | 'running' | 'redeem' | 'betweenDeals';

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

type ChildDashboardScreenProps = {
  dashboardData: DashboardState;
  noChallengeExists: boolean;
  challengeEnabled: boolean;
  onRefresh: () => Promise<void>;
  /** Present when opened via ?token= or parent session (optional UI hint). */
  accessMode?: 'token' | 'parent';
  /** Child dashboard URL token — required for private share-card access without parent Auth. */
  dashboardToken?: string | null;
};

function parentDisplayName(parent: DashboardState['parent']): string {
  return parentLabelFromGender(parent.gender);
}

function parentWalletHeadline(parent: DashboardState['parent']): string {
  const label = parentDisplayName(parent);
  const verb = parent.gender === 'female' ? 'תפתח' : 'יפתח';
  return `מחכים ש${label} ${verb} גישה לארנק`;
}

function sundayIndexFromDayName(name: string): number | null {
  const letter = name.replace(/[׳'"]/g, '').charAt(0);
  const idx = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].indexOf(letter);
  return idx >= 0 ? idx : null;
}

function minutesBySundayIndexFromWeek(week: WeekDay[]): number[] {
  const out = [0, 0, 0, 0, 0, 0, 0];
  for (const day of week) {
    if (day.isRedemptionDay) continue;
    const idx = sundayIndexFromDayName(day.dayName);
    if (idx == null) continue;
    out[idx] = Math.round(day.screenTimeMinutes ?? day.screenTimeUsed * 60);
  }
  return out;
}

export function ChildDashboardScreen({
  dashboardData,
  noChallengeExists,
  challengeEnabled,
  onRefresh,
  accessMode: _accessMode,
  dashboardToken = null,
}: ChildDashboardScreenProps) {
  const childName = dashboardData.child.name || 'יואב';
  const comeBackVerb = dashboardData.child.gender === 'girl' ? 'חזרי' : 'חזור';
  const parentLabel = parentDisplayName(dashboardData.parent);
  const gateHeadline = parentWalletHeadline(dashboardData.parent);
  const weeklyEarned = dashboardData.weeklyTotals?.coinsEarned ?? 0;

  const { challenge, challengeNotStarted } = dashboardData;
  const [gateVisible, setGateVisible] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [redemptionOpenOverlay, setRedemptionOpenOverlay] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [comboEnabled, setComboEnabled] = useState(() =>
    areAllDaysChecked(dashboardData.child.changeDayChecks?.[0])
  );
  const [contractImageOpen, setContractImageOpen] = useState(false);
  const [contractImageUrl, setContractImageUrl] = useState<string | null>(null);

  const beforePayment = !challengeEnabled;

  const weeklyBudget = deriveWeeklyBudget(challenge);
  const hourlyRate = deriveHourlyRate(challenge);
  const childDealComplete = isChildDealSetupComplete(challenge);
  const parentChallengeSet = isParentChallengeSet(challenge, noChallengeExists);
  const dealLive = isV03DealLive(challengeEnabled, challenge, challengeNotStarted);
  const parentDealPending = challengeEnabled && parentChallengeSet && !childDealComplete;
  const redemptionOpen =
    dashboardData.weeklyUpload?.status !== 'approved' &&
    canOpenChildRedemption(challengeEnabled, challenge, null, new Date(now));

  const phase: ChildDashPhase = beforePayment
    ? 'beforePayment'
    : parentDealPending
      ? 'betweenDeals'
      : redemptionOpen
        ? 'redeem'
        : dealLive
          ? 'running'
          : 'betweenDeals';

  const ctaEnabled =
    phase === 'redeem' ||
    (challengeEnabled &&
      parentChallengeSet &&
      canOpenChildChallengeSetup(
        challengeEnabled,
        challenge,
        noChallengeExists,
        challengeNotStarted
      ));

  const countdownStart = challenge.startDate ? new Date(challenge.startDate) : null;
  const countdownTarget = getRedemptionCountdownTarget(challenge.startDate);
  const showCountdown = phase === 'running' && Boolean(countdownTarget && countdownStart);
  const countdown = formatCountdown(
    countdownTarget ? countdownTarget.getTime() - now : 0
  );

  const weekMinutes = useMemo(
    () => minutesBySundayIndexFromWeek(dashboardData.week ?? []),
    [dashboardData.week]
  );
  const weekHours = weekMinutes.reduce((sum, minutes) => sum + minutes, 0) / 60;
  const lastEarned =
    weekHours > 0
      ? remainingOnCard(weeklyBudget, weekHours, hourlyRate)
      : weeklyEarned;
  const showLastWeekCard =
    phase === 'betweenDeals' &&
    !parentDealPending &&
    (lastEarned > 0 || weekMinutes.some((minutes) => minutes > 0));

  const cardBalance = beforePayment
    ? 0
    : phase === 'running' || phase === 'redeem'
      ? weeklyBudget
      : lastEarned;

  const conversionMoneyLabel = useMemo(
    () => `המרה ל-₪${formatNumber(hourlyRate || 0, 0)}`,
    [hourlyRate]
  );

  useEffect(() => {
    if (!showCountdown) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [showCountdown]);

  useEffect(() => {
    if (parentDealPending) setSetupOpen(true);
  }, [parentDealPending]);

  useEffect(() => {
    ensurePwaInstallListener();
  }, []);

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
      await persistChildChallengeAccept(dashboardData.parent.id, result);
      await onRefresh();
    },
    [dashboardData.parent.id, onRefresh]
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

  const handleActiveChecksChange = useCallback((checked: boolean[]) => {
    setComboEnabled(areAllDaysChecked(checked));
  }, []);

  const handleCardClick = () => {
    if (beforePayment) setGateVisible(true);
  };

  const handleComboClick = () => {
    if (!comboEnabled) return;
    if (beforePayment) setGateVisible(true);
  };

  const resolveContractImageUrl = useCallback(async (): Promise<string | null> => {
    const parentId = dashboardData.parent.id;
    if (!parentId) return dashboardData.child.shareCardUrl || null;
    try {
      let imageUrl = dashboardData.child.shareCardUrl || '';
      if (dashboardData.child.shareCardStored) {
        const access = await getChildShareCardAccess({
          parentId,
          childId: dashboardData.child.id || undefined,
          dashboardToken,
        });
        imageUrl = access?.url || imageUrl;
      }
      return imageUrl || null;
    } catch (error) {
      logger.warn('Could not resolve contract image:', error);
      return dashboardData.child.shareCardUrl || null;
    }
  }, [
    dashboardData.parent.id,
    dashboardData.child.id,
    dashboardData.child.shareCardUrl,
    dashboardData.child.shareCardStored,
    dashboardToken,
  ]);

  const handleViewContract = useCallback(async () => {
    const imageUrl = await resolveContractImageUrl();
    setContractImageUrl(imageUrl);
    setContractImageOpen(true);
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

  const greetingVariant =
    phase === 'running'
      ? 'running'
      : phase === 'redeem'
        ? 'redeem'
        : showLastWeekCard
          ? 'earned'
          : 'beforePayment';

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
            balance={weeklyEarned}
            walletSide="end"
            menuSlot={<DashboardHeaderMenu variant="child" />}
          />
        </div>
      </DashboardEnter>

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
                width: '100%',
                maxWidth: '100%',
                gap: CHILD_DASHBOARD_LAYOUT.contentGap,
                paddingTop: CHILD_DASHBOARD_LAYOUT.contentTop,
                paddingInline: 24,
              }}
            >
              <DashboardEnter index={1} className="w-full">
                <DashboardSavingsCard
                  balance={cardBalance}
                  dimmed={false}
                  variant="child"
                  onClick={beforePayment ? handleCardClick : undefined}
                />
              </DashboardEnter>

              {phase === 'beforePayment' ? (
                <DashboardEnter index={2} className="w-full">
                  <DashboardChildStartCta
                    onClick={handleStartCta}
                    label="התחלת דיל"
                    disabled
                    waitingCaption={gateHeadline}
                  />
                </DashboardEnter>
              ) : null}

              {phase === 'running' ? (
                <DashboardEnter index={2} className="flex w-full flex-col items-center gap-[15px]">
                  <DashboardChildDealCountdown
                    days={countdown.days}
                    hours={countdown.hours}
                    minutes={countdown.minutes}
                    seconds={countdown.seconds}
                  />
                  <DashboardChildStartCta
                    label={DOCUMENT_SCREEN_TIME_LABEL}
                    disabled
                    waitingIcon={false}
                    waitingCaption={`${childName}, ${comeBackVerb} הנה בסוף השבוע לתעד את זמן המסך!`}
                  />
                </DashboardEnter>
              ) : null}

              {phase === 'redeem' ? (
                <DashboardEnter index={2} className="flex w-full flex-col items-center gap-[15px]">
                  <DashboardChildDealEndedBanner />
                  <DashboardChildStartCta
                    onClick={handleStartCta}
                    label={DOCUMENT_SCREEN_TIME_LABEL}
                    disabled={false}
                    waitingIcon={false}
                    waitingCaption={`${childName}, הגיע הזמן לתעד את זמן המסך!`}
                  />
                </DashboardEnter>
              ) : null}

              {showLastWeekCard ? (
                <DashboardEnter index={2} className="w-full">
                  <DashboardChildWeeklyScreenTimeCard
                    minutesBySundayIndex={weekMinutes}
                    remaining={lastEarned}
                    weeklyBudget={weeklyBudget}
                  />
                </DashboardEnter>
              ) : null}

              <DashboardEnter index={4} className="w-full overflow-visible">
                <DashboardChildGreeting
                  childName={childName}
                  variant={greetingVariant}
                  daysRemaining={countdown.days}
                  earnedAmount={lastEarned}
                />
              </DashboardEnter>

              <DashboardEnter index={5} className="flex w-full flex-col items-center gap-2">
                <DashboardWeekTracker
                  week={dashboardData.week}
                  childName={childName}
                  childId={dashboardData.child.id}
                  parentId={dashboardData.parent.id}
                  changes={dashboardData.child.changes}
                  changeDayChecks={dashboardData.child.changeDayChecks}
                  readOnly
                  titleVariant="child"
                  showCurrentDayDot
                  onActiveChecksChange={handleActiveChecksChange}
                />
                <DashboardConversionBar
                  savedMinutes={0}
                  balance={hourlyRate || weeklyEarned}
                  moneyLabel={conversionMoneyLabel}
                  mode="combo"
                  comboEnabled={comboEnabled}
                  onComboClick={handleComboClick}
                />
              </DashboardEnter>

              <DashboardEnter index={6} className="w-full">
                <DashboardQuickActions
                  variant="child"
                  childName={childName}
                  parentLabel={parentLabel}
                  onViewContract={() => void handleViewContract()}
                  onAddToHome={handleAddToHome}
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

      {setupOpen ? (
        <ChildChallengeSetupOverlay
          visible
          childName={childName}
          parentLabel={parentLabel}
          childGender={dashboardData.child.gender || 'boy'}
          weeklyBudget={weeklyBudget}
          hourlyRate={hourlyRate}
          onClose={() => setSetupOpen(false)}
          onSubmit={handleSetupSubmit}
        />      ) : null}

      {redemptionOpenOverlay ? (
        <ChildRedemptionOverlay
          visible
          childName={childName}
          parentLabel={parentLabel}
          weeklyBudget={weeklyBudget}
          hourlyRate={hourlyRate}
          challengeId={dashboardData.activeChallengeId}
          onClose={() => setRedemptionOpenOverlay(false)}
          onSubmitForParentApproval={handleRedemptionAwaitParent}
          onComplete={handleRedemptionComplete}
        />
      ) : null}

      <DashboardContractImageCard
        visible={contractImageOpen}
        imageUrl={contractImageUrl}
        childName={parentLabel}
        onClose={() => setContractImageOpen(false)}
      />
    </div>
  );
}
