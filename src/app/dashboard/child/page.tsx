'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLoadingState } from '@/components/dashboard/ParentDashboardScreen';
import { ChildDashboardScreen } from '@/components/dashboard/ChildDashboardScreen';
import { ChildDashboardErrorState } from '@/components/dashboard/ChildDashboardErrorState';
import type { DashboardState } from '@/types/dashboard';
import { useDashboardSubscribeMode } from '@/hooks/useDashboardSubscribeMode';
import { isLoggedIn, updateLastActivity } from '@/utils/session';
import { getDashboardData } from '@/lib/api/dashboard';
import { validateChildDashboardToken } from '@/lib/auth/childDashboardToken';
import { readChildDashboardTokenFromLocation } from '@/utils/url-encoding';
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
  const token = readChildDashboardTokenFromLocation(searchParams);
  const [noChallengeExists, setNoChallengeExists] = useState(true);
  const [tokenChallengeEnabled, setTokenChallengeEnabled] = useState<boolean | null>(null);
  const [accessMode, setAccessMode] = useState<'token' | 'parent' | null>(null);
  const parentSubscribe = useDashboardSubscribeMode();
  const challengeEnabled =
    tokenChallengeEnabled != null ? tokenChallengeEnabled : parentSubscribe.challengeEnabled;

  const loadForParentId = useCallback(
    async (
      parentId: string,
      force = false,
      parentGenderHint?: 'male' | 'female'
    ) => {
    if (force) {
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      dataCache.invalidate(cacheKeys.dashboard(parentId));
      dataCache.invalidate(cacheKeys.user(parentId));
    }

    const data = await getDashboardData(parentId, !force);
    if (data) {
      const gender =
        data.parent.gender === 'female' || data.parent.gender === 'male'
          ? data.parent.gender
          : parentGenderHint;
      setDashboardData(
        gender && gender !== data.parent.gender
          ? { ...data, parent: { ...data.parent, gender } }
          : data
      );
      setNoChallengeExists(!data.challenge.isActive || !data.activeChallengeId);
      return;
    }

    const { getUser } = await import('@/lib/api/users');
    const user = await getUser(parentId, false);
    if (!user) {
      throw new Error('לא נמצאו נתוני הורה');
    }

    const gender =
      user.gender === 'female' || user.gender === 'male'
        ? user.gender
        : parentGenderHint;

    setDashboardData({
      ...emptyDashboardState,
      parent: {
        name: user.firstName || 'הורה',
        id: user.id || parentId,
        googleAuth: {},
        profilePicture: '',
        gender,
      },
      child: {
        name: '',
        id: user.primaryChildId || '',
        profilePicture: '',
        gender: 'boy',
      },
    });
    setNoChallengeExists(true);
  },
  []
  );

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
        await loadForParentId(access.parentId, force, access.parentGender);
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

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setIsLoading(true);
    loadDashboard()
      .catch((err: unknown) => {
        if (cancelled) return;
        logger.error('Error loading child dashboard:', err);
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת הנתונים');
        setDashboardData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
      noChallengeExists={noChallengeExists}
      challengeEnabled={challengeEnabled}
      onRefresh={refresh}
      accessMode={accessMode ?? undefined}
      dashboardToken={token || null}
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
