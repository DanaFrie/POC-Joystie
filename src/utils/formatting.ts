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

