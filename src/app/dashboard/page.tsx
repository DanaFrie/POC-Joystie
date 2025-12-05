'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import DayInfoModal from '@/components/dashboard/DayInfoModal';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import DaysSummaryModal from '@/components/dashboard/DaysSummaryModal';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import { createPushNotification, saveNotification, checkGoalMet } from '@/utils/notifications';
import type { PushNotification } from '@/types/notifications';
import { isLoggedIn, updateLastActivity, getCurrentUserId } from '@/utils/session';
import { formatNumber } from '@/utils/formatting';
import { getDashboardData } from '@/lib/api/dashboard';
import { generateUploadUrl, generateRedemptionUrl } from '@/utils/url-encoding';
import { getActiveChallenge } from '@/lib/api/challenges';
import { approveUpload, rejectUpload, getUploadByDate } from '@/lib/api/uploads';
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
  
  // Check Firebase Auth state on mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const checkAuth = async () => {
      try {
        // Wait for Firebase Auth to be ready
        unsubscribe = await onAuthStateChange(async (user) => {
          if (!user) {
            // Not authenticated with Firebase Auth - redirect to login
            console.warn('[Dashboard] User not authenticated with Firebase Auth, redirecting to login');
            router.push('/login');
            return;
          }
          
          // User is authenticated - update activity
          updateLastActivity();
        });
      } catch (error) {
        console.error('[Dashboard] Error checking auth state:', error);
        // Fallback: check localStorage session
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
    
    // Check session validity periodically
    const sessionCheckInterval = setInterval(async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated && !isLoggedIn()) {
        router.push('/login');
      }
    }, 60000); // Check every minute
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(sessionCheckInterval);
    };
  }, [router]);
  
  // Load dashboard data from Firestore - prevent double loading
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    const loadDashboardData = async () => {
      try {
        // Wait for Firebase Auth to be ready
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          console.warn('[Dashboard] User not authenticated, waiting for auth state...');
          // Wait a bit for auth state to settle
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryAuth = await isAuthenticated();
          if (!retryAuth) {
            router.push('/login');
            return;
          }
        }
        
        setIsLoading(true);
        setError(null);
        hasLoadedRef.current = true;
        
        let userId = await getCurrentUserIdAsync();
        if (!userId) {
          // Try one more time after a short delay (Firebase Auth might still be initializing)
          console.warn('[Dashboard] User ID not found, retrying after delay...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          userId = await getCurrentUserIdAsync();
          if (!userId) {
            throw new Error('User ID not found. Please log in again.');
          }
        }
        
        console.log('[Dashboard] Got user ID:', userId);
        
        const data = await getDashboardData(userId);
        
        if (data) {
          console.log('[Dashboard] ✅ Loaded data from Firestore:', data);
          setDashboardData(data);
        } else {
          // No active challenge - redirect to onboarding
          console.warn('[Dashboard] ⚠️ No active challenge found, redirecting to onboarding');
          setError('לא נמצא אתגר פעיל. אנא צור אתגר חדש.');
          setTimeout(() => {
            router.push('/onboarding');
          }, 2000);
          return;
        }
      } catch (err: any) {
        console.error('[Dashboard] ❌ Error loading dashboard data:', err);
        
        // If it's an auth error, redirect to login
        if (err.message?.includes('User ID not found') || err.message?.includes('not authenticated')) {
          console.warn('[Dashboard] Authentication error, redirecting to login');
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
            const upload = generateUploadUrl(userId, challenge.childId, challenge.id);
            const redemption = generateRedemptionUrl(userId, challenge.childId, challenge.id);
            setUploadUrl(upload);
            setRedemptionUrl(redemption);
          } else {
            // Fallback
            const upload = generateUploadUrl(userId);
            const redemption = generateRedemptionUrl(userId);
            setUploadUrl(upload);
            setRedemptionUrl(redemption);
          }
        } else {
          setUploadUrl(typeof window !== 'undefined' ? `${window.location.origin}/child/upload` : '');
          setRedemptionUrl(typeof window !== 'undefined' ? `${window.location.origin}/child/redemption` : '');
        }
      } catch (error) {
        console.error('Error generating URLs:', error);
        // Fallback
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

  const handleApprove = async (dayDate: string) => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Use cached challenge if available (from dashboardData)
      let challenge = dashboardData?.challenge ? {
        id: '', // Will be set from getActiveChallenge
        ...dashboardData.challenge
      } : null;
      
      // Only fetch if we don't have challenge data or need the ID
      if (!challenge || !challenge.id) {
        challenge = await getActiveChallenge(userId);
        if (!challenge) {
          throw new Error('No active challenge found');
        }
      }

      // Find the upload for this date
      console.log(`[Dashboard] Looking for upload:`, { challengeId: challenge.id, dayDate, userId });
      const upload = await getUploadByDate(challenge.id, dayDate, userId);
      if (!upload) {
        throw new Error('Upload not found for this date');
      }
      console.log(`[Dashboard] Found upload before approval:`, {
        id: upload.id,
        date: upload.date,
        challengeId: upload.challengeId,
        requiresApproval: upload.requiresApproval,
        parentAction: upload.parentAction,
        success: upload.success,
        uploadedAt: upload.uploadedAt,
        updatedAt: upload.updatedAt
      });

      // Approve in Firestore
      await approveUpload(upload.id);

      // Invalidate uploads and dashboard cache since we just approved one
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      if (challenge.id) {
        dataCache.invalidate(cacheKeys.uploads(challenge.id, userId));
      }
      dataCache.invalidate(cacheKeys.dashboard(userId));

      // Small delay to ensure Firestore consistency (eventual consistency)
      await new Promise(resolve => setTimeout(resolve, 200));

      // Reload dashboard data to get updated state from Firestore (skip cache)
      const updatedData = await getDashboardData(userId, false);
      if (updatedData) {
        // Verify the approved day status was updated correctly
        const approvedDay = updatedData.week.find(day => day.date === dayDate);
        console.log('[Dashboard] Approved day status after reload:', {
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
      console.error('Error approving upload:', error);
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
        console.error('Error refreshing dashboard:', refreshError);
      }
    }
  };

  const handleReject = async (dayDate: string) => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Use cached challenge if available (from dashboardData)
      let challenge = dashboardData?.challenge ? {
        id: '', // Will be set from getActiveChallenge if needed
        ...dashboardData.challenge
      } : null;
      
      // Only fetch if we don't have challenge data or need the ID
      if (!challenge) {
        challenge = await getActiveChallenge(userId);
        if (!challenge) {
          throw new Error('No active challenge found');
        }
      } else {
        // Get challenge ID from cache or fetch
        const cachedChallenge = await getActiveChallenge(userId, true);
        if (cachedChallenge) {
          challenge = { ...challenge, id: cachedChallenge.id };
        }
      }

      // Find the upload for this date
      const upload = await getUploadByDate(challenge.id, dayDate, userId);
      if (!upload) {
        throw new Error('Upload not found for this date');
      }

      // Reject in Firestore
      await rejectUpload(upload.id);

      // Invalidate cache
      const { dataCache, cacheKeys } = await import('@/utils/data-cache');
      if (challenge.id) {
        dataCache.invalidate(cacheKeys.uploads(challenge.id, userId));
      }
      dataCache.invalidate(cacheKeys.dashboard(userId));

      // Reload dashboard data (skip cache)
      const updatedData = await getDashboardData(userId, false);
      if (updatedData) {
        setDashboardData(updatedData);
      } else {
        throw new Error('Failed to reload dashboard data after rejection');
      }
    } catch (error) {
      console.error('Error rejecting upload:', error);
      setError('שגיאה בדחיית ההעלאה. אנא רענן את הדף.');
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
        console.error('Error refreshing dashboard:', refreshError);
      }
    }

    // Create rejection message for parent to send (only if we have data)
    if (dashboardData && selectedDay) {
      const childGender = dashboardData.child.gender as 'boy' | 'girl' || 'boy';
      const childPronouns = {
        boy: { you: 'תוכל', uploaded: 'העלית', it: 'אותו', your: 'שלך' },
        girl: { you: 'תוכלי', uploaded: 'העלית', it: 'אותו', your: 'שלך' }
      };
      const childP = childPronouns[childGender] || childPronouns.boy;
      const rejectionMessage = `היי ${dashboardData.child.name}, משהו בצילום המסך ש${childP.uploaded} עבור ${selectedDay.date} לא היה ברור / לא תקין. ${childP.you} בבקשה להעלות ${childP.it} שוב בקישור הקבוע ${childP.your}? ${uploadUrl}`;
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(rejectionMessage);
      } catch (err) {
        console.error('Failed to copy:', err);
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
              missingDays={dashboardData.week.filter(day => day.status === 'missing')}
              uploadUrl={uploadUrl}
              week={dashboardData.week}
              onOpenSummary={handleOpenSummary}
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
              onReject={handleReject}
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
                onApprove={handleApprove}
                onReject={handleReject}
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
                      console.error('Error refreshing dashboard:', error);
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
                        <span className="font-varela font-semibold text-base text-[#273143]">{challenge.dailyScreenTimeGoal} {challenge.dailyScreenTimeGoal === 1 ? 'שעה' : 'שעות'}</span>
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
                missingDays={dashboardData.week.filter(day => day.status === 'missing')}
                uploadUrl={uploadUrl}
                week={dashboardData.week}
                onOpenSummary={handleOpenSummary}
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
                onApprove={handleApprove}
                onReject={handleReject}
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
                onApprove={handleApprove}
                onReject={handleReject}
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
                      console.error('Error refreshing dashboard:', error);
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

            {/* 6. תיבה עם פירוט נתוני האתגר - Collapsible */}
            <div className="bg-[#FFFCF8] rounded-[18px] shadow-card overflow-hidden">
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
                        <span className="font-varela font-semibold text-base text-[#273143]">{challenge.dailyScreenTimeGoal} {challenge.dailyScreenTimeGoal === 1 ? 'שעה' : 'שעות'}</span>
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