'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { LoginScreen } from '@/components/login/LoginScreen';
import { isLoggedIn, clearSession } from '@/utils/session';
import { signIn, getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
import { finishAuthenticatedUserNavigation } from '@/lib/auth/postLoginNavigation';
import {
  isRegisteredJoystieAccount,
} from '@/lib/auth/signupAccountStatus';
import {
  getUnknownOAuthAccountMessage,
  rejectUnknownOAuthLogin,
} from '@/lib/auth/rejectUnknownOAuthLogin';
import { beginOnboardingSignupFromLogin } from '@/lib/onboarding/parentFlowSession';
import { getAuthErrorFromUnknown } from '@/utils/auth-errors';
import { createContextLogger } from '@/utils/logger';
import { clearOAuthSessionFlags, isOAuthRedirectRecoverable } from '@/lib/onboarding/oauthSession';
import {
  prefersOAuthRedirect,
  primeOAuthRedirectCapture,
  resolveOAuthSignInAfterRedirect,
  signInWithOAuth,
  isRestrictedOAuthEnvironment,
  getRestrictedOAuthMessage,
  isLikelyOAuthRedirectReturn,
  getOAuthUserEmail,
  IS_APPLE_OAUTH_ENABLED,
} from '@/utils/auth-oauth';
import type { User } from 'firebase/auth';

const logger = createContextLogger('Login');

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams?.get('email') ?? '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [oauthError, setOauthError] = useState('');
  const router = useRouter();

  const clearAuthErrors = () => {
    setPasswordError('');
    setOauthError('');
  };

  const showResumeSignupBanner = searchParams?.get('existing') === '1';
  const showPasswordProviderBanner = searchParams?.get('method') === 'password';

  const finishLogin = useCallback(
    async (uid: string) => {
      await finishAuthenticatedUserNavigation(uid, router, {
        source: showResumeSignupBanner ? 'signup_existing' : 'login',
      });
    },
    [router, showResumeSignupBanner]
  );

  const completeOAuthLogin = useCallback(
    async (uid: string) => {
      await finishLogin(uid);
    },
    [finishLogin]
  );

  const handleOAuthLoginResult = useCallback(
    async (result: { user: User; isNewUser: boolean }) => {
      let user = result.user;
      // Apple often omits email / providerData until reload on repeat sign-in.
      if (
        !getOAuthUserEmail(user) ||
        user.providerData.length === 0
      ) {
        try {
          await user.reload();
          const auth = await import('@/lib/firebase').then((m) => m.getAuthInstance());
          const firebaseAuth = await auth;
          if (firebaseAuth.currentUser) {
            user = firebaseAuth.currentUser;
          }
        } catch (reloadError) {
          logger.warn('OAuth login reload failed:', reloadError);
        }
      }

      const registered = await isRegisteredJoystieAccount(
        user.uid,
        getOAuthUserEmail(user)
      );

      if (!registered) {
        const auth = await import('@/utils/auth');
        const { getAuthInstance } = await import('@/lib/firebase');
        const firebaseAuth = await getAuthInstance();
        const firebaseUser = firebaseAuth.currentUser;
        if (firebaseUser) {
          await rejectUnknownOAuthLogin(firebaseUser);
        } else {
          await auth.signOutUser();
          clearSession();
        }
        setOauthError(getUnknownOAuthAccountMessage());
        return;
      }

      await completeOAuthLogin(user.uid);
    },
    [completeOAuthLogin]
  );

  const checkUserAndRedirect = useCallback(async () => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        router.push('/login');
        return;
      }

      await finishLogin(userId);
    } catch (error) {
      logger.error('Error checking user:', error);
      router.push('/onboarding');
    }
  }, [finishLogin, router]);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (!isLoggedIn()) {
        return;
      }

      try {
        const { isAuthenticated } = await import('@/utils/auth');
        const authenticated = await isAuthenticated();
        if (authenticated) {
          await checkUserAndRedirect();
        } else {
          logger.warn('localStorage session exists but Firebase Auth not authenticated');
          clearSession();
          try {
            const { signOutUser } = await import('@/utils/auth');
            await signOutUser();
          } catch (_) {
            // Ignore sign-out errors
          }
        }
      } catch (error) {
        logger.error('Error checking auth:', error);
        clearSession();
        try {
          const { signOutUser } = await import('@/utils/auth');
          await signOutUser();
        } catch (_) {
          // Ignore sign-out errors
        }
      }
    };

    checkAuthAndRedirect();
  }, [checkUserAndRedirect]);

  useEffect(() => {
    primeOAuthRedirectCapture();

    if (!isOAuthRedirectRecoverable() && !isLikelyOAuthRedirectReturn()) {
      return;
    }

    const resolveOAuthRedirect = async () => {
      const result = await resolveOAuthSignInAfterRedirect({
        maxWaitMs: 4000,
        trustAnySignedInUser: true,
      });
      if (!result?.ok) {
        return;
      }

      setOauthLoading(null);
      setIsSubmitting(true);
      clearAuthErrors();

      try {
        clearOAuthSessionFlags();
        await handleOAuthLoginResult(result);
      } catch (error) {
        logger.error('OAuth redirect login error:', error);
        setOauthError(getAuthErrorFromUnknown(error) || 'אירעה שגיאה בהתחברות. נסה שוב.');
      } finally {
        setIsSubmitting(false);
      }
    };

    void resolveOAuthRedirect();
  }, [handleOAuthLoginResult]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (passwordError || oauthError) {
      clearAuthErrors();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'אנא הכנס אימייל';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'כתובת אימייל לא תקינה';
      }
    }
    if (!formData.password.trim()) {
      newErrors.password = 'אנא הכנס סיסמה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || oauthLoading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearAuthErrors();

    try {
      const email = formData.email.trim().toLowerCase();
      const firebaseUser = await signIn(email, formData.password);
      await completeOAuthLogin(firebaseUser.uid);
    } catch (error) {
      logger.error('Login error:', error);
      const errorMessage = getAuthErrorFromUnknown(error);
      setPasswordError(errorMessage || 'אירעה שגיאה בהתחברות. נסה שוב.');
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (provider === 'apple' && !IS_APPLE_OAUTH_ENABLED) {
      return;
    }
    if (isRestrictedOAuthEnvironment()) {
      setOauthError(getRestrictedOAuthMessage());
      return;
    }
    if (isSubmitting || oauthLoading) {
      return;
    }

    clearAuthErrors();
    setOauthLoading(provider);

    const useRedirect = prefersOAuthRedirect();

    try {
      const result = await signInWithOAuth(provider, { useRedirect });

      if (result.ok && 'redirecting' in result) {
        return;
      }

      if (!result.ok) {
        if (result.errorCode !== 'auth/popup-closed-by-user') {
          setOauthError(result.errorMessage);
        }
        return;
      }

      await handleOAuthLoginResult(result);
    } catch (error) {
      logger.error('OAuth login error:', error);
      setOauthError(getAuthErrorFromUnknown(error) || 'אירעה שגיאה בהתחברות. נסה שוב.');
    } finally {
      setOauthLoading(null);
      clearOAuthSessionFlags();
    }
  };

  const handleSignupClick = useCallback(() => {
    beginOnboardingSignupFromLogin();
    router.push('/onboarding');
  }, [router]);

  return (
    <LoginScreen
      email={formData.email}
      password={formData.password}
      errors={errors}
      passwordError={passwordError}
      oauthError={oauthError}
      showResumeSignupBanner={showResumeSignupBanner}
      showPasswordProviderBanner={showPasswordProviderBanner}
      isSubmitting={isSubmitting}
      oauthLoading={oauthLoading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onOAuthGoogle={() => handleOAuth('google')}
      onOAuthApple={() => handleOAuth('apple')}
      onSignupClick={handleSignupClick}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<FunnelRouteLoading surface="dark" />}>
      <LoginPageContent />
    </Suspense>
  );
}
