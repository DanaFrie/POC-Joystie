'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import DayInfoModal from '@/components/dashboard/DayInfoModal';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import ReminderButton from '@/components/dashboard/ReminderButton';
import type { DashboardState, WeekDay } from '@/types/dashboard';
import { createPushNotification, saveNotification, checkGoalMet } from '@/utils/notifications';
import type { PushNotification } from '@/types/notifications';
import { isLoggedIn, updateLastActivity } from '@/utils/session';
import { formatNumber } from '@/utils/formatting';

// Helper function to generate current week data - deterministic (no random)
function generateCurrentWeek(): WeekDay[] {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Find last Sunday (start of week)
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - currentDay);
  
  const dayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  const week: WeekDay[] = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(lastSunday);
    day.setDate(lastSunday.getDate() + i);
    
    const dateStr = `${String(day.getDate()).padStart(2, '0')}/${String(day.getMonth() + 1).padStart(2, '0')}`;
    const dayName = dayNames[i];
    
    // Determine status based on day - deterministic (based on day index)
    let status: WeekDay['status'] = 'future';
    if (i < currentDay) {
      // Past days - alternate between success and warning for demo (deterministic)
      status = i % 2 === 0 ? 'success' : 'warning';
    } else if (i === currentDay) {
      // Today - pending
      status = 'pending';
    } else {
      // Future days
      status = 'future';
    }
    
    // Friday is redemption day
    const isRedemptionDay = i === 5; // Friday (ו׳)
    
    // Mock data for past days - deterministic values
    const screenTimeGoal = 3;
    const screenTimeUsed = i < currentDay 
      ? status === 'success' 
        ? 2.5 + (i * 0.1) // 2.5, 2.6, 2.7, etc.
        : 3.0 + (i * 0.1) // 3.0, 3.1, 3.2, etc.
      : 0;
    
    const dailyBudget = 12.9;
    const hourlyRate = screenTimeGoal > 0 ? dailyBudget / screenTimeGoal : 0;
    const coinsEarned = i < currentDay && screenTimeUsed > 0
      ? screenTimeUsed * hourlyRate
      : 0;
    
    week.push({
      dayName,
      date: dateStr,
      status,
      coinsEarned,
      screenTimeUsed,
      screenTimeGoal,
      isRedemptionDay
    });
  }
  
  return week;
}

// Create initial mock data - will be generated on client side
const getInitialMockData = (): DashboardState => {
  // Check if test data exists in localStorage
  if (typeof window !== 'undefined') {
    const testData = localStorage.getItem('dashboardTestData');
    if (testData) {
      try {
        const parsed = JSON.parse(testData);
        // Merge with today's data
        const today = new Date();
        const todayDateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
        const todayDay = parsed.week.find((d: WeekDay) => d.date === todayDateStr) || parsed.week[today.getDay()];
        
        return {
          ...parsed,
          today: {
            date: todayDateStr,
            hebrewDate: 'ה׳ באדר תשפ״ד',
            screenshotStatus: 'pending',
            screenTimeUsed: todayDay?.screenTimeUsed || 0,
            screenTimeGoal: todayDay?.screenTimeGoal || 3,
            coinsEarned: todayDay?.coinsEarned || 0,
            coinsMaxPossible: todayDay?.screenTimeGoal * (12.9 / 3) || 12.9,
            requiresApproval: todayDay?.requiresApproval || false,
            uploadedAt: new Date().toISOString(),
            apps: todayDay?.apps || []
          }
        };
      } catch (e) {
        console.error('Error parsing test data:', e);
      }
    }
  }
  
  const currentWeek = generateCurrentWeek();
  const today = new Date();
  const todayDateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
  const todayDay = currentWeek.find(d => d.date === todayDateStr) || currentWeek[today.getDay()];

  return {
    parent: {
      name: 'דנה',
      id: '123',
      googleAuth: {},
      profilePicture: '/profile.jpg'
    },
    child: {
      name: 'יובל',
      id: '456',
      profilePicture: '/child.jpg'
    },
    challenge: {
      selectedBudget: 100, // תקציב נבחר (100%)
      weeklyBudget: 90, // תקציב שבועי (90% מהתקציב הנבחר)
      dailyBudget: 12.9, // 90 / 7
      dailyScreenTimeGoal: 3,
      penaltyRate: 10,
      weekNumber: 1,
      totalWeeks: 4,
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    },
    today: {
      date: todayDateStr,
      hebrewDate: 'ה׳ באדר תשפ״ד', // TODO: Calculate Hebrew date
      screenshotStatus: 'pending',
      screenTimeUsed: todayDay.screenTimeUsed,
      screenTimeGoal: todayDay.screenTimeGoal,
      coinsEarned: todayDay.coinsEarned,
      coinsMaxPossible: todayDay.screenTimeGoal * (12.9 / 3),
      requiresApproval: false,
      uploadedAt: new Date().toISOString(),
      apps: [
        { name: 'YouTube', timeUsed: 1.2, icon: '/youtube.png' },
        { name: 'TikTok', timeUsed: 0.8, icon: '/tiktok.png' },
        { name: 'Instagram', timeUsed: 0.5, icon: '/instagram.png' }
      ]
    },
    week: currentWeek,
    weeklyTotals: {
      coinsEarned: currentWeek.reduce((sum, day) => sum + day.coinsEarned, 0),
      coinsMaxPossible: 100,
      redemptionDate: currentWeek[5].date, // Friday
      redemptionDay: 'ו׳'
    }
  };
};

// Empty initial state - will be populated on client side
const initialMockData: DashboardState = {
  parent: {
    name: 'דנה',
    id: '123',
    googleAuth: {},
    profilePicture: '/profile.jpg'
  },
  child: {
    name: 'יובל',
    id: '456',
    profilePicture: '/child.jpg'
  },
  challenge: {
    selectedBudget: 100,
    weeklyBudget: 90,
    dailyBudget: 12.9,
    dailyScreenTimeGoal: 3,
    penaltyRate: 10,
    weekNumber: 1,
    totalWeeks: 4,
    startDate: '',
    isActive: true
  },
  today: {
    date: '',
    hebrewDate: '',
    screenshotStatus: 'pending',
    screenTimeUsed: 0,
    screenTimeGoal: 3,
    coinsEarned: 0,
    coinsMaxPossible: 0,
    requiresApproval: false,
    uploadedAt: '',
    apps: []
  },
  week: [],
  weeklyTotals: {
    coinsEarned: 0,
    coinsMaxPossible: 100,
    redemptionDate: '',
    redemptionDay: ''
  }
};

// Calculate total weekly screen time
function calculateWeeklyScreenTime(week: WeekDay[]): number {
  return week.reduce((total, day) => total + day.screenTimeUsed, 0);
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardState>(initialMockData);
  const router = useRouter();
  
  // Check session on mount
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    // Update activity on page load
    updateLastActivity();
    
    // Set up activity tracking
    const handleActivity = () => {
      updateLastActivity();
    };
    
    // Track user activity
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    // Check session validity periodically
    const sessionCheckInterval = setInterval(() => {
      if (!isLoggedIn()) {
        router.push('/login');
      }
    }, 60000); // Check every minute
    
    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(sessionCheckInterval);
    };
  }, [router]);
  
  // Initialize data on client side only (to avoid hydration mismatch)
  useEffect(() => {
    if (!isLoggedIn()) return;
    
    setDashboardData(getInitialMockData());
    
    // Add a test notification for testing (only if no unread notifications exist)
    if (typeof window !== 'undefined') {
      const existingNotifications = JSON.parse(localStorage.getItem('parentNotifications') || '[]');
      const unreadNotifications = existingNotifications.filter((n: PushNotification) => !n.read);
      
      // Add test notification if there are no unread notifications
      if (unreadNotifications.length === 0) {
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        const dayName = dayNames[today.getDay()];
        
        const testNotification = createPushNotification(
          'upload_success',
          'יובל',
          dateStr,
          dayName,
          undefined,
          dashboardData.child.gender as 'boy' | 'girl' || 'boy'
        );
        saveNotification(testNotification);
      }
    }
  }, []);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WeekDay | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
  const totalWeeklyHours = calculateWeeklyScreenTime(dashboardData.week);
  const uploadUrl = typeof window !== 'undefined' ? `${window.location.origin}/child/upload` : '';

  // Listen for child uploads
  useEffect(() => {
    const handleChildUpload = () => {
      // Get uploads from localStorage
      const uploads = JSON.parse(localStorage.getItem('childUploads') || '[]');
      if (uploads.length === 0) return;

      // Get the latest upload
      const latestUpload = uploads[uploads.length - 1];
      
      setDashboardData(prev => {
        // Check if we already processed this upload (by uploadedAt timestamp)
        const existingDay = prev.week.find(day => 
          day.date === latestUpload.date && day.uploadedAt === latestUpload.uploadedAt
        );
        
        if (existingDay && existingDay.requiresApproval) {
          // Already processed, skip
          return prev;
        }

        // Find matching day in week
        const updatedWeek = prev.week.map(day => {
          if (day.date === latestUpload.date) {
            const goalMet = latestUpload.screenTime <= prev.challenge.dailyScreenTimeGoal;
            const dailyBudget = prev.challenge.dailyBudget;
            const hourlyRate = prev.challenge.dailyScreenTimeGoal > 0 
              ? dailyBudget / prev.challenge.dailyScreenTimeGoal 
              : 0;
            const coinsEarned = goalMet 
              ? latestUpload.screenTime * hourlyRate
              : Math.max(0, (prev.challenge.dailyScreenTimeGoal - (latestUpload.screenTime - prev.challenge.dailyScreenTimeGoal)) * hourlyRate);

            // Create push notification
            const notification = createPushNotification(
              goalMet ? 'upload_success' : 'upload_exceeded',
              prev.child.name,
              latestUpload.date,
              latestUpload.dayName,
              undefined,
              prev.child.gender as 'boy' | 'girl' || 'boy'
            );
            saveNotification(notification);

            return {
              ...day,
              status: 'awaiting_approval' as const,
              screenTimeUsed: latestUpload.screenTime,
              coinsEarned,
              requiresApproval: true,
              uploadedAt: latestUpload.uploadedAt,
              screenshotUrl: latestUpload.screenshot
            };
          }
          return day;
        });

        return {
          ...prev,
          week: updatedWeek
        };
      });

      // Clear processed uploads
      localStorage.removeItem('childUploads');
    };

    // Check on mount
    handleChildUpload();
    
    // Listen for new uploads
    window.addEventListener('childUploaded', handleChildUpload);
    
    // Also listen for storage changes (for cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'childUploads' && e.newValue) {
        handleChildUpload();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('childUploaded', handleChildUpload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleDayClick = (day: WeekDay) => {
    // Don't open modal for redemption day
    if (day.isRedemptionDay) {
      return;
    }
    // All other days are clickable
    setSelectedDay(day);
    setShowApprovalModal(true);
  };

  const handleApprove = async (dayDate: string) => {
    const updatedWeek = dashboardData.week.map(day => {
      if (day.date === dayDate) {
        return {
          ...day,
          status: (day.screenTimeUsed <= day.screenTimeGoal ? 'success' : 'warning') as 'success' | 'warning',
          requiresApproval: false,
          parentAction: 'approved' as const
        };
      }
      return day;
    });

    setDashboardData(prev => ({
      ...prev,
      week: updatedWeek
    }));

    // Recalculate totals
    const newTotal = calculateWeeklyScreenTime(updatedWeek);
    // TODO: Update weekly totals
  };

  const handleReject = async (dayDate: string) => {
    const updatedWeek = dashboardData.week.map(day => {
      if (day.date === dayDate) {
        return {
          ...day,
          status: 'rejected' as const,
          requiresApproval: false,
          parentAction: 'rejected' as const
        };
      }
      return day;
    });

    setDashboardData(prev => ({
      ...prev,
      week: updatedWeek
    }));

    // Create rejection message for parent to send
    const childGender = dashboardData.child.gender as 'boy' | 'girl' || 'boy';
    const childPronouns = {
      boy: { you: 'תוכל', uploaded: 'העלית', it: 'אותו', your: 'שלך' },
      girl: { you: 'תוכלי', uploaded: 'העלית', it: 'אותו', your: 'שלך' }
    };
    const childP = childPronouns[childGender] || childPronouns.boy;
    const rejectionMessage = `היי ${dashboardData.child.name}, משהו בצילום המסך ש${childP.uploaded} עבור ${selectedDay?.date} לא היה ברור / לא תקין. ${childP.you} בבקשה להעלות ${childP.it} שוב בקישור הקבוע ${childP.your}? ${uploadUrl}`;
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(rejectionMessage);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };


  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* Mobile: Scrollable with side padding to show gradient */}
      <div className="lg:hidden overflow-x-hidden px-2 py-8 overflow-y-visible w-full" style={{ border: 'none', outline: 'none' }}>
        <div className="w-full max-w-md mx-auto px-4 pb-0" style={{ border: 'none', outline: 'none' }}>
          {/* 1. היי, [שם הורה] עם פיגי בצד השמאלי */}
          <div className="mb-3 relative flex items-center justify-between">
            <h1 className="font-varela font-semibold text-2xl text-[#262135]">
              היי, מאיר
            </h1>
            <div className="flex-shrink-0">
              <Image
                src="/piggy-bank.png"
                alt="Piggy Bank"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          </div>

          {/* תיבת עדכונים */}
          <div style={{ marginBottom: '9.6px' }}>
            <NotificationsPanel />
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
      
          {/* Show reminder button for missing days */}
          {dashboardData.week.some(day => day.status === 'missing') && (
            <div className="mb-6 bg-[#FFFCF8] rounded-[18px] shadow-card p-4">
              <h3 className="font-varela font-semibold text-base text-[#282743] mb-3">
                ימים חסרים
              </h3>
              {dashboardData.week
                .filter(day => day.status === 'missing')
                .map((day, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <p className="font-varela text-sm text-[#282743] mb-2">
                      {day.dayName} {day.date}
                    </p>
                    <ReminderButton
                      day={day}
                      childName={dashboardData.child.name}
                      uploadUrl={uploadUrl}
                    />
                  </div>
                ))}
            </div>
          )}

          {/* Day Info Modal */}
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
              const weeklyHours = challenge.dailyScreenTimeGoal * 7;
              const bonusAmount = challenge.selectedBudget * 0.1;
              const budgetPercentage = (challenge.weeklyBudget / challenge.selectedBudget) * 100;
              const bonusPercentage = (bonusAmount / challenge.selectedBudget) * 100;
              
              return (
                <div className="px-4 pb-4 space-y-4">
                    {/* Budget Pie Chart Visual */}
                    <div className="bg-[#BBE9FD] bg-opacity-30 rounded-[18px] p-4 mb-4">
                      <h4 className="font-varela font-semibold text-base text-[#273143] mb-3 text-center">חלוקת התקציב</h4>
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative w-32 h-32">
                          {/* Pie Chart */}
                          <svg className="transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#E4E4E4" strokeWidth="8" />
                            {/* Weekly budget (90%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#E6F19A"
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 45 * budgetPercentage / 100} ${2 * Math.PI * 45}`}
                              strokeLinecap="round"
                            />
                            {/* Bonus (10%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#BBE9FD"
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 45 * bonusPercentage / 100} ${2 * Math.PI * 45}`}
                              strokeDashoffset={`-${2 * Math.PI * 45 * budgetPercentage / 100}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Center text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="font-varela font-bold text-xl text-[#273143]">₪{formatNumber(challenge.selectedBudget, 0)}</div>
                            <div className="font-varela text-xs text-[#273143] opacity-80">סה"כ</div>
                          </div>
                        </div>
                      </div>
                      {/* Legend */}
                      <div className="flex justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#E6F19A]"></div>
                          <span className="font-varela text-[#273143]">₪{formatNumber(challenge.weeklyBudget)} (90%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#BBE9FD]"></div>
                          <span className="font-varela text-[#273143]">₪{formatNumber(bonusAmount)} (10%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats List - Compact */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">תקציב יומי</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">₪{formatNumber(challenge.dailyBudget)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">כסף לשעה</span>
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
      <div className="hidden lg:block lg:py-8">
        {/* 1. היי, [שם הורה] עם פיגי בצד השמאלי */}
        <div className="mb-3 relative flex items-center justify-between">
          <h1 className="font-varela font-semibold text-2xl text-[#262135]">
            היי, מאיר
          </h1>
          <div className="flex-shrink-0">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left column - Updates and Weekly Progress */}
          <div className="col-span-5">
            {/* תיבת עדכונים */}
            <div style={{ marginBottom: '9.6px' }}>
              <NotificationsPanel />
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

            {/* Show reminder button for missing days */}
            {dashboardData.week.some(day => day.status === 'missing') && (
              <div className="mt-6 bg-[#FFFCF8] rounded-[18px] shadow-card p-4">
                <h3 className="font-varela font-semibold text-base text-[#282743] mb-3">
                  ימים חסרים
                </h3>
                {dashboardData.week
                  .filter(day => day.status === 'missing')
                  .map((day, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <p className="font-varela text-sm text-[#282743] mb-2">
                        {day.dayName} {day.date}
                      </p>
                      <ReminderButton
                        day={day}
                        childName={dashboardData.child.name}
                        uploadUrl={uploadUrl}
                      />
                    </div>
                  ))}
              </div>
            )}

            {/* Day Info Modal */}
            {showApprovalModal && selectedDay && (
              <DayInfoModal
                day={selectedDay}
                childName={dashboardData.child.name}
                uploadUrl={uploadUrl}
                onApprove={handleApprove}
                onReject={handleReject}
                onClose={() => {
                  setShowApprovalModal(false);
                  setSelectedDay(null);
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
                const weeklyHours = challenge.dailyScreenTimeGoal * 7;
                const bonusAmount = challenge.selectedBudget * 0.1;
                const budgetPercentage = (challenge.weeklyBudget / challenge.selectedBudget) * 100;
                const bonusPercentage = (bonusAmount / challenge.selectedBudget) * 100;
                
                return (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Budget Pie Chart Visual */}
                    <div className="bg-[#BBE9FD] bg-opacity-30 rounded-[18px] p-4 mb-4">
                      <h4 className="font-varela font-semibold text-base text-[#273143] mb-3 text-center">חלוקת התקציב</h4>
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative w-32 h-32">
                          {/* Pie Chart */}
                          <svg className="transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#E4E4E4" strokeWidth="8" />
                            {/* Weekly budget (90%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#E6F19A"
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 45 * budgetPercentage / 100} ${2 * Math.PI * 45}`}
                              strokeLinecap="round"
                            />
                            {/* Bonus (10%) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#BBE9FD"
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 45 * bonusPercentage / 100} ${2 * Math.PI * 45}`}
                              strokeDashoffset={`-${2 * Math.PI * 45 * budgetPercentage / 100}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Center text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="font-varela font-bold text-xl text-[#273143]">₪{formatNumber(challenge.selectedBudget, 0)}</div>
                            <div className="font-varela text-xs text-[#273143] opacity-80">סה"כ</div>
                          </div>
                        </div>
                      </div>
                      {/* Legend */}
                      <div className="flex justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#E6F19A]"></div>
                          <span className="font-varela text-[#273143]">₪{formatNumber(challenge.weeklyBudget)} (90%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-[#BBE9FD]"></div>
                          <span className="font-varela text-[#273143]">₪{formatNumber(bonusAmount)} (10%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats List - Compact */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">תקציב יומי</span>
                        <span className="font-varela font-semibold text-base text-[#273143]">₪{formatNumber(challenge.dailyBudget)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 bg-[#E4E4E4] bg-opacity-30 rounded-[12px]">
                        <span className="font-varela font-normal text-sm text-[#273143]">כסף לשעה</span>
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