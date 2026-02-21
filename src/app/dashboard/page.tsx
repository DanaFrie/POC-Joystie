'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import type { WeeklyUpload } from '@/types/firestore';
import { isLoggedIn, updateLastActivity, getCurrentUserId } from '@/utils/session';
import { formatNumber } from '@/utils/formatting';
import { getDashboardData, mergeWeekWithWeeklyUpload } from '@/lib/api/dashboard';
import { generateChildUrl } from '@/utils/url-encoding';
import { getActiveChallenge } from '@/lib/api/challenges';
import type { FirestoreChallenge, FirestoreDailyUpload } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Dashboard');

/**
 * Helper: Transform FirestoreChallenge to Challenge type with ID
 */
function transformChallengeWithId(firestoreChallenge: FirestoreChallenge): DashboardState['challenge'] & { id: string } {
  return {
    selectedBudget: firestoreChallenge.selectedBudget,
    weeklyBudget: firestoreChallenge.selectedBudget, // weeklyBudget equals selectedBudget
    dailyBudget: firestoreChallenge.dailyBudget,
    dailyScreenTimeGoal: firestoreChallenge.dailyScreenTimeGoal,
    weekNumber: firestoreChallenge.weekNumber,
    totalWeeks: firestoreChallenge.totalWeeks,
    startDate: firestoreChallenge.startDate,
    isActive: firestoreChallenge.isActive,
    id: firestoreChallenge.id
  };
}
import { getFirestoreInstance } from '@/lib/firebase';
import CompleteContent from '@/components/onboarding/CompleteContent';
import { getCurrentUserId as getCurrentUserIdAsync, onAuthStateChange, isAuthenticated } from '@/utils/auth';
import { clientConfig } from '@/config/client.config';

// Empty initial state - will be populated from Firestore only
const emptyDashboardState: DashboardState = {
  parent: {
    name: '',
    id: '',
    googleAuth: {},
    profilePicture: ''
  },
  child: {
    name: '',
    id: '',
    profilePicture: '',
    gender: 'boy'
  },
  challenge: {
    selectedBudget: 0,
    weeklyBudget: 0,
    dailyBudget: 0,
    dailyScreenTimeGoal: 0,
    weekNumber: 0,
    totalWeeks: 0,
    startDate: '',
    isActive: false
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
    apps: []
  },
  week: [],
  weeklyTotals: {
    coinsEarned: 0,
    coinsMaxPossible: 0,
    redemptionDate: '',
    redemptionDay: ''
  }
};

// Calculate total weekly screen time
function calculateWeeklyScreenTime(week: WeekDay[]): number {
  return week.reduce((total, day) => total + day.screenTimeUsed, 0);
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Check Firebase Auth state on mount - simplified
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const checkAuth = async () => {
      try {
        // Single auth check - onAuthStateChange handles everything
        unsubscribe = await onAuthStateChange(async (user) => {
          if (!user) {
            // Not authenticated - redirect to login
            logger.warn('User not authenticated, redirecting to login');
            router.push('/login');
            return;
          }
          
          // User is authenticated - update activity
          updateLastActivity();
        });
      } catch (error) {
        logger.error('Error checking auth state:', error);
        // Fallback: check localStorage session only
        if (!isLoggedIn()) {
          router.push('/login');
        }
      }
    };
    
    checkAuth();
    
    // Set up activity tracking
    const handleActivity = () => {
      updateLastActivity();
    };
    
    // Track user activity
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    // Removed periodic session check - onAuthStateChange handles this automatically
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [router]);
  
  // Load dashboard data from Firestore - prevent double loading
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        hasLoadedRef.current = true;
        
        // Single check - onAuthStateChange already verified auth
        const userId = await getCurrentUserIdAsync();
        if (!userId) {
          logger.warn('User ID not found, redirecting to login');
          router.push('/login');
          return;
        }
        
        logger.log('Got user ID:', userId);
        
        const data = await getDashboardData(userId);
        
        if (data) {
          logger.log('✅ Loaded data from Firestore:', data);
          setDashboardData(data);
          
          // Consultation status is included in dashboard data (from active or latest pending challenge)
          const isCompleted = data.consultationCompleted ?? false;
          setConsultationCompleted(isCompleted);
          if (isCompleted) {
            setShowCompleteModal(true);
          }
          
          // Clean up temporary challengeData from localStorage after successful load
          if (typeof window !== 'undefined') {
            localStorage.removeItem('challengeData');
            logger.log('Cleaned up challengeData from localStorage');
          }
        } else {
          // No active challenge - show dashboard with "create challenge" notification
          // This is the new flow: after registration, user goes to dashboard and can set up challenge from there
          logger.log('No active challenge found, showing dashboard with create challenge notification');
          
          // Get user data to show personalized dashboard
          const { getUser } = await import('@/lib/api/users');
          const user = await getUser(userId);
          
          if (user) {
            // Create minimal dashboard state for users without a challenge
            const minimalDashboardData: DashboardState = {
              ...emptyDashboardState,
              parent: {
                name: user.firstName || user.username || 'הורה',
                id: user.id,
                googleAuth: {},
                profilePicture: '',
                gender: user.gender
              },
              child: {
                name: '',
                id: '',
                profilePicture: '',
                gender: 'boy'
              }
            };
            setDashboardData(minimalDashboardData);
            setNoChallengeExists(true);
          } else {
            // User not found - redirect to login
            logger.warn('User not found, redirecting to login');
            router.push('/login');
          }
          return;
        }
      } catch (err: any) {
        logger.error('❌ Error loading dashboard data:', err);
        
        // If it's an auth error, redirect to login
        if (err.message?.includes('User ID not found') || err.message?.includes('not authenticated')) {
          logger.warn('Authentication error, redirecting to login');
          router.push('/login');
          return;
        }
        
        setError(err.message || 'שגיאה בטעינת נתוני הדשבורד. אנא רענן את הדף.');
        hasLoadedRef.current = false; // Allow retry on error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [router]);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [setupUrl, setSetupUrl] = useState<string>('');
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [redemptionUrl, setRedemptionUrl] = useState<string>('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [consultationCompleted, setConsultationCompleted] = useState<boolean | null>(null);
  const [noChallengeExists, setNoChallengeExists] = useState(false);
  
  // Weekly upload state (approval is inline in WeeklyProgress, no modal)
  const [weeklyUpload, setWeeklyUpload] = useState<WeeklyUpload | null>(null);
  const [activeChallengeData, setActiveChallengeData] = useState<FirestoreChallenge | null>(null);

  // Generate URLs with tokens
  useEffect(() => {
    const generateUrls = async () => {
      try {
        const userId = await getCurrentUserIdAsync();
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
          const base = typeof window !== 'undefined' ? window.location.origin : '';
          setSetupUrl(`${base}/child`);
          setUploadUrl(`${base}/child`);
          setRedemptionUrl(`${base}/child`);
        }
      } catch (error) {
        logger.error('Error generating URLs:', error);
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        setSetupUrl(`${base}/child`);
        setUploadUrl(`${base}/child`);
        setRedemptionUrl(`${base}/child`);
      }
    };

    if (isLoggedIn()) {
      generateUrls();
    }
    // Remove dashboardData dependency - URLs don't depend on dashboard data
  }, []);

  // Note: Child uploads are now handled via Firestore real-time updates
  // No localStorage listeners needed - data comes from Firestore

  // Load weekly upload data and listen for changes
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
        
        // Set initial weekly upload state
        if (challenge.weeklyUpload) {
          setWeeklyUpload(challenge.weeklyUpload);
        }
        
        // Set up real-time listener
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
      } catch (error) {
        logger.error('Error setting up weekly upload listener:', error);
      }
    };
    
    setupWeeklyUploadListener();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [dashboardData?.challenge]);

  // Handle weekly upload approval (called from inline review in WeeklyProgress)
  const handleApproveWeeklyUpload = async () => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) throw new Error('User ID not found');
      
      const challenge = await getActiveChallenge(userId);
      if (!challenge) throw new Error('No active challenge found');
      
      const { approveWeeklyUpload } = await import('@/lib/api/challenges');
      await approveWeeklyUpload(challenge.id);
      
      // Invalidate cache and reload
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      dataCache.invalidate(cacheKeys.dashboard(userId));
      
      const updatedData = await getDashboardData(userId, false);
      if (updatedData) {
        setDashboardData(updatedData);
      }
      
      // Notify child redemption page
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('weeklyUploadApproved'));
      }
    } catch (error) {
      logger.error('Error approving weekly upload:', error);
      setError('שגיאה באישור ההעלאה. אנא רענן את הדף.');
    }
  };

  // Handle weekly upload rejection
  const handleRejectWeeklyUpload = async (reason: string) => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) throw new Error('User ID not found');
      
      const challenge = await getActiveChallenge(userId);
      if (!challenge) throw new Error('No active challenge found');
      
      const { rejectWeeklyUpload } = await import('@/lib/api/challenges');
      await rejectWeeklyUpload(challenge.id, reason);
      
      // Invalidate cache and reload
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      dataCache.invalidate(cacheKeys.dashboard(userId));
      
      const updatedData = await getDashboardData(userId, false);
      if (updatedData) {
        setDashboardData(updatedData);
      }
    } catch (error) {
      logger.error('Error rejecting weekly upload:', error);
      setError('שגיאה בדחיית ההעלאה. אנא רענן את הדף.');
    }
  };



  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="font-varela text-lg text-[#262135] mb-4">טוען נתונים...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#262135] mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show error state - NO FALLBACK DATA
  if (error) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4">
              שגיאה בטעינת הנתונים
            </h2>
            <p className="font-varela text-base text-[#282743] mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="w-full py-3 px-6 rounded-[18px] bg-[#273143] text-white font-varela font-semibold hover:bg-opacity-90 transition-all"
            >
              רענן דף
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading if no data yet
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="font-varela text-lg text-[#262135] mb-4">טוען נתונים...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#262135] mx-auto"></div>
        </div>
      </div>
    );
  }

  // When weeklyUpload has per-day data (from real-time listener), merge it into the week so the bar chart fills
  const displayWeek =
    dashboardData.week?.length && weeklyUpload?.processedData?.minutesPerDay && activeChallengeData
      ? mergeWeekWithWeeklyUpload(dashboardData.week, weeklyUpload, activeChallengeData)
      : dashboardData.week;
  const totalWeeklyHours = calculateWeeklyScreenTime(displayWeek);

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* Mobile: Scrollable with side padding to show gradient */}
      <div className="lg:hidden overflow-x-hidden px-2 py-4 overflow-y-visible w-full" style={{ border: 'none', outline: 'none' }}>
        <div className="w-full max-w-md mx-auto px-4 pb-0" style={{ border: 'none', outline: 'none' }}>
          {/* 1. היי, [שם הורה] עם פיגי בצד השמאלי */}
          <div className="mb-2 relative flex items-center justify-between">
            <h1 className="font-varela font-semibold text-2xl text-[#262135]">
              היי, {dashboardData.parent.name}
            </h1>
            <div className="flex-shrink-0">
              <Image
                src="/piggy-bank.png"
                alt="Piggy Bank"
                width={100}
                height={100}
                className="object-contain w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 max-w-[120px] sm:max-w-[160px] md:max-w-[200px]"
                priority
              />
            </div>
          </div>

          {/* תיבת עדכונים */}
          <div style={{ marginBottom: '9.6px' }}>
              <NotificationsPanel 
              challengeNotStarted={dashboardData.challengeNotStarted}
              challengeStartDate={dashboardData.challengeStartDate}
              childName={dashboardData.child.name}
              childGender={dashboardData.child.gender}
              parentName={dashboardData.parent.name}
              parentGender={dashboardData.parent.gender}
              setupUrl={setupUrl}
              uploadUrl={uploadUrl}
              redemptionUrl={redemptionUrl}
              weeklyUpload={weeklyUpload}
              onOpenWeeklyReview={undefined}
              childSetupCompleted={!!(dashboardData.child.nickname && dashboardData.child.moneyGoals && dashboardData.child.moneyGoals.length > 0)}
              consultationCompleted={consultationCompleted ?? undefined}
              noChallengeExists={noChallengeExists}
            />
          </div>

          {/* 2. סטטוס שבועי */}
          <div className="mb-6">
            <WeeklyProgress
              week={displayWeek}
              totals={dashboardData.weeklyTotals}
              childName={dashboardData.child.name}
              childGender={dashboardData.child.gender as 'boy' | 'girl' | undefined}
              totalWeeklyHours={totalWeeklyHours}
              weeklyBudget={dashboardData.challenge.weeklyBudget}
              dailyBudget={dashboardData.challenge.dailyBudget}
              weeklyUpload={weeklyUpload}
              challenge={activeChallengeData}
              onApprove={handleApproveWeeklyUpload}
              onReject={handleRejectWeeklyUpload}
            />
          </div>

           {/* Complete Content Modal - Show if consultation completed */}
          {showCompleteModal && dashboardData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-[18px] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="absolute top-4 left-4 text-[#273143] hover:text-[#262135] text-2xl font-bold z-10"
                >
                  ×
                </button>
                <CompleteContent
                  childName={dashboardData.child.name}
                  childGender={dashboardData.child.gender || 'boy'}
                  childId={dashboardData.child.id}
                  onClose={() => setShowCompleteModal(false)}
                />
              </div>
            </div>
            )}

          {/* 6. תיבה עם פירוט נתוני האתגר - Collapsible */}
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card overflow-hidden mb-0" style={{ boxShadow: 'none' }}>
            <button
              onClick={() => setIsChallengeOpen(!isChallengeOpen)}
              className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-varela font-semibold text-base text-[#282743]">
                פרטי האתגר
              </h3>
              <span className="font-varela text-[#282743]">
                {isChallengeOpen ? '▲' : '▼'}
              </span>
            </button>

            {isChallengeOpen && (() => {
              const challenge = dashboardData.challenge;
              const hourlyRate = challenge.dailyScreenTimeGoal > 0 ? challenge.dailyBudget / challenge.dailyScreenTimeGoal : 0;
              const weeklyHours = challenge.dailyScreenTimeGoal * clientConfig.challenge.challengeDays;
              
              return (
                <div className="px-4 pb-4 space-y-4">
                    {/* Budget Summary */}
                    <div className="bg-[#BBE9FD] bg-opacity-30 rounded-[18px] p-4 mb-4">
                      <h4 className="font-varela font-semibold text-base text-[#273143] mb-3 text-center">תקציב שבועי</h4>
                      <div className="flex items-center justify-center">
                        <div className="font-varela font-bold text-3xl text-[#273143]">₪{formatNumber(challenge.weeklyBudget, 0)}</div>
                      </div>
                    </div>

                    {/* Stats List - Compact */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">תקציב יומי</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">₪{formatNumber(challenge.dailyBudget)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">עלות שעת חריגה</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">₪{formatNumber(hourlyRate)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">יעד זמן מסך יומי</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">{formatNumber(challenge.dailyScreenTimeGoal * 60)} {challenge.dailyScreenTimeGoal * 60 === 1 ? 'דקה' : 'דקות'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">סה"כ שעות שבועיות</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">{formatNumber(weeklyHours)} שעות</span>
                      </div>
                    </div>

                    {/* Progress Bar for Week */}
                    <div className="bg-[#FFFCF8] rounded-[18px] p-4 border-2 border-[#E6F19A]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-varela font-semibold text-sm text-[#273143]">שבוע נוכחי</span>
                        <span className="font-varela font-bold text-base text-[#273143]">{challenge.weekNumber} / {challenge.totalWeeks}</span>
                      </div>
                      <div className="w-full bg-[#E4E4E4] rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#E6F19A] to-[#BBE9FD] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(challenge.weekNumber / challenge.totalWeeks) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Desktop: Layout */}
      <div className="hidden lg:block lg:py-4">
        {/* 1. היי, [שם הורה] עם פיגי בצד השמאלי */}
        <div className="mb-2 relative flex items-center justify-between">
          <h1 className="font-varela font-semibold text-2xl text-[#262135]">
            היי, {dashboardData.parent.name}
          </h1>
          <div className="flex-shrink-0">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={100}
              height={100}
                className="object-contain w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 max-w-[120px] sm:max-w-[160px] md:max-w-[200px]"
              priority
            />
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left column - Updates and Weekly Progress */}
          <div className="col-span-5">
            {/* תיבת עדכונים */}
            <div style={{ marginBottom: '9.6px' }}>
              <NotificationsPanel 
                challengeNotStarted={dashboardData.challengeNotStarted}
                challengeStartDate={dashboardData.challengeStartDate}
                childName={dashboardData.child.name}
                childGender={dashboardData.child.gender}
                parentName={dashboardData.parent.name}
                parentGender={dashboardData.parent.gender}
                setupUrl={setupUrl}
                uploadUrl={uploadUrl}
                redemptionUrl={redemptionUrl}
                weeklyUpload={weeklyUpload}
                onOpenWeeklyReview={undefined}
                childSetupCompleted={!!(dashboardData.child.nickname && dashboardData.child.moneyGoals && dashboardData.child.moneyGoals.length > 0)}
                consultationCompleted={consultationCompleted ?? undefined}
                noChallengeExists={noChallengeExists}
              />
            </div>

            {/* 2. סטטוס שבועי */}
            <div>
              <WeeklyProgress
                week={displayWeek}
                totals={dashboardData.weeklyTotals}
                childName={dashboardData.child.name}
                totalWeeklyHours={totalWeeklyHours}
                weeklyBudget={dashboardData.challenge.weeklyBudget}
                dailyBudget={dashboardData.challenge.dailyBudget}
                weeklyUpload={weeklyUpload}
                challenge={activeChallengeData}
                onApprove={handleApproveWeeklyUpload}
                onReject={handleRejectWeeklyUpload}
              />
            </div>
          </div>

          {/* Right column - Summary and Challenge Details */}
          <div className="col-span-7 space-y-6">

            {/* 6. תיבה עם פירוט נתוני האתגר - Always open on desktop */}
            <div className="bg-[#FFFCF8] rounded-[18px] shadow-card overflow-hidden">
              <div className="w-full p-4">
                <h3 className="font-varela font-semibold text-base text-[#282743]">
                  פרטי האתגר
                </h3>
              </div>
              
              {(() => {
                const challenge = dashboardData.challenge;
                const hourlyRate = challenge.dailyScreenTimeGoal > 0 ? challenge.dailyBudget / challenge.dailyScreenTimeGoal : 0;
                const weeklyHours = challenge.dailyScreenTimeGoal * clientConfig.challenge.challengeDays;
                
                return (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Budget Summary */}
                    <div className="bg-[#BBE9FD] bg-opacity-30 rounded-[18px] p-4 mb-4">
                      <h4 className="font-varela font-semibold text-base text-[#273143] mb-3 text-center">תקציב שבועי</h4>
                      <div className="flex items-center justify-center">
                        <div className="font-varela font-bold text-3xl text-[#273143]">₪{formatNumber(challenge.weeklyBudget, 0)}</div>
                      </div>
                    </div>

                    {/* Stats List - Compact */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">תקציב יומי</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">₪{formatNumber(challenge.dailyBudget)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">עלות שעת חריגה</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">₪{formatNumber(hourlyRate)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">יעד זמן מסך יומי</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">{formatNumber(challenge.dailyScreenTimeGoal * 60)} {challenge.dailyScreenTimeGoal * 60 === 1 ? 'דקה' : 'דקות'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">סה"כ שעות שבועיות</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">{formatNumber(weeklyHours)} שעות</span>
                      </div>
                    </div>

                    {/* Progress Bar for Week */}
                    <div className="bg-[#FFFCF8] rounded-[18px] p-4 border-2 border-[#E6F19A]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-varela font-semibold text-sm text-[#273143]">שבוע נוכחי</span>
                        <span className="font-varela font-bold text-base text-[#273143]">{challenge.weekNumber} / {challenge.totalWeeks}</span>
                      </div>
                      <div className="w-full bg-[#E4E4E4] rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#E6F19A] to-[#BBE9FD] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(challenge.weekNumber / challenge.totalWeeks) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}