'use client';

import type { ReactNode } from 'react';

type ChallengeDealRowProps = {
  label: string;
  value: string;
  large?: boolean;
};

/** Stacked label + mint value — child deal step / parent sent summary. */
export function ChallengeDealRow({ label, value, large }: ChallengeDealRowProps) {
  return (
    <div className="flex w-full flex-col items-center gap-1 text-center" dir="rtl">
      <span className="font-simpler text-[13px] font-semibold text-white/65">{label}</span>
      <span
        className={`font-simpler font-black text-[#00FFB3] ${
          large ? 'text-[32px] leading-[36px]' : 'text-[22px] leading-[26px]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type ChallengeDealSummaryCardProps = {
  children: ReactNode;
};

export function ChallengeDealSummaryCard({ children }: ChallengeDealSummaryCardProps) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[16px] bg-white/5 px-4 py-4 outline outline-1 outline-white/15">
      {children}
    </div>
  );
}

export function ChallengeDealSummaryDivider() {
  return <div className="h-px w-full bg-white/10" />;
}
