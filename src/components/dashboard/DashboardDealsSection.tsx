'use client';

import Image from 'next/image';
import {
  DashboardActiveDealCard,
  DashboardCompletedDealCard,
} from '@/components/dashboard/DashboardActiveDealCard';
import { DashboardChallengeBanner } from '@/components/dashboard/DashboardChallengeBanner';
import { PARENT_DASHBOARD_ASSETS } from '@/constants/parent-dashboard-layout';
import { formatDealDateRange } from '@/lib/dashboard/formatDealDateRange';
import type { FirestoreChallenge } from '@/types/firestore';

type DashboardDealsSectionProps = {
  childName: string;
  reductionPercent?: number | null;
  /** Live active challenge. */
  activeChallenge?: {
    startDate?: string;
    challengeDays?: number;
    weeklyBudget: number;
    hourlyRate: number;
    countdownTarget?: Date | null;
  } | null;
  completedChallenges: FirestoreChallenge[];
  /** Empty active after redemption — show create-deal CTA under header. */
  showEmptyActiveCta?: boolean;
  onCreateDeal?: () => void;
  onOpenCompleted?: () => void;
};

export function DashboardDealsSection({
  childName,
  reductionPercent,
  activeChallenge,
  completedChallenges,
  showEmptyActiveCta = false,
  onCreateDeal,
  onOpenCompleted,
}: DashboardDealsSectionProps) {
  const activeCount = activeChallenge ? 1 : 0;
  const completedCount = completedChallenges.length;
  const name = childName || 'יואב';

  return (
    <section className="flex w-full flex-col gap-[15px]" dir="rtl">
      <div className="flex w-full flex-col gap-[15px]">
        <p className="w-full text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
          {`דילים פעילים (${activeCount})`}
        </p>

        {activeChallenge ? (
          <DashboardActiveDealCard
            hourlyRate={activeChallenge.hourlyRate}
            countdownTarget={activeChallenge.countdownTarget}
          />
        ) : null}

        {showEmptyActiveCta && !activeChallenge ? (
          <DashboardChallengeBanner
            childName={name}
            reductionPercent={reductionPercent}
            headline={`ליצירת דיל עם ${name} >>`}
            onClick={onCreateDeal}
          />
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenCompleted}
        className="flex w-full items-center justify-start gap-2 px-2.5"
      >
        <span className="font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
          {`דילים שהסתיימו (${completedCount})`}
        </span>
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center gap-[10.909px] rounded-full bg-white/5">
          <Image
            src={PARENT_DASHBOARD_ASSETS.completedDealsChevron}
            alt=""
            width={6}
            height={10}
            className="h-[9.643px] w-[5.357px]"
            unoptimized
          />
        </span>
      </button>
    </section>
  );
}

type DashboardCompletedDealsViewProps = {
  childName: string;
  challenges: FirestoreChallenge[];
  onBack: () => void;
};

export function DashboardCompletedDealsView({
  childName,
  challenges,
  onBack,
}: DashboardCompletedDealsViewProps) {
  const name = childName || 'יואב';

  return (
    <div className="flex w-full flex-col gap-5" dir="rtl">
      <div className="flex h-11 w-full items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center gap-[12.727px] rounded-full bg-white/5"
          aria-label="חזרה"
        >
          <Image
            src={PARENT_DASHBOARD_ASSETS.completedDealsBack}
            alt=""
            width={20}
            height={20}
            className="size-5"
            unoptimized
          />
        </button>
        <p className="text-center font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
          {`דילים שהסתיימו (${challenges.length})`}
        </p>
        <span className="h-[28px] w-[28px] shrink-0" aria-hidden />
      </div>

      <div className="flex w-full flex-col gap-5 pt-2">
        {challenges.map((c) => {
          const budget = c.selectedBudget || 0;
          const remaining =
            typeof c.redemptionAmount === 'number' ? c.redemptionAmount : budget;
          return (
            <DashboardCompletedDealCard
              key={c.id}
              childName={name}
              dateLabel={formatDealDateRange(c.startDate, c.challengeDays || 6)}
              weeklyBudget={budget}
              remaining={remaining}
            />
          );
        })}
      </div>
    </div>
  );
}
