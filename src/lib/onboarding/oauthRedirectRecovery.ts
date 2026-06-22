import {
  clearOnboardingAccountCreated,
  isOnboardingAccountCreated,
} from '@/lib/onboarding/persistOnboardingAccount';
import {
  clearOAuthSessionFlags,
  isFreshOAuthPending,
  isOAuthRedirectRecoverable,
  readOAuthProvider,
} from '@/lib/onboarding/oauthSession';
import { getAuthInstance } from '@/lib/firebase';
import {
  clearOAuthRedirectCapture,
  getRestrictedOAuthMessage,
  isLikelyOAuthRedirectReturn,
  isRestrictedOAuthEnvironment,
  resolveOAuthSignInAfterRedirect,
  type OAuthSignInResult,
} from '@/utils/auth-oauth';
import { isFirebaseAppHostingOrigin } from '@/utils/is-firebase-app-hosting';
import { createContextLogger } from '@/utils/logger';

const oauthLog = createContextLogger('OAuthRecovery');

export type OAuthRedirectRecoveryOutcome =
  | { status: 'skipped' }
  | { status: 'error'; message: string }
  | { status: 'success'; result: OAuthSignInResult & { ok: true } };

let recoveryPromise: Promise<OAuthRedirectRecoveryOutcome> | null = null;

async function shouldSkipRecovery(): Promise<boolean> {
  if (!isOnboardingAccountCreated()) {
    const auth = await getAuthInstance();
    if (auth.currentUser) return false;
    if (!isFreshOAuthPending() && !isLikelyOAuthRedirectReturn()) {
      oauthLog.log('skip:stale-pending');
      clearOAuthSessionFlags();
      return true;
    }
    return false;
  }

  const auth = await getAuthInstance();
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    oauthLog.log('skip:account-exists', {
      uid: auth.currentUser.uid,
      projectId: auth.app.options.projectId,
    });
    clearOAuthSessionFlags();
    return true;
  }

  oauthLog.warn('stale-account-flag-without-auth — continuing recovery');
  clearOnboardingAccountCreated();
  return false;
}

/**
 * Singleton redirect recovery — survives React Strict Mode double-mount.
 */
export function recoverOAuthRedirectSignIn(): Promise<OAuthRedirectRecoveryOutcome> {
  const pending = isOAuthRedirectRecoverable();
  if (!pending) {
    oauthLog.log('skip:not-pending');
    return Promise.resolve({ status: 'skipped' });
  }

  if (!recoveryPromise) {
    recoveryPromise = (async (): Promise<OAuthRedirectRecoveryOutcome> => {
      try {
        if (await shouldSkipRecovery()) {
          return { status: 'skipped' };
        }

        if (isRestrictedOAuthEnvironment()) {
          oauthLog.warn('failed:restricted-environment');
          clearOAuthSessionFlags();
          clearOAuthRedirectCapture();
          return { status: 'error', message: getRestrictedOAuthMessage() };
        }

        const pendingProvider = readOAuthProvider();
        oauthLog.log('start', { provider: pendingProvider });
        const result = await resolveOAuthSignInAfterRedirect();
        if (!result) {
          oauthLog.warn('failed:no-result');
          clearOAuthSessionFlags();
          clearOAuthRedirectCapture();
          return {
            status: 'error',
            message: isFirebaseAppHostingOrigin()
              ? 'לא הצלחנו להשלים את ההתחברות. ודאו שהדומיין של App Hosting מאושר ב-Firebase Authentication, ונסו שוב.'
              : 'לא הצלחנו להשלים את ההתחברות. נסו שוב.',
          };
        }
        if (!result.ok) {
          oauthLog.warn('failed:auth-error', {
            code: result.errorCode,
            message: result.errorMessage,
          });
          clearOAuthSessionFlags();
          clearOAuthRedirectCapture();
          return { status: 'error', message: result.errorMessage };
        }
        const providerIds = result.user.providerData.map((p) => p.providerId);
        const oauthProviderId =
          pendingProvider === 'apple' ? 'apple.com' : 'google.com';
        if (!providerIds.includes(oauthProviderId)) {
          oauthLog.warn('failed:wrong-provider', {
            expected: oauthProviderId,
            providerIds,
            email: result.user.email,
          });
          clearOAuthSessionFlags();
          clearOAuthRedirectCapture();
          return {
            status: 'error',
            message:
              'ההתחברות לא הושלמה עם Google/Apple. נסו שוב או השתמשו בדוא״ל וסיסמה.',
          };
        }
        oauthLog.log('success', {
          uid: result.user.uid,
          email: result.user.email,
          providerIds,
        });
        return { status: 'success', result };
      } catch (error) {
        oauthLog.error('failed:exception', error);
        clearOAuthSessionFlags();
        clearOAuthRedirectCapture();
        return {
          status: 'error',
          message: 'לא הצלחנו להשלים את ההתחברות. נסו שוב.',
        };
      } finally {
        recoveryPromise = null;
      }
    })();
  }

  return recoveryPromise;
}
