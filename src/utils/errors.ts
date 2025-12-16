// Error handling utilities
import { FirebaseError } from 'firebase/app';
import { createContextLogger } from './logger';

/**
 * Get user-friendly error message in Hebrew
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return getFirebaseErrorMessage(error.code);
  }
  
  if (error instanceof Error) {
    // If error already has a Hebrew message, return it
    if (error.message && /[\u0590-\u05FF]/.test(error.message)) {
      return error.message;
    }
    
    // Otherwise, return generic error
    return 'אירעה שגיאה. נסה שוב.';
  }
  
  return 'אירעה שגיאה לא ידועה. נסה שוב.';
}

/**
 * Get Firebase-specific error messages in Hebrew
 */
function getFirebaseErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    // Authentication errors
    'auth/email-already-in-use': 'כתובת האימייל כבר בשימוש',
    'auth/invalid-email': 'כתובת אימייל לא תקינה',
    'auth/operation-not-allowed': 'פעולה לא מורשית',
    'auth/weak-password': 'סיסמה חלשה מדי',
    'auth/user-disabled': 'החשבון הושבת',
    'auth/user-not-found': 'לא נמצא משתמש עם כתובת אימייל זו',
    'auth/wrong-password': 'סיסמה לא נכונה',
    'auth/too-many-requests': 'יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר',
    'auth/network-request-failed': 'שגיאת רשת. אנא בדוק את החיבור לאינטרנט',
    'auth/invalid-credential': 'פרטי התחברות לא נכונים',
    
    // Firestore errors
    'permission-denied': 'אין הרשאה לבצע פעולה זו',
    'unavailable': 'השירות לא זמין כרגע. נסה שוב מאוחר יותר',
    'deadline-exceeded': 'פעולה ארכה יותר מדי זמן. נסה שוב',
    'not-found': 'המשאב המבוקש לא נמצא',
    'already-exists': 'המשאב כבר קיים',
    'failed-precondition': 'תנאי מוקדם נכשל',
    'aborted': 'הפעולה בוטלה',
    'out-of-range': 'ערך מחוץ לטווח המותר',
    'unimplemented': 'פונקציה זו לא מיושמת',
    'internal': 'שגיאה פנימית. נסה שוב מאוחר יותר',
    'data-loss': 'אובדן נתונים',
    'unauthenticated': 'נדרשת התחברות',
  };
  
  return errorMessages[code] || 'אירעה שגיאה. נסה שוב.';
}

/**
 * Log error for debugging (enabled in intgr, disabled in prod)
 */
export function logError(error: unknown, context?: string): void {
  const logger = createContextLogger(context || 'Error');
  logger.error(error);
}

