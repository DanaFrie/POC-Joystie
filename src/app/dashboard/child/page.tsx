'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLoadingState } from '@/components/dashboard/ParentDashboardScreen';
import { ChildDashboardScreen } from '@/components/dashboard/ChildDashboardScreen';
import type { DashboardState } from '@/types/dashboard';
import { isLoggedIn, updateLastActivity } from '@/utils/session';
import { getDashboardData } from '@/lib/api/dashboard';
import { generateChildUrl } from '@/utils/url-encoding';
import { getActiveChallenge } from '@/lib/api/challenges';
import { createContextLogger } from '@/utils/logger';
import { getCurrentUserId as getCurrentUserIdAsync, onAuthStateChange } from '@/utils/auth';

const logger = createContextLogger('DashboardChild');

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

export default function DashboardChildPage() {
  const [dashboardData, setDashboardData] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [setupUrl, setSetupUrl] = useState('');
  const [redemptionUrl, setRedemptionUrl] = useState('');
  const [noChallengeExists, setNoChallengeExists] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const checkAuth = async () => {
      try {
        unsubscribe = await onAuthStateChange(async (user) => {
          if (!user) {
            router.push('/login');
            return;
          }
          updateLastActivity();
        });
      } catch {
        if (!isLoggedIn()) router.push('/login');
      }
    };

    checkAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;

    const load = async () => {
      try {
        setIsLoading(true);
        hasLoadedRef.current = true;
        const userId = await getCurrentUserIdAsync();
        if (!userId) {
          router.push('/login');
          return;
        }

        const data = await getDashboardData(userId);
        if (data) {
          setDashboardData(data);
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
              child: { name: '', id: '', profilePicture: '', gender: 'boy' },
            });
            setNoChallengeExists(true);
          } else {
            router.push('/login');
          }
        }
      } catch (err: unknown) {
        logger.error('Error loading child dashboard:', err);
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת הנתונים');
        hasLoadedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    load();
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
            setRedemptionUrl(childUrl);
          } else {
            const childUrl = generateChildUrl(userId);
            setSetupUrl(childUrl);
            setRedemptionUrl(childUrl);
          }
        } else {
          setSetupUrl(`${base}/child`);
          setRedemptionUrl(`${base}/child`);
        }
      } catch {
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        setSetupUrl(`${base}/child`);
        setRedemptionUrl(`${base}/child`);
      }
    };

    if (isLoggedIn()) generateUrls();
  }, []);

  if (isLoading || !dashboardData) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center px-v03-gutter"
        style={{ background: '#061C1E' }}
      >
        <p className="font-simpler text-white">{error}</p>
      </div>
    );
  }

  const childSetupCompleted = Boolean(
    dashboardData.child.nickname &&
      dashboardData.child.moneyGoals &&
      dashboardData.child.moneyGoals.length > 0
  );

  let shareUrl = redemptionUrl;
  if (!childSetupCompleted && setupUrl) shareUrl = setupUrl;

  return (
    <ChildDashboardScreen
      dashboardData={dashboardData}
      shareUrl={shareUrl}
      noChallengeExists={noChallengeExists}
      openGateOnMount={false}
      onStartChallenge={() => router.push('/dashboard')}
    />
  );
}
