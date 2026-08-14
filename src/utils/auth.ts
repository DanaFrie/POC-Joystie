// Firebase Authentication utilities
import type { 
  User,
  AuthError
} from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { getAuthErrorMessage } from '@/utils/auth-errors';

async function waitAuthStateReady(auth: object): Promise<void> {
  const ready = (auth as { authStateReady?: () => Promise<void> }).authStateReady;
  if (typeof ready === 'function') {
    await ready();
  }
}

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
 * Check if user is authenticated (non-anonymous).
 * Waits for Firebase Auth persistence to restore — do not use a raw
 * `currentUser` snapshot on first paint (it is often null briefly).
 */
export async function isAuthenticated(): Promise<boolean> {
  const auth = await getAuthInstance();
  await waitAuthStateReady(auth);
  const user = auth.currentUser;
  return Boolean(user && !user.isAnonymous);
}

/**
 * Get current user ID
 * Waits for auth state to be ready if needed
 * @param allowAnonymous — child game/onboarding uses anonymous Auth; default false for parent gates
 */
export async function getCurrentUserId(options?: {
  allowAnonymous?: boolean;
}): Promise<string | null> {
  const auth = await getAuthInstance();
  const allowAnonymous = options?.allowAnonymous === true;

  await waitAuthStateReady(auth);

  if (auth.currentUser && (allowAnonymous || !auth.currentUser.isAnonymous)) {
    return auth.currentUser.uid;
  }

  // Fallback if authStateReady is unavailable / raced
  return new Promise(async (resolve) => {
    const { onAuthStateChanged } = await import('firebase/auth');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user && (allowAnonymous || !user.isAnonymous) ? user.uid : null);
    });

    setTimeout(() => {
      unsubscribe();
      const u = auth.currentUser;
      resolve(u && (allowAnonymous || !u.isAnonymous) ? u.uid : null);
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
    
    // Use authDomain to construct the proper URL for password reset
    // This matches the template configuration in Firebase Console
    // The template uses: https://joystie-poc.firebaseapp.com/__/auth/action?mode=action&oobCode=code
    // We need to provide the URL where the user should land after clicking the link
    const authDomain = auth.app.options.authDomain;
    
    if (!authDomain) {
      throw new Error('authDomain not configured in Firebase');
    }
    
    // Continue URL after the user taps the reset link in email.
    const resetPath = '/login/reset-password';
    const resetUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${resetPath}`
        : `https://${authDomain}${resetPath}`;
    
    const actionCodeSettings = {
      url: resetUrl,
      handleCodeInApp: true,
    };
    
    logger.log('Sending password reset email:', {
      email,
      resetUrl: actionCodeSettings.url,
      authDomain: auth.app.options.authDomain,
      projectId: auth.app.options.projectId,
      windowLocation: typeof window !== 'undefined' ? window.location.href : 'N/A',
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
    // 4. URL not authorized in Firebase Console
    // 
    // To verify email templates are configured:
    // 1. Go to Firebase Console > Authentication > Templates > Password reset
    // 2. Ensure "Password reset" template is configured and enabled
    // 3. Check that the action URL in the template matches your app's domain
    // 4. Verify the template has proper content and is not empty
    // 5. For App Hosting: Add your App Hosting URL to Authorized domains in Firebase Console
    //    - Go to Authentication > Settings > Authorized domains
    //    - Add: joystie-poc--joystie-poc.us-central1.hosted.app (or your App Hosting URL)
    // 6. For localhost development, ensure the template allows localhost URLs
    // 
    // Common issues:
    // - Template not configured: Email won't be sent but Firebase returns success
    // - Wrong action URL: Email sent but link doesn't work
    // - Template disabled: Email won't be sent
    // - URL not authorized: Email won't be sent (check Authorized domains)
    // - localhost not allowed: Email won't be sent in development
    //
    // For App Hosting specifically:
    // - The resetUrl should match the URL where your app is hosted
    // - Make sure the URL is added to Authorized domains in Firebase Console
    // - The template in Firebase Console should use the same domain or a wildcard
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

export { getAuthErrorMessage } from '@/utils/auth-errors';

