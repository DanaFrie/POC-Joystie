/**
 * Centralized logging service
 * Disables all client-side logs in production (main branch)
 * Logs are enabled only in development and integration environments
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
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'joystie-poc-prod' ||
    process.env.NODE_ENV === 'production'
  );
};

// Create logger that respects production mode
const createLogger = (context: string): Logger => {
  const shouldLog = !isProduction();
  
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

// Default logger
export const logger = createLogger('');

// Create logger with context
export const createContextLogger = (context: string): Logger => createLogger(context);

// Export for convenience
export default logger;

