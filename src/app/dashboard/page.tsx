'use client';

import { useState } from 'react';
import Image from 'next/image';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import type { DashboardState } from '@/types/dashboard';

// Mock data for development - replace with API call
const mockData: DashboardState = {
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
    weeklyBudget: 100,
    dailyBudget: 14.3,
    dailyScreenTimeGoal: 3,
    penaltyRate: 10,
    weekNumber: 1,
    totalWeeks: 4,
    startDate: '2024-03-12',
    isActive: true
  },
  today: {
    date: '15/03/2024',
    hebrewDate: 'ה׳ באדר תשפ״ד',
    screenshotStatus: 'pending',
    screenTimeUsed: 2.5,
    screenTimeGoal: 3,
    coinsEarned: 14.3,
    coinsMaxPossible: 14.3,
    requiresApproval: false,
    uploadedAt: new Date().toISOString(),
    apps: [
      { name: 'YouTube', timeUsed: 1.2, icon: '/youtube.png' },
      { name: 'TikTok', timeUsed: 0.8, icon: '/tiktok.png' },
      { name: 'Instagram', timeUsed: 0.5, icon: '/instagram.png' }
    ]
  },
  week: [
    { dayName: 'א׳', date: '12/03', status: 'success', coinsEarned: 14.3, screenTimeUsed: 2.5, screenTimeGoal: 3, isRedemptionDay: false },
    { dayName: 'ב׳', date: '13/03', status: 'success', coinsEarned: 14.3, screenTimeUsed: 2.8, screenTimeGoal: 3, isRedemptionDay: false },
    { dayName: 'ג׳', date: '14/03', status: 'warning', coinsEarned: 10.5, screenTimeUsed: 3.5, screenTimeGoal: 3, isRedemptionDay: false },
    { dayName: 'ד׳', date: '15/03', status: 'pending', coinsEarned: 0, screenTimeUsed: 0, screenTimeGoal: 3, isRedemptionDay: false },
    { dayName: 'ה׳', date: '16/03', status: 'future', coinsEarned: 0, screenTimeUsed: 0, screenTimeGoal: 3, isRedemptionDay: false },
    { dayName: 'ו׳', date: '17/03', status: 'redemption', coinsEarned: 0, screenTimeUsed: 0, screenTimeGoal: 3, isRedemptionDay: true },
    { dayName: 'ש׳', date: '18/03', status: 'future', coinsEarned: 0, screenTimeUsed: 0, screenTimeGoal: 3, isRedemptionDay: false }
  ],
  weeklyTotals: {
    coinsEarned: 39.1,
    coinsMaxPossible: 100,
    redemptionDate: '17/03',
    redemptionDay: 'ו׳'
  }
};

// Calculate total weekly screen time
function calculateWeeklyScreenTime(week: typeof mockData.week): number {
  return week.reduce((total, day) => total + day.screenTimeUsed, 0);
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardState>(mockData);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  
  const totalWeeklyHours = calculateWeeklyScreenTime(dashboardData.week);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* 1. היי, [שם הורה] */}
        <div className="mb-6">
          <h1 className="font-varela font-semibold text-2xl text-[#262135]">
            היי, מאיר
          </h1>
        </div>

        {/* תיבת עדכונים */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-4 mb-6">
          <h2 className="font-varela font-semibold text-base text-[#282743] mb-3">
            עדכונים
          </h2>
          <div className="space-y-2">
            {/* כאן יהיו עדכונים מסוג share והתראות בהמשך */}
            <p className="font-varela text-sm text-[#948DA9] text-center py-2">
              אין עדכונים חדשים
            </p>
          </div>
        </div>

        {/* 2. סטטוס שבועי (without title) */}
        <div className="mb-6">
          <WeeklyProgress
            week={dashboardData.week}
            totals={dashboardData.weeklyTotals}
          />
        </div>

        {/* 3. סיכום שבועי במלל */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-4 mb-6 relative overflow-visible">
          {/* פיגי בפינה השמאלית העליונה - 70% בתוך התיבה, 30% בחוץ */}
          <div className="absolute -left-[24px] -top-[24px] z-10">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <p className="font-varela font-normal text-[15px] leading-[24px] text-[#282743] pr-[56px]">
            {dashboardData.child.name} היה השבוע {totalWeeklyHours.toFixed(1)} שעות בטלפון וזכה ב{dashboardData.weeklyTotals.coinsEarned.toFixed(1)} ש"ח / {dashboardData.weeklyTotals.coinsMaxPossible} ש"ח
          </p>
        </div>

        {/* 6. תיבה עם פירוט נתוני האתגר - Collapsible */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card overflow-hidden">
          <button
            onClick={() => setIsChallengeOpen(!isChallengeOpen)}
            className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-varela font-semibold text-xl text-[#282743]">
              פרטי האתגר
            </h3>
            <span className="font-varela text-[#282743]">
              {isChallengeOpen ? '▲' : '▼'}
            </span>
          </button>
          
          {isChallengeOpen && (
            <div className="px-4 pb-4 space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="font-varela font-normal text-sm text-[#282743]">תקציב שבועי</span>
                <span className="font-varela font-semibold text-lg text-[#282743]">₪{dashboardData.challenge.weeklyBudget}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-varela font-normal text-sm text-[#282743]">תקציב יומי</span>
                <span className="font-varela font-semibold text-lg text-[#282743]">₪{dashboardData.challenge.dailyBudget}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-varela font-normal text-sm text-[#282743]">יעד זמן מסך יומי</span>
                <span className="font-varela font-semibold text-lg text-[#282743]">{dashboardData.challenge.dailyScreenTimeGoal} שעות</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-varela font-normal text-sm text-[#282743]">קנס לשעה חריגה</span>
                <span className="font-varela font-semibold text-lg text-[#282743]">₪{dashboardData.challenge.penaltyRate}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-varela font-normal text-sm text-[#282743]">שבוע נוכחי</span>
                <span className="font-varela font-semibold text-lg text-[#282743]">{dashboardData.challenge.weekNumber} מתוך {dashboardData.challenge.totalWeeks}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}