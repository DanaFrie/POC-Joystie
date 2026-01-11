// Firebase Authentication utilities
import type { 
  User,
  AuthError
} from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, displayName?: string): Promise<User> {
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const auth = await getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name if provided
    if (displayName && user) {
      await updateProfile(user, { displayName });
    }
    
    return user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const auth = await getAuthInstance();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    const { signOut } = await import('firebase/auth');
    const auth = await getAuthInstance();
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const auth = await getAuthInstance();
  return auth.currentUser;
}

/**
 * Listen to authentication state changes
 */
export async function onAuthStateChange(callback: (user: User | null) => void): Promise<() => void> {
  const { onAuthStateChanged } = await import('firebase/auth');
  const auth = await getAuthInstance();
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const auth = await getAuthInstance();
  return auth.currentUser !== null;
}

/**
 * Get current user ID
 * Waits for auth state to be ready if needed
 */
export async function getCurrentUserId(): Promise<string | null> {
  const auth = await getAuthInstance();
  
  // If we have a current user, return it immediately
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  
  // Otherwise, wait a bit for auth state to initialize
  // Firebase Auth persists sessions, but it might take a moment to restore
  return new Promise(async (resolve) => {
    const { onAuthStateChanged } = await import('firebase/auth');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Only listen once
      resolve(user?.uid || null);
    });
    
    // Timeout after 2 seconds if auth state doesn't change
    setTimeout(() => {
      unsubscribe();
      resolve(auth.currentUser?.uid || null);
    }, 2000);
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const { createContextLogger } = await import('@/utils/logger');
  const logger = createContextLogger('sendPasswordReset');
  
  try {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    const auth = await getAuthInstance();
    
    // Get the current URL to determine the base URL
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://joystie.com'; // Fallback for server-side
    
    const actionCodeSettings = {
      url: `${baseUrl}/reset-password`,
      handleCodeInApp: true,
    };
    
    logger.log('Sending password reset email:', {
      email,
      baseUrl,
      resetUrl: actionCodeSettings.url,
      authDomain: auth.app.options.authDomain,
      projectId: auth.app.options.projectId,
    });
    
    // Note: fetchSignInMethodsForEmail is unreliable - it may return empty array
    // even when user exists, so we don't use it for validation
    
    const startTime = Date.now();
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    const duration = Date.now() - startTime;
    
    logger.log('Password reset email sent successfully (Firebase returned success)', {
      email,
      duration: `${duration}ms`,
      resetUrl: actionCodeSettings.url,
    });
    
    // IMPORTANT: Firebase Auth always returns success even if:
    // 1. Email template is not configured in Firebase Console
    // 2. User doesn't exist (for security reasons)
    // 3. Email sending fails for other reasons
    // 
    // To verify email templates are configured:
    // 1. Go to Firebase Console > Authentication > Templates
    // 2. Ensure "Password reset" template is configured and enabled
    // 3. Check that the action URL in the template matches your app's domain
    // 4. Verify the template has proper content and is not empty
    // 5. For localhost development, ensure the template allows localhost URLs
    // 
    // Common issues:
    // - Template not configured: Email won't be sent but Firebase returns success
    // - Wrong action URL: Email sent but link doesn't work
    // - Template disabled: Email won't be sent
    // - localhost not allowed: Email won't be sent in development
  } catch (error) {
    logger.error('Password reset email error:', error);
    const authError = error as AuthError;
    const errorCode = authError.code || 'unknown';
    const errorMessage = getAuthErrorMessage(errorCode);
    
    logger.error('Password reset error details:', {
      code: errorCode,
      message: errorMessage,
      originalError: authError.message,
    });
    
    throw new Error(errorMessage);
  }
}

/**
 * Confirm password reset with action code
 */
export async function confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  try {
    const { confirmPasswordReset: firebaseConfirmPasswordReset } = await import('firebase/auth');
    const auth = await getAuthInstance();
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError.code));
  }
}

/**
 * Get user-friendly error messages in Hebrew
 */
function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'כתובת האימייל כבר בשימוש',
    'auth/invalid-email': 'כתובת אימייל לא תקינה',
    'auth/operation-not-allowed': 'פעולה לא מורשית',
    'auth/weak-password': 'סיסמה חלשה מדי. אנא השתמש בסיסמה חזקה יותר',
    'auth/user-disabled': 'החשבון הושבת',
    'auth/user-not-found': 'לא נמצא משתמש עם כתובת אימייל זו',
    'auth/wrong-password': 'סיסמה לא נכונה',
    'auth/too-many-requests': 'יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר',
    'auth/network-request-failed': 'שגיאת רשת. אנא בדוק את החיבור לאינטרנט',
    'auth/invalid-credential': 'פרטי התחברות לא נכונים',
    'auth/expired-action-code': 'קישור פג תוקף. אנא בקש קישור חדש',
    'auth/invalid-action-code': 'קישור לא תקין. אנא בקש קישור חדש',
  };
  
  return errorMessages[code] || 'אירעה שגיאה בהתחברות. נסה שוב.';
}

