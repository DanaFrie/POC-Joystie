'use client';

import Image from 'next/image';
import { OnboardingCountStepper } from '@/components/onboarding/children-count/OnboardingCountStepper';
import { formatNumber } from '@/utils/formatting';
import {
  CHILD_DASHBOARD_ASSETS,
} from '@/constants/child-dashboard-layout';

type ChallengeConversionRateControlProps = {
  /** Minutes of screen time represented on the pill (e.g. 60 = 1 hour). */
  minutes: number;
  /** ₪ per hour of screen time. */
  hourlyRate: number;
  onHourlyRateChange: (rate: number) => void;
  minRate: number;
  maxRate: number;
  /** Label left side — money after conversion. */
  moneyLabel?: string;
};

/**
 * Setup conversion control — same visual language as DashboardConversionBar,
 * with an editable ₪/hour rate (loss-aversion price of one screen hour).
 */
export function ChallengeConversionRateControl({
  minutes,
  hourlyRate,
  onHourlyRateChange,
  minRate,
  maxRate,
  moneyLabel,
}: ChallengeConversionRateControlProps) {
  const label = moneyLabel ?? `המרה ל-${formatNumber(hourlyRate, 0)} ₪ / שעה`;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="relative h-14 w-full overflow-visible"
        dir="ltr"
        style={{
          borderRadius: 300,
          background: 'rgba(0, 0, 0, 0.00)',
          boxShadow:
            'inset 0 0 0 1px rgba(197, 237, 225, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          className="pointer-events-none absolute left-[-3px] top-0 z-[1]"
          style={{ width: 54.364, height: 52 }}
          aria-hidden
        >
          <Image
            src={CHILD_DASHBOARD_ASSETS.conversionCoins}
            alt=""
            width={55}
            height={52}
            className="h-full w-full max-w-none object-contain"
            unoptimized
          />
        </div>

        <p
          className="absolute left-1/2 top-1/2 w-[150px] -translate-x-[calc(50%+20px)] -translate-y-1/2 text-center font-simpler tracking-[-0.21px]"
          dir="rtl"
          style={{
            color: 'rgba(255, 255, 255, 0.55)',
            fontSize: 13,
            fontWeight: 700,
            lineHeight: '14px',
          }}
        >
          {label}
        </p>

        <div
          className="absolute right-[6px] top-[6px] z-[1] flex h-[44px] w-[108px] items-center justify-center px-2"
          style={{
            borderRadius: 300,
            background: 'rgba(18, 57, 54, 0.50)',
            boxShadow: 'inset 0 0 0 1px rgba(0, 231, 162, 0.28)',
          }}
        >
          <div className="flex items-center">
            <span className="relative z-[1] -mr-[9.625px] size-[14px] shrink-0">
              <Image
                src={CHILD_DASHBOARD_ASSETS.conversionChevron}
                alt=""
                width={14}
                height={14}
                className="size-full"
                unoptimized
              />
            </span>
            <span className="size-[14px] shrink-0">
              <Image
                src={CHILD_DASHBOARD_ASSETS.conversionChevron}
                alt=""
                width={14}
                height={14}
                className="size-full"
                unoptimized
              />
            </span>
          </div>

          <div className="flex items-center gap-[6px]">
            <span
              className="whitespace-nowrap text-center font-simpler"
              dir="rtl"
              style={{
                color: 'rgba(197, 237, 225, 0.55)',
                fontSize: 14,
                fontWeight: 600,
                lineHeight: '14px',
              }}
            >
              {`${Math.round(minutes)} דק׳`}
            </span>
            <Image
              src={CHILD_DASHBOARD_ASSETS.conversionClock}
              alt=""
              width={18}
              height={18}
              className="size-[18px] shrink-0"
              unoptimized
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-2">
        <p className="text-center font-simpler text-[14px] font-semibold leading-[18px] text-white/70">
          כמה שווה שעת מסך? (₪)
        </p>
        <OnboardingCountStepper
          value={hourlyRate}
          min={minRate}
          max={maxRate}
          onChange={onHourlyRateChange}
        />
      </div>
    </div>
  );
}
