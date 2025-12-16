'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import DayInfoModal from '@/components/dashboard/DayInfoModal';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import DaysSummaryModal from '@/components/dashboard/DaysSummaryModal';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import { checkGoalMet } from '@/utils/notifications';
import { isLoggedIn, updateLastActivity, getCurrentUserId } from '@/utils/session';
import { formatNumber } from '@/utils/formatting';
import { getDashboardData } from '@/lib/api/dashboard';
import { generateUploadUrl, generateRedemptionUrl, generateSetupUrl } from '@/utils/url-encoding';
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
import { batchApproveUpload, getUploadByDate } from '@/lib/api/uploads';
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
          
          // Clean up temporary challengeData from localStorage after successful load
          if (typeof window !== 'undefined') {
            localStorage.removeItem('challengeData');
            logger.log('Cleaned up challengeData from localStorage');
          }
        } else {
          // No active challenge - redirect to onboarding
          logger.warn('⚠️ No active challenge found, redirecting to onboarding');
          setError('לא נמצא אתגר פעיל. אנא צור אתגר חדש.');
          setTimeout(() => {
            router.push('/onboarding');
          }, 2000);
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
  const [selectedDay, setSelectedDay] = useState<WeekDay | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryDays, setSummaryDays] = useState<WeekDay[]>([]);
  const [setupUrl, setSetupUrl] = useState<string>('');
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [redemptionUrl, setRedemptionUrl] = useState<string>('');

  // Generate URLs with tokens
  useEffect(() => {
    const generateUrls = async () => {
      try {
        const userId = await getCurrentUserIdAsync();
        if (userId) {
          const challenge = await getActiveChallenge(userId);
          if (challenge) {
            const setup = generateSetupUrl(userId, challenge.childId, challenge.id);
            const upload = generateUploadUrl(userId, challenge.childId, challenge.id);
            const redemption = generateRedemptionUrl(userId, challenge.childId, challenge.id);
            setSetupUrl(setup);
            setUploadUrl(upload);
            setRedemptionUrl(redemption);
          } else {
            // Fallback
            const setup = generateSetupUrl(userId);
            const upload = generateUploadUrl(userId);
            const redemption = generateRedemptionUrl(userId);
            setSetupUrl(setup);
            setUploadUrl(upload);
            setRedemptionUrl(redemption);
          }
        } else {
          setSetupUrl(typeof window !== 'undefined' ? `${window.location.origin}/child/setup` : '');
          setUploadUrl(typeof window !== 'undefined' ? `${window.location.origin}/child/upload` : '');
          setRedemptionUrl(typeof window !== 'undefined' ? `${window.location.origin}/child/redemption` : '');
        }
      } catch (error) {
        logger.error('Error generating URLs:', error);
        // Fallback
        setSetupUrl(typeof window !== 'undefined' ? `${window.location.origin}/child/setup` : '');
        setUploadUrl(typeof window !== 'undefined' ? `${window.location.origin}/child/upload` : '');
        setRedemptionUrl(typeof window !== 'undefined' ? `${window.location.origin}/child/redemption` : '');
      }
    };

    if (isLoggedIn()) {
      generateUrls();
    }
    // Remove dashboardData dependency - URLs don't depend on dashboard data
  }, []);

  // Note: Child uploads are now handled via Firestore real-time updates
  // No localStorage listeners needed - data comes from Firestore

  const handleDayClick = (day: WeekDay) => {
    // Don't open modal for redemption day
    if (day.isRedemptionDay) {
      return;
    }
    // All other days are clickable - open single day modal
    setSelectedDay(day);
    setShowApprovalModal(true);
  };

  const handleOpenSummary = (days: WeekDay[]) => {
    setSummaryDays(days);
    setShowSummaryModal(true);
  };

  const handleApprove = async (dayDate: string, manualScreenTimeMinutes?: number) => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Use cached challenge if available (from dashboardData)
      type ChallengeWithId = DashboardState['challenge'] & { id?: string };
      let challenge: ChallengeWithId | null = dashboardData?.challenge ? {
        id: '', // Will be set from getActiveChallenge
        ...dashboardData.challenge
      } : null;
      
      // Only fetch if we don't have challenge data or need the ID
      if (!challenge || !challenge.id) {
        const firestoreChallenge = await getActiveChallenge(userId);
        if (!firestoreChallenge) {
          throw new Error('No active challenge found');
        }
        challenge = transformChallengeWithId(firestoreChallenge);
      }

      // Find the upload for this date
      if (!challenge.id) {
        throw new Error('Challenge ID is required');
      }
      logger.log(`Looking for upload:`, { challengeId: challenge.id, dayDate, userId });
      const upload = await getUploadByDate(challenge.id, dayDate, userId);
      if (!upload) {
        throw new Error('Upload not found for this date');
      }
      logger.log(`Found upload before approval:`, {
        id: upload.id,
        date: upload.date,
        challengeId: upload.challengeId,
        requiresApproval: upload.requiresApproval,
        parentAction: upload.parentAction,
        success: upload.success,
        uploadedAt: upload.uploadedAt,
        updatedAt: upload.updatedAt
      });

      // Prepare manual updates if provided
      let manualUpdates: Partial<Omit<FirestoreDailyUpload, 'id' | 'createdAt'>> | undefined;
      if (manualScreenTimeMinutes !== undefined) {
        const manualScreenTimeHours = manualScreenTimeMinutes / 60;
        const goalMet = manualScreenTimeHours <= challenge.dailyScreenTimeGoal;
        const coinsMaxPossible = challenge.dailyBudget;
        const coinsEarned = goalMet 
          ? coinsMaxPossible 
          : Math.max(0, coinsMaxPossible * (1 - (manualScreenTimeHours - challenge.dailyScreenTimeGoal) / challenge.dailyScreenTimeGoal));
        const coinsEarnedRounded = Math.round(coinsEarned * 10) / 10;

        manualUpdates = {
          screenTimeUsed: manualScreenTimeHours,
          screenTimeMinutes: manualScreenTimeMinutes,
          coinsEarned: coinsEarnedRounded,
          success: goalMet,
          approvalType: 'manual' // Mark as manual approval
        };
      }

      // Batch approve upload (combines update + approve in single write for better performance)
      await batchApproveUpload(upload.id, manualUpdates, manualScreenTimeMinutes !== undefined);

      // Invalidate uploads and dashboard cache since we just approved one
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      if (challenge.id) {
        dataCache.invalidate(cacheKeys.uploads(challenge.id, userId));
      }
      dataCache.invalidate(cacheKeys.dashboard(userId));

      // Reload dashboard data to get updated state from Firestore (skip cache)
      const updatedData = await getDashboardData(userId, false);
      if (updatedData) {
        // Verify the approved day status was updated correctly
        const approvedDay = updatedData.week.find(day => day.date === dayDate);
        logger.log('Approved day status after reload:', {
          date: dayDate,
          status: approvedDay?.status,
          requiresApproval: approvedDay?.requiresApproval,
          parentAction: approvedDay?.parentAction
        });
        
        setDashboardData(updatedData);
        
        // If last pending approval was approved, notify child redemption page (for cross-tab communication)
        if (approvedDay && typeof window !== 'undefined') {
          // Check if this was the last pending approval
          const pendingDays = updatedData.week.filter(day => 
            day.status === 'awaiting_approval' || 
            (day.requiresApproval && !day.parentAction)
          );
          
          // If no more pending approvals, this was the last one
          if (pendingDays.length === 0) {
            window.dispatchEvent(new Event('lastApproved'));
          }
        }
      } else {
        throw new Error('Failed to reload dashboard data after approval');
      }
    } catch (error) {
      logger.error('Error approving upload:', error);
      setError('שגיאה באישור ההעלאה. אנא רענן את הדף.');
      // Reload data to get current state
      try {
        const userId = await getCurrentUserIdAsync();
        if (userId) {
          const refreshedData = await getDashboardData(userId);
          if (refreshedData) {
            setDashboardData(refreshedData);
          }
        }
      } catch (refreshError) {
        logger.error('Error refreshing dashboard:', refreshError);
      }
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

  // Calculate values only when dashboardData is available
  const totalWeeklyHours = calculateWeeklyScreenTime(dashboardData.week);

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
                className="object-contain"
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
              missingDays={dashboardData.week.filter(day => day.status === 'missing')}
              setupUrl={setupUrl}
              uploadUrl={uploadUrl}
              redemptionUrl={redemptionUrl}
              week={dashboardData.week}
              onOpenSummary={handleOpenSummary}
              childSetupCompleted={!!(dashboardData.child.nickname && dashboardData.child.moneyGoals && dashboardData.child.moneyGoals.length > 0)}
            />
          </div>

          {/* 2. סטטוס שבועי */}
          <div className="mb-6">
            <WeeklyProgress
              week={dashboardData.week}
              totals={dashboardData.weeklyTotals}
              childName={dashboardData.child.name}
              childGender={dashboardData.child.gender as 'boy' | 'girl' | undefined}
              totalWeeklyHours={totalWeeklyHours}
              weeklyBudget={dashboardData.challenge.weeklyBudget}
              onDayClick={handleDayClick}
        />
      </div>

          {/* Day Info Modal - Single day */}
          {showApprovalModal && selectedDay && (
            <DayInfoModal
              day={selectedDay}
              childName={dashboardData.child.name}
              childGender={dashboardData.child.gender as 'boy' | 'girl' | undefined}
              uploadUrl={uploadUrl}
              dailyBudget={dashboardData.challenge.dailyBudget}
              onApprove={handleApprove}
              onClose={() => {
                setShowApprovalModal(false);
                setSelectedDay(null);
              }}
            />
          )}

            {/* Days Summary Modal - Multiple days */}
            {showSummaryModal && summaryDays.length > 0 && (
              <DaysSummaryModal
                days={summaryDays}
                childName={dashboardData.child.name}
                childGender={dashboardData.child.gender as 'boy' | 'girl' | undefined}
                uploadUrl={uploadUrl}
                dailyBudget={dashboardData.challenge.dailyBudget}
                dailyScreenTimeGoal={dashboardData.challenge.dailyScreenTimeGoal}
                onApprove={handleApprove}
                onDaysUpdated={(updatedDays) => {
                  setSummaryDays(updatedDays);
                  // Reload dashboard data to get updated state
                  const reloadData = async () => {
                    try {
                      const userId = await getCurrentUserIdAsync();
                      if (userId) {
                        const refreshedData = await getDashboardData(userId);
                        if (refreshedData) {
                          setDashboardData(refreshedData);
                        }
                      }
                    } catch (error) {
                      logger.error('Error refreshing dashboard:', error);
                    }
                  };
                  reloadData();
                }}
                onClose={() => {
                  setShowSummaryModal(false);
                  setSummaryDays([]);
                }}
              />
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
              className="object-contain"
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
                missingDays={dashboardData.week.filter(day => day.status === 'missing')}
                setupUrl={setupUrl}
                uploadUrl={uploadUrl}
                redemptionUrl={redemptionUrl}
                week={dashboardData.week}
                onOpenSummary={handleOpenSummary}
                childSetupCompleted={!!(dashboardData.child.nickname && dashboardData.child.moneyGoals && dashboardData.child.moneyGoals.length > 0)}
              />
            </div>

            {/* 2. סטטוס שבועי */}
            <div>
        <WeeklyProgress
          week={dashboardData.week}
          totals={dashboardData.weeklyTotals}
                childName={dashboardData.child.name}
                totalWeeklyHours={totalWeeklyHours}
                weeklyBudget={dashboardData.challenge.weeklyBudget}
                onDayClick={handleDayClick}
              />
            </div>

            {/* Day Info Modal - Single day */}
            {showApprovalModal && selectedDay && (
              <DayInfoModal
                day={selectedDay}
                childName={dashboardData.child.name}
                childGender={dashboardData.child.gender as 'boy' | 'girl' | undefined}
                uploadUrl={uploadUrl}
                dailyBudget={dashboardData.challenge.dailyBudget}
                onApprove={handleApprove}
                onClose={() => {
                  setShowApprovalModal(false);
                  setSelectedDay(null);
                }}
              />
            )}

            {/* Days Summary Modal - Multiple days */}
            {showSummaryModal && summaryDays.length > 0 && (
              <DaysSummaryModal
                days={summaryDays}
                childName={dashboardData.child.name}
                childGender={dashboardData.child.gender as 'boy' | 'girl' | undefined}
                uploadUrl={uploadUrl}
                dailyBudget={dashboardData.challenge.dailyBudget}
                dailyScreenTimeGoal={dashboardData.challenge.dailyScreenTimeGoal}
                onApprove={handleApprove}
                onDaysUpdated={(updatedDays) => {
                  setSummaryDays(updatedDays);
                  // Reload dashboard data to get updated state
                  const reloadData = async () => {
                    try {
                      const userId = await getCurrentUserIdAsync();
                      if (userId) {
                        const refreshedData = await getDashboardData(userId);
                        if (refreshedData) {
                          setDashboardData(refreshedData);
                        }
                      }
                    } catch (error) {
                      logger.error('Error refreshing dashboard:', error);
                    }
                  };
                  reloadData();
                }}
                onClose={() => {
                  setShowSummaryModal(false);
                  setSummaryDays([]);
                }}
              />
            )}
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