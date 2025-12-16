// Session Management API
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreSession } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Sessions');

const SESSIONS_COLLECTION = 'sessions';

/**
 * Create a new session in Firestore
 */
export async function createSession(
  userId: string,
  sessionData: Omit<FirestoreSession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const sessionRef = doc(sessionsRef);
    const now = new Date().toISOString();
    
    const session: FirestoreSession = {
      id: sessionRef.id,
      userId,
      ...sessionData,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(sessionRef, session);
    return sessionRef.id;
  } catch (error) {
    logger.error('Error creating session:', error);
    throw new Error('שגיאה ביצירת סשן. נסה שוב.');
  }
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<FirestoreSession | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return null;
    }
    
    return sessionSnap.data() as FirestoreSession;
  } catch (error) {
    logger.error('Error getting session:', error);
    throw new Error('שגיאה בטעינת הסשן.');
  }
}

/**
 * Get active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<FirestoreSession[]> {
  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('loginTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as FirestoreSession);
  } catch (error) {
    logger.error('Error getting user sessions:', error);
    throw new Error('שגיאה בטעינת הסשנים.');
  }
}

/**
 * Get current active session for a user (most recent, not expired)
 */
export async function getActiveSession(userId: string): Promise<FirestoreSession | null> {
  try {
    const sessions = await getUserSessions(userId);
    const now = new Date();
    
    // Find the most recent session that hasn't expired
    for (const session of sessions) {
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt > now) {
        return session;
      }
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting active session:', error);
    return null;
  }
}

/**
 * Update session data
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<Omit<FirestoreSession, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating session:', error);
    throw new Error('שגיאה בעדכון הסשן.');
  }
}

/**
 * Update last activity for a session
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await updateSession(sessionId, {
      lastActivity: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating session activity:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    logger.error('Error deleting session:', error);
    throw new Error('שגיאה במחיקת הסשן.');
  }
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  try {
    const sessions = await getUserSessions(userId);
    const deletePromises = sessions.map(session => deleteSession(session.id));
    await Promise.all(deletePromises);
  } catch (error) {
    logger.error('Error deleting all user sessions:', error);
    throw new Error('שגיאה במחיקת כל הסשנים.');
  }
}

/**
 * Clean up expired sessions (utility function, typically called from Cloud Function)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const now = new Date().toISOString();
    
    // Note: This query requires an index on expiresAt
    // For now, we'll get all sessions and filter client-side
    // In production, use a Cloud Function with admin SDK for better performance
    const querySnapshot = await getDocs(sessionsRef);
    const expiredSessions = querySnapshot.docs.filter(doc => {
      const session = doc.data() as FirestoreSession;
      return new Date(session.expiresAt) < new Date(now);
    });
    
    const deletePromises = expiredSessions.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return expiredSessions.length;
  } catch (error) {
    logger.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}

