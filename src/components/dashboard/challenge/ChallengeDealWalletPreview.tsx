'use client';

import { DashboardSavingsCard } from '@/components/dashboard/DashboardSavingsCard';
import { DashboardConversionBar } from '@/components/dashboard/DashboardChildSections';
import { formatNumber } from '@/utils/formatting';

type ChallengeDealWalletPreviewProps = {
  weeklyBudget: number;
  hourlyRate: number;
};

const DEAL_RATE_MINUTES = 60;

/** Dashboard savings card in deal step — conversion bar below (60 דק׳ → rate). */
export function ChallengeDealWalletPreview({
  weeklyBudget,
  hourlyRate,
}: ChallengeDealWalletPreviewProps) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full max-w-[314px]">
        <DashboardSavingsCard balance={weeklyBudget} variant="child" dimmed={false} />
      </div>
      <div className="w-full max-w-[314px]">
        <DashboardConversionBar
          savedMinutes={DEAL_RATE_MINUTES}
          balance={hourlyRate}
          moneyLabel={`${formatNumber(hourlyRate, 1)} ש"ח`}
        />
      </div>
    </div>
  );
}
