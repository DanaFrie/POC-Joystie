'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DashboardLoadingState,
  ParentDashboardScreen,
} from '@/components/dashboard/ParentDashboardScreen';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import type { WeeklyUpload } from '@/types/firestore';
import { isLoggedIn, updateLastActivity } from '@/utils/session';
import { getDashboardData, mergeWeekWithWeeklyUpload } from '@/lib/api/dashboard';
import { generateChildUrl } from '@/utils/url-encoding';
import { getActiveChallenge } from '@/lib/api/challenges';
import type { FirestoreChallenge } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';
import { getFirestoreInstance } from '@/lib/firebase';
import { getCurrentUserId as getCurrentUserIdAsync, onAuthStateChange } from '@/utils/auth';

const logger = createContextLogger('Dashboard');

const emptyDashboardState: DashboardState = {
  parent: {
    name: '',
    id: '',
    googleAuth: {},
    profilePicture: '',
  },
  child: {
    name: '',
    id: '',
    profilePicture: '',
    gender: 'boy',
  },
  challenge: {
    selectedBudget: 0,
    weeklyBudget: 0,
    dailyBudget: 0,
    dailyScreenTimeGoal: 0,
    weekNumber: 0,
    totalWeeks: 0,
    startDate: '',
    isActive: false,
  },
  today: {
    date: '',
    hebrewDate: '',
    screenshotStatus: 'pending',
    screenTimeUsed: 0,
    screenTimeGoal: 0,
    coinsEarned: 0,
    coinsMaxPossible: 0,
    requiresApproval: false,
    uploadedAt: '',
    apps: [],
  },
  week: [],
  weeklyTotals: {
    coinsEarned: 0,
    coinsMaxPossible: 0,
    redemptionDate: '',
    redemptionDay: '',
  },
};

function calculateWeeklyScreenTime(week: WeekDay[]): number {
  return week.reduce((total, day) => total + day.screenTimeUsed, 0);
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openSubscription] = useState(() => searchParams.get('subscription') === '1');

  useEffect(() => {
    if (searchParams.get('subscription') !== '1') return;
    router.replace('/dashboard', { scroll: false });
  }, [searchParams, router]);

  const [setupUrl, setSetupUrl] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [redemptionUrl, setRedemptionUrl] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [consultationCompleted, setConsultationCompleted] = useState<boolean | null>(null);
  const [noChallengeExists, setNoChallengeExists] = useState(false);
  const [weeklyUpload, setWeeklyUpload] = useState<WeeklyUpload | null>(null);
  const [activeChallengeData, setActiveChallengeData] = useState<FirestoreChallenge | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const checkAuth = async () => {
      try {
        unsubscribe = await onAuthStateChange(async (user) => {
          if (!user) {
            logger.warn('User not authenticated, redirecting to login');
            router.push('/login');
            return;
          }
          updateLastActivity();
        });
      } catch (authError) {
        logger.error('Error checking auth state:', authError);
        if (!isLoggedIn()) {
          router.push('/login');
        }
      }
    };

    checkAuth();

    const handleActivity = () => updateLastActivity();
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [router]);

  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        hasLoadedRef.current = true;

        const userId = await getCurrentUserIdAsync();
        if (!userId) {
          logger.warn('User ID not found, redirecting to login');
          router.push('/login');
          return;
        }

        const data = await getDashboardData(userId);

        if (data) {
          setDashboardData(data);

          const isCompleted = data.consultationCompleted ?? false;
          setConsultationCompleted(isCompleted);
          const challengeId = data.activeChallengeId;
          const seenKey = challengeId ? `joystie_complete_modal_seen_${challengeId}` : null;
          if (
            isCompleted &&
            seenKey &&
            typeof window !== 'undefined' &&
            !localStorage.getItem(seenKey)
          ) {
            setShowCompleteModal(true);
          }

          if (typeof window !== 'undefined') {
            localStorage.removeItem('challengeData');
          }
        } else {
          const { getUser } = await import('@/lib/api/users');
          const user = await getUser(userId);

          if (user) {
            setDashboardData({
              ...emptyDashboardState,
              parent: {
                name: user.firstName || 'הורה',
                id: user.id,
                googleAuth: {},
                profilePicture: '',
                gender: user.gender,
              },
              child: {
                name: '',
                id: '',
                profilePicture: '',
                gender: 'boy',
              },
            });
            setNoChallengeExists(true);
          } else {
            router.push('/login');
          }
        }
      } catch (err: unknown) {
        logger.error('Error loading dashboard data:', err);
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('User ID not found') || message.includes('not authenticated')) {
          router.push('/login');
          return;
        }
        setError(message || 'שגיאה בטעינת נתוני הדשבורד. אנא רענן את הדף.');
        hasLoadedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  useEffect(() => {
    const generateUrls = async () => {
      try {
        const userId = await getCurrentUserIdAsync();
        const base = typeof window !== 'undefined' ? window.location.origin : '';

        if (userId) {
          const challenge = await getActiveChallenge(userId);
          if (challenge) {
            const childUrl = generateChildUrl(userId, challenge.childId, challenge.id);
            setSetupUrl(childUrl);
            setUploadUrl(childUrl);
            setRedemptionUrl(childUrl);
          } else {
            const childUrl = generateChildUrl(userId);
            setSetupUrl(childUrl);
            setUploadUrl(childUrl);
            setRedemptionUrl(childUrl);
          }
        } else {
          setSetupUrl(`${base}/child`);
          setUploadUrl(`${base}/child`);
          setRedemptionUrl(`${base}/child`);
        }
      } catch (urlError) {
        logger.error('Error generating URLs:', urlError);
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        setSetupUrl(`${base}/child`);
        setUploadUrl(`${base}/child`);
        setRedemptionUrl(`${base}/child`);
      }
    };

    if (isLoggedIn()) {
      generateUrls();
    }
  }, []);

  useEffect(() => {
    if (!dashboardData?.challenge) return;

    let unsubscribe: (() => void) | null = null;

    const setupWeeklyUploadListener = async () => {
      try {
        const userId = await getCurrentUserIdAsync();
        if (!userId) return;

        const challenge = await getActiveChallenge(userId);
        if (!challenge) return;

        setActiveChallengeData(challenge);
        if (challenge.weeklyUpload) {
          setWeeklyUpload(challenge.weeklyUpload);
        }

        const { doc, onSnapshot } = await import('firebase/firestore');
        const db = await getFirestoreInstance();
        const challengeRef = doc(db, 'challenges', challenge.id);

        unsubscribe = onSnapshot(challengeRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as FirestoreChallenge;
            if (data.weeklyUpload) {
              setWeeklyUpload(data.weeklyUpload);
              setActiveChallengeData(data);
            }
          }
        });
      } catch (listenerError) {
        logger.error('Error setting up weekly upload listener:', listenerError);
      }
    };

    setupWeeklyUploadListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dashboardData?.challenge]);

  const handleApproveWeeklyUpload = async () => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) throw new Error('User ID not found');

      const challenge = await getActiveChallenge(userId);
      if (!challenge) throw new Error('No active challenge found');

      const { approveWeeklyUpload } = await import('@/lib/api/challenges');
      await approveWeeklyUpload(challenge.id);

      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      dataCache.invalidate(cacheKeys.dashboard(userId));

      const updatedData = await getDashboardData(userId, false);
      if (updatedData) {
        setDashboardData(updatedData);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('weeklyUploadApproved'));
      }
    } catch (approveError) {
      logger.error('Error approving weekly upload:', approveError);
      setError('שגיאה באישור ההעלאה. אנא רענן את הדף.');
    }
  };

  const handleRejectWeeklyUpload = async () => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) throw new Error('User ID not found');

      const challenge = await getActiveChallenge(userId);
      if (!challenge) throw new Error('No active challenge found');

      const { rejectWeeklyUpload } = await import('@/lib/api/challenges');
      await rejectWeeklyUpload(challenge.id);

      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      dataCache.invalidate(cacheKeys.dashboard(userId));

      const updatedData = await getDashboardData(userId, false);
      if (updatedData) {
        setDashboardData(updatedData);
      }
    } catch (rejectError) {
      logger.error('Error rejecting weekly upload:', rejectError);
      setError('שגיאה בדחיית ההעלאה. אנא רענן את הדף.');
    }
  };

  const handleCloseCompleteModal = () => {
    const challengeId = dashboardData?.activeChallengeId;
    if (challengeId && typeof window !== 'undefined') {
      localStorage.setItem(`joystie_complete_modal_seen_${challengeId}`, '1');
    }
    setShowCompleteModal(false);
  };

  if (isLoading || !dashboardData) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center px-v03-gutter"
        style={{ background: '#061C1E' }}
      >
        <div className="w-full max-w-sm rounded-[18px] border border-white/15 bg-white/5 p-6 text-center backdrop-blur-sm">
          <h2 className="mb-4 font-simpler text-[20px] font-black text-white">
            שגיאה בטעינת הנתונים
          </h2>
          <p className="mb-6 font-simpler text-[14px] text-v03-green-100">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-[18px] bg-white px-6 py-3 font-simpler text-[16px] font-bold text-v03-green-900"
          >
            רענן דף
          </button>
        </div>
      </div>
    );
  }

  const displayWeek =
    dashboardData.week?.length && weeklyUpload?.processedData?.minutesPerDay && activeChallengeData
      ? mergeWeekWithWeeklyUpload(dashboardData.week, weeklyUpload, activeChallengeData)
      : dashboardData.week;

  return (
    <ParentDashboardScreen
      dashboardData={dashboardData}
      displayWeek={displayWeek}
      totalWeeklyHours={calculateWeeklyScreenTime(displayWeek)}
      weeklyUpload={weeklyUpload}
      activeChallengeData={activeChallengeData}
      setupUrl={setupUrl}
      uploadUrl={uploadUrl}
      redemptionUrl={redemptionUrl}
      consultationCompleted={consultationCompleted}
      noChallengeExists={noChallengeExists}
      onApproveWeeklyUpload={handleApproveWeeklyUpload}
      onRejectWeeklyUpload={handleRejectWeeklyUpload}
      showCompleteModal={showCompleteModal}
      onCloseCompleteModal={handleCloseCompleteModal}
      initialSubscriptionOpen={openSubscription}
    />
  );
}
