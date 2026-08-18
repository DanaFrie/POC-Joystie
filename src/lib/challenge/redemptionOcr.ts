import type { ProcessScreenshotResponse } from '@/lib/api/screenshot';
import { moneyBurned, remainingOnCard, roundMoney } from '@/lib/challenge/v03ChallengeMath';

/** Sum screen-time minutes from weekly OCR (6 challenge days). */
export function totalMinutesFromWeeklyOcr(data: {
  minutes?: number;
  minutes_per_day?: Record<string, number>;
}): number {
  const perDay = data.minutes_per_day;
  if (perDay && Object.keys(perDay).length > 0) {
    return Object.values(perDay).reduce((sum, mins) => sum + (mins || 0), 0);
  }
  return Math.max(0, data.minutes ?? 0);
}

export type RedemptionSettlement = {
  totalMinutes: number;
  totalHours: number;
  weeklyBudget: number;
  hourlyRate: number;
  burnedAmount: number;
  remainingAmount: number;
  minutesPerDay?: Record<string, number>;
};

export function computeRedemptionSettlement(
  weeklyBudget: number,
  hourlyRate: number,
  ocr: Pick<ProcessScreenshotResponse, 'minutes' | 'minutes_per_day'>
): RedemptionSettlement {
  const totalMinutes = totalMinutesFromWeeklyOcr(ocr);
  const totalHours = roundMoney(totalMinutes / 60, 1);
  const burnedAmount = roundMoney(moneyBurned(totalHours, hourlyRate));
  const remainingAmount = remainingOnCard(weeklyBudget, totalHours, hourlyRate);

  return {
    totalMinutes,
    totalHours,
    weeklyBudget,
    hourlyRate,
    burnedAmount,
    remainingAmount,
    minutesPerDay: ocr.minutes_per_day,
  };
}

export function formatMinutesAsHours(minutes: number): string {
  const hours = minutes / 60;
  if (hours < 1) return `${Math.round(minutes)} דק׳`;
  const rounded = roundMoney(hours, 1);
  return `${rounded} שע׳`;
}

export const REDEMPTION_CHALLENGE_DAYS_LABEL = 'ששת ימי הדיל';
