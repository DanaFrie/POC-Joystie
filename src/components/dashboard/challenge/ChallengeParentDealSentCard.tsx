'use client';

import type { ReactNode } from 'react';
import { formatNumber } from '@/utils/formatting';

type ChallengeParentDealSentCardProps = {
  childName: string;
  /** Child gender for Hebrew verb agreement. */
  childGender?: 'boy' | 'girl';
  weeklyBudget: number;
  hourlyRate: number;
  startDateLabel: string;
};

/** Bad-news style summary — free text + gray emphasis chips (onboarding reveal). */
export function ChallengeParentDealSentCard({
  childName,
  childGender = 'boy',
  weeklyBudget,
  hourlyRate,
  startDateLabel,
}: ChallengeParentDealSentCardProps) {
  const isGirl = childGender === 'girl';
  const willReceive = isGirl ? 'תקבל' : 'יקבל';
  const whenApproves = isGirl ? 'שתאשר' : 'שיאשר';

  return (
    <article className="flex w-full flex-col items-center gap-3 rounded-[24px] border border-[#efefef] bg-[linear-gradient(227deg,#fff_0%,#f7f7f7_100%)] p-[18px]">
      <p className="w-full text-center font-simpler text-[16px] leading-[22px] text-v03-text-on-light">
        <span className="font-bold">{childName}</span>
        <span className="font-normal">
          {' '}
          {willReceive} את הדיל לאישור וברגע {whenApproves}, דמי הכיס ייטענו לארנק. ממחר אתם יוצאים
          לדרך.
        </span>
      </p>

      <p className="w-full text-center font-simpler text-[16px] leading-[24px] text-v03-text-on-light">
        <GrayChip>₪{formatNumber(weeklyBudget, 0)}</GrayChip> דמי כיס בארנק,{' '}
        <GrayChip>₪{formatNumber(hourlyRate, 1)}</GrayChip> עלות לשעת מסך והשבוע מתחיל מחר!{' '}
        <GrayChip>{startDateLabel}</GrayChip>!
      </p>
    </article>
  );
}

function GrayChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-[5px] bg-[#ececec] px-[8px] py-[3px] font-black text-[#292929]">
      {children}
    </span>
  );
}
