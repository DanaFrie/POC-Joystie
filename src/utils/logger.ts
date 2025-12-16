/**
 * Centralized logging service
 * Disables all client-side logs in production (main branch)
 * Logs are enabled only integration environment
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

// Check if we're in production (main branch / prod environment)
const isProduction = (): boolean => {
  // IMPORTANT: Next.js only replaces static references to process.env.NEXT_PUBLIC_* at build time
  // We MUST use direct static reference: process.env.NEXT_PUBLIC_ENV (not dynamic access)
  // Check NEXT_PUBLIC_ENV first (set in apphosting.yaml)
  // intgr = logs enabled, prod = logs disabled
  if (process.env.NEXT_PUBLIC_ENV === 'prod') {
    return true;
  }
  if (process.env.NEXT_PUBLIC_ENV === 'intgr') {
    return false;
  }
  
  // Fallback: check NODE_ENV or project ID
  if (typeof window === 'undefined') {
    // Server-side: check NODE_ENV
    return process.env.NODE_ENV === 'production';
  }
  // Client-side: check project ID or NODE_ENV
  // Use static reference for NEXT_PUBLIC_FIREBASE_PROJECT_ID
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'joystie-poc-prod' ||
    process.env.NODE_ENV === 'production'
  );
};

// Create logger that respects production mode
const createLogger = (context: string): Logger => {
  const isProd = isProduction();
  const shouldLog = !isProd;
  
  const log = (level: LogLevel, ...args: any[]) => {
    // Always log errors, even in production
    if (shouldLog || level === 'error') {
      const prefix = context ? `[${context}]` : '';
      console[level](prefix, ...args);
    }
  };

  return {
    log: (...args) => log('log', ...args),
    warn: (...args) => log('warn', ...args),
    error: (...args) => log('error', ...args), // Errors always logged
    info: (...args) => log('info', ...args),
    debug: (...args) => log('debug', ...args),
  };
};

// Default logger - initialize immediately
export const logger = createLogger('');

// Create logger with context
export const createContextLogger = (context: string): Logger => createLogger(context);

// Export for convenience
export default logger;

