// Session management utilities
import { clientConfig } from '@/config/client.config';

export interface SessionData {
  userId: string;
  loginTime: string;
  expiresAt: string;
}

const SESSION_KEY = 'session';

/**
 * Create a new session
 */
export function createSession(userId: string): SessionData {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + clientConfig.session.durationDays * 24 * 60 * 60 * 1000);
  
  const sessionData: SessionData = {
    userId,
    loginTime: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem('lastActivity', now.toISOString());
  }
  
  return sessionData;
}

/**
 * Get current session
 */
export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  
  try {
    return JSON.parse(sessionStr) as SessionData;
  } catch {
    return null;
  }
}

/**
 * Check if session is valid (not expired)
 */
export function isSessionValid(): boolean {
  const session = getSession();
  if (!session) return false;
  
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  
  // Check if session expired
  if (now > expiresAt) {
    clearSession();
    return false;
  }
  
  // Check inactivity timeout
  const lastActivityStr = localStorage.getItem('lastActivity');
  if (lastActivityStr) {
    const lastActivity = new Date(lastActivityStr);
    const inactivityTimeout = new Date(lastActivity.getTime() + clientConfig.session.inactivityTimeoutMinutes * 60 * 1000);
    
    if (now > inactivityTimeout) {
      clearSession();
      return false;
    }
  }
  
  // Update last activity
  updateLastActivity();
  
  return true;
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastActivity', new Date().toISOString());
  }
}

/**
 * Clear session (logout)
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('lastActivity');
  }
}

/**
 * Extend session (refresh expiration)
 */
export function extendSession(): void {
  const session = getSession();
  if (!session) return;
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + clientConfig.session.durationDays * 24 * 60 * 60 * 1000);
  
  const updatedSession: SessionData = {
    ...session,
    expiresAt: expiresAt.toISOString()
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    updateLastActivity();
  }
}

/**
 * Get time until session expires (in minutes)
 */
export function getTimeUntilExpiry(): number {
  const session = getSession();
  if (!session) return 0;
  
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  const diff = expiresAt.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(diff / (60 * 1000)));
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return isSessionValid();
}

/**
 * Get current user ID
 */
export function getCurrentUserId(): string | null {
  const session = getSession();
  return session?.userId || null;
}

