/**
 * Format a number to remove decimal point if the decimal part is 0
 * Examples:
 * - 12.0 -> "12"
 * - 12.5 -> "12.5"
 * - 0.0 -> "0"
 * - 3.0 -> "3"
 */
export function formatNumber(num: number, decimals: number = 1): string {
  const formatted = num.toFixed(decimals);
  // Remove trailing zeros and decimal point if not needed
  if (decimals > 0) {
    return formatted.replace(/\.?0+$/, '');
  }
  return formatted;
}

/** Snap to 1 decimal for Hebrew hour noun matching. */
function snapHoursLabel(hours: number): number {
  return Math.round(hours * 10) / 10;
}

/**
 * Hebrew hours noun — 1=שעה, 2=שעתיים, 3+=N שעות (½ / 1½ kept for onboarding).
 */
export function formatHebrewHoursLabel(hours: number): string {
  const n = snapHoursLabel(hours);
  if (n === 1) return 'שעה';
  if (n === 2) return 'שעתיים';
  if (n === 0.5) return 'חצי שעה';
  if (n === 1.5) return 'שעה וחצי';
  return `${formatNumber(hours)} שעות`;
}

/** Format daily screen time goal (in hours) for display: "שעה" | "שעתיים" | "X שעות" */
export function formatScreenTimeGoalHours(hours: number): string {
  return formatHebrewHoursLabel(hours);
}
