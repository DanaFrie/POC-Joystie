/**
 * Client-side configuration constants
 * Safe to expose to browser - included in client bundle
 */

export const clientConfig = {
  // Token configuration
  token: {
    expirationDays: 14,
  },

  // Session configuration
  session: {
    durationDays: 8,
    inactivityTimeoutMinutes: 48 * 60, // 48 hours
  },

  // Challenge configuration
  challenge: {
    totalWeeks: 4,
    challengeDays: 6, // Sunday-Friday (6 days)
    budgetDivision: 6, // Divide selectedBudget by this number to get dailyBudget
    defaultDailyScreenTimeGoal: 3, // hours
    defaultSelectedBudget: 100, // For simulation/testing
  },
} as const;

// Type exports for type safety
export type ClientConfig = typeof clientConfig;
