import type { AuthError, User, UserCredential } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { getAuthErrorFromUnknown } from '@/utils/auth-errors';

export type OAuthProviderId = 'google.com' | 'apple.com';

export type OAuthSignInResult =
  | { ok: true; user: User; isNewUser: boolean }
  | { ok: false; errorMessage: string; errorCode: string };

async function resolveIsNewUser(credential: UserCredential): Promise<boolean> {
  const { getAdditionalUserInfo } = await import('firebase/auth');
  const info = getAdditionalUserInfo(credential);
  return info?.isNewUser ?? false;
}

async function signInWithProviderPopup(providerId: OAuthProviderId): Promise<OAuthSignInResult> {
  try {
    const { signInWithPopup, GoogleAuthProvider, OAuthProvider } = await import('firebase/auth');
    const auth = await getAuthInstance();

    const provider =
      providerId === 'google.com'
        ? new GoogleAuthProvider()
        : new OAuthProvider('apple.com');

    if (providerId === 'google.com') {
      provider.setCustomParameters({ prompt: 'select_account' });
    }
    if (providerId === 'apple.com') {
      provider.addScope('email');
      provider.addScope('name');
    }

    const credential = await signInWithPopup(auth, provider);
    const isNewUser = await resolveIsNewUser(credential);
    return { ok: true, user: credential.user, isNewUser };
  } catch (error) {
    const authError = error as AuthError;
    return {
      ok: false,
      errorCode: authError.code || 'unknown',
      errorMessage: getAuthErrorFromUnknown(error),
    };
  }
}

async function signInWithProviderRedirect(providerId: OAuthProviderId): Promise<void> {
  const { signInWithRedirect, GoogleAuthProvider, OAuthProvider } = await import('firebase/auth');
  const auth = await getAuthInstance();
  const provider =
    providerId === 'google.com'
      ? new GoogleAuthProvider()
      : new OAuthProvider('apple.com');
  await signInWithRedirect(auth, provider);
}

/**
 * Google sign-in. Tries popup; caller may fall back to redirect if popup-blocked.
 */
export async function signInWithGoogle(options?: {
  useRedirect?: boolean;
}): Promise<OAuthSignInResult | { ok: true; redirecting: true }> {
  if (options?.useRedirect) {
    await signInWithProviderRedirect('google.com');
    return { ok: true, redirecting: true };
  }
  const result = await signInWithProviderPopup('google.com');
  if (!result.ok && result.errorCode === 'auth/popup-blocked') {
    await signInWithProviderRedirect('google.com');
    return { ok: true, redirecting: true };
  }
  return result;
}

/**
 * Apple sign-in. Tries popup; falls back to redirect on popup-blocked.
 */
export async function signInWithApple(options?: {
  useRedirect?: boolean;
}): Promise<OAuthSignInResult | { ok: true; redirecting: true }> {
  if (options?.useRedirect) {
    await signInWithProviderRedirect('apple.com');
    return { ok: true, redirecting: true };
  }
  const result = await signInWithProviderPopup('apple.com');
  if (!result.ok && result.errorCode === 'auth/popup-blocked') {
    await signInWithProviderRedirect('apple.com');
    return { ok: true, redirecting: true };
  }
  return result;
}

/**
 * Call once on login page mount after redirect-based OAuth.
 */
export async function completeOAuthRedirectIfNeeded(): Promise<OAuthSignInResult | null> {
  try {
    const { getRedirectResult, getAdditionalUserInfo } = await import('firebase/auth');
    const auth = await getAuthInstance();
    const credential = await getRedirectResult(auth);
    if (!credential?.user) return null;
    const info = getAdditionalUserInfo(credential);
    return {
      ok: true,
      user: credential.user,
      isNewUser: info?.isNewUser ?? false,
    };
  } catch (error) {
    return {
      ok: false,
      errorCode: (error as AuthError).code || 'unknown',
      errorMessage: getAuthErrorFromUnknown(error),
    };
  }
}
