/**
 * Client-side configuration constants
 * Safe to expose to browser - included in client bundle
 */

export const clientConfig = {
  // Token configuration
  token: {
    expirationDays: 30,
  },

  // Session configuration (localStorage — see utils/session.ts)
  session: {
    durationDays: 1,
    inactivityTimeoutMinutes: 4 * 60, // 4 hours
  },
} as const;

// Type exports for type safety
export type ClientConfig = typeof clientConfig;
