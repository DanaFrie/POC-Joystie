/**
 * v0.3 challenge economy — loss aversion on a virtual card.
 * Parent loads weekly budget B; each screen-time hour burns rate R from the card.
 * Settlement uses total hours over the 6 challenge days only (no daily graph).
 */

export const V03_CHALLENGE_DAYS = 6;

export type V03ChallengeSetupValues = {
  /** Weekly budget loaded onto the virtual child card (₪). */
  weeklyBudget: number;
  /** ₪ burned per hour of screen time. */
  hourlyRate: number;
  /** Estimated daily screen hours from onboarding (or last-challenge average). */
  estimatedDailyHours: number;
};

/** Challenge starts the calendar day after setup. */
export function challengeStartDateFromSetup(setupDate: Date = new Date()): Date {
  const start = new Date(setupDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);
  return start;
}

/** First redemption-eligible calendar day (day 7 from start = start + 6). */
export function redemptionOpenDateFromStart(startDate: Date): Date {
  const open = new Date(startDate);
  open.setHours(0, 0, 0, 0);
  open.setDate(open.getDate() + V03_CHALLENGE_DAYS);
  return open;
}

export function isRedemptionOpen(startDate: Date, now: Date = new Date()): boolean {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today.getTime() >= redemptionOpenDateFromStart(startDate).getTime();
}

/** Hours that fit on the card at the current rate. */
export function weeklyHourAllowance(weeklyBudget: number, hourlyRate: number): number {
  if (hourlyRate <= 0) return 0;
  return weeklyBudget / hourlyRate;
}

/** ₪ burned for total screen hours over the challenge window. */
export function moneyBurned(totalScreenHours: number, hourlyRate: number): number {
  return Math.max(0, totalScreenHours * hourlyRate);
}

/** Remaining on virtual card after deload. */
export function remainingOnCard(
  weeklyBudget: number,
  totalScreenHours: number,
  hourlyRate: number
): number {
  return Math.max(0, weeklyBudget - moneyBurned(totalScreenHours, hourlyRate));
}

/**
 * Projected remaining if the child keeps the estimated daily average for 6 days.
 * This is the "how much could they save" note in parent setup.
 */
export function projectedRemainingAtEstimatedUsage(values: V03ChallengeSetupValues): number {
  const totalHours = values.estimatedDailyHours * V03_CHALLENGE_DAYS;
  return remainingOnCard(values.weeklyBudget, totalHours, values.hourlyRate);
}

export function roundMoney(amount: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(amount * factor) / factor;
}

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
