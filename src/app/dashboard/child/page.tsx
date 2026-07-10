'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLoadingState } from '@/components/dashboard/ParentDashboardScreen';
import { ChildDashboardScreen } from '@/components/dashboard/ChildDashboardScreen';
import { ChildDashboardErrorState } from '@/components/dashboard/ChildDashboardErrorState';
import type { DashboardState } from '@/types/dashboard';
import { useDashboardSubscribeMode } from '@/hooks/useDashboardSubscribeMode';
import { isLoggedIn, updateLastActivity } from '@/utils/session';
import { getDashboardData } from '@/lib/api/dashboard';
import { generateChildUrl } from '@/utils/url-encoding';
import { getActiveChallenge } from '@/lib/api/challenges';
import { validateChildDashboardToken } from '@/lib/auth/childDashboardToken';
import { createContextLogger } from '@/utils/logger';
import { getCurrentUserId as getCurrentUserIdAsync, onAuthStateChange } from '@/utils/auth';

const logger = createContextLogger('DashboardChild');

const emptyDashboardState: DashboardState = {
  parent: { name: '', id: '', googleAuth: {}, profilePicture: '' },
  child: { name: '', id: '', profilePicture: '', gender: 'boy' },
  challenge: {
    selectedBudget: 0,
    weeklyBudget: 0,
    weekNumber: 0,
    startDate: '',
    isActive: false,
    challengeDays: 6,
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

function DashboardChildPageContent() {
  const [dashboardData, setDashboardData] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token')?.trim() || '';
  const [shareUrl, setShareUrl] = useState('');
  const [noChallengeExists, setNoChallengeExists] = useState(true);
  const [tokenChallengeEnabled, setTokenChallengeEnabled] = useState<boolean | null>(null);
  const [accessMode, setAccessMode] = useState<'token' | 'parent' | null>(null);
  const parentSubscribe = useDashboardSubscribeMode();
  const challengeEnabled =
    tokenChallengeEnabled != null ? tokenChallengeEnabled : parentSubscribe.challengeEnabled;

  const loadForParentId = useCallback(async (parentId: string, force = false) => {
    if (force) {
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      dataCache.invalidate(cacheKeys.dashboard(parentId));
    }

    const data = await getDashboardData(parentId, !force);
    if (data) {
      setDashboardData(data);
      setNoChallengeExists(!data.challenge.isActive || !data.activeChallengeId);
      const challenge = await getActiveChallenge(parentId, false);
      setShareUrl(
        challenge
          ? generateChildUrl(parentId, challenge.childId)
          : generateChildUrl(parentId, data.child.id || undefined)
      );
      return;
    }

    const { getUser } = await import('@/lib/api/users');
    const user = await getUser(parentId, false);
    if (!user) {
      throw new Error('לא נמצאו נתוני הורה');
    }

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
        id: user.primaryChildId || '',
        profilePicture: '',
        gender: 'boy',
      },
    });
    setNoChallengeExists(true);
    setShareUrl(generateChildUrl(parentId, user.primaryChildId || undefined));
  }, []);

  const loadDashboard = useCallback(
    async (force = false) => {
      if (token) {
        const access = await validateChildDashboardToken(token);
        if (!access.isValid || !access.parentId) {
          setError(access.error || 'כתובת לא תקינה');
          setDashboardData(null);
          return;
        }
        setAccessMode('token');
        setTokenChallengeEnabled(Boolean(access.challengeEnabled));
        await loadForParentId(access.parentId, force);
        return;
      }

      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        setError('יש לפתוח את הקישור שקיבלת מההורה, או להתחבר כהורה.');
        setDashboardData(null);
        return;
      }

      setAccessMode('parent');
      setTokenChallengeEnabled(null);
      await loadForParentId(userId, force);
    },
    [token, loadForParentId]
  );

  useEffect(() => {
    // Token access — no parent Auth required.
    if (token) return;

    let unsubscribe: (() => void) | null = null;
    const checkAuth = async () => {
      try {
        unsubscribe = await onAuthStateChange(async (user) => {
          if (!user) {
            // Stay on page with error — do not bounce child to parent login.
            if (!isLoggedIn()) {
              setError('יש לפתוח את הקישור שקיבלת מההורה, או להתחבר כהורה.');
            }
          } else {
            updateLastActivity();
          }
        });
      } catch {
        if (!isLoggedIn()) {
          setError('יש לפתוח את הקישור שקיבלת מההורה, או להתחבר כהורה.');
        }
      }
    };
    void checkAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [token, router]);

  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setIsLoading(true);
    loadDashboard()
      .catch((err: unknown) => {
        logger.error('Error loading child dashboard:', err);
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת הנתונים');
        hasLoadedRef.current = false;
      })
      .finally(() => setIsLoading(false));
  }, [loadDashboard]);

  const refresh = useCallback(async () => {
    await loadDashboard(true);
  }, [loadDashboard]);

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (error || !dashboardData) {
    return <ChildDashboardErrorState detail={error} />;
  }

  return (
    <ChildDashboardScreen
      dashboardData={dashboardData}
      shareUrl={shareUrl}
      noChallengeExists={noChallengeExists}
      challengeEnabled={challengeEnabled}
      onRefresh={refresh}
      accessMode={accessMode ?? undefined}
    />
  );
}

export default function DashboardChildPage() {
  return (
    <Suspense fallback={<DashboardLoadingState />}>
      <DashboardChildPageContent />
    </Suspense>
  );
}
