/**
 * Server-side configuration constants
 * NOT exposed to client - only used in server/edge runtime
 * Includes security-sensitive values like rate limiting
 */

export const serverConfig = {
  // Rate limiting configuration
  rateLimit: {
    requestsPerWindow: 100,
    windowMinutes: 15,
    cleanupIntervalMinutes: 5,
  },

  // Firestore configuration
  firestore: {
    maxQueryLimit: 1000,
  },

  // API configuration
  api: {
    screenshotProcessingTimeout: 60000, // 60 seconds
  },
} as const;

// Type exports for type safety
export type ServerConfig = typeof serverConfig;
