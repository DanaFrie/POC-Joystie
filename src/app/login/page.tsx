'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoginScreen } from '@/components/login/LoginScreen';
import { createSession, isLoggedIn, clearSession } from '@/utils/session';
import { signIn, getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
import { getUser } from '@/lib/api/users';
import { getLatestChallenge } from '@/lib/api/challenges';
import { getErrorMessage } from '@/utils/errors';
import { createContextLogger } from '@/utils/logger';
import {
  prefersOAuthRedirect,
  primeOAuthRedirectCapture,
  resolveOAuthSignInAfterRedirect,
  signInWithApple,
  signInWithGoogle,
  isRestrictedOAuthEnvironment,
  getRestrictedOAuthMessage,
} from '@/utils/auth-oauth';

const logger = createContextLogger('Login');

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  const finishLogin = useCallback(
    async (uid: string) => {
      createSession(uid);
      const challenge = await getLatestChallenge(uid);
      router.push(challenge ? '/dashboard' : '/onboarding');
    },
    [router]
  );

  const checkUserAndRedirect = useCallback(async () => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        router.push('/login');
        return;
      }

      const challenge = await getLatestChallenge(userId);
      if (challenge) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      logger.error('Error checking user:', error);
      router.push('/onboarding');
    }
  }, [router]);

  const completeOAuthLogin = useCallback(
    async (uid: string) => {
      const userData = await getUser(uid);
      if (!userData) {
        setLoginError('נתוני המשתמש לא נמצאו. אנא הירשם מחדש.');
        return;
      }
      await finishLogin(uid);
    },
    [finishLogin]
  );

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

    const resolveOAuthRedirect = async () => {
      const result = await resolveOAuthSignInAfterRedirect();
      if (!result?.ok) {
        return;
      }

      setOauthLoading(null);
      setIsSubmitting(true);
      setLoginError('');

      try {
        await completeOAuthLogin(result.user.uid);
      } catch (error) {
        logger.error('OAuth redirect login error:', error);
        setLoginError(getErrorMessage(error) || 'אירעה שגיאה בהתחברות. נסה שוב.');
      } finally {
        setIsSubmitting(false);
      }
    };

    void resolveOAuthRedirect();
  }, [completeOAuthLogin]);

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

    if (loginError) {
      setLoginError('');
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
    setLoginError('');

    try {
      const email = formData.email.trim().toLowerCase();
      const firebaseUser = await signIn(email, formData.password);
      await completeOAuthLogin(firebaseUser.uid);
    } catch (error) {
      logger.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      setLoginError(errorMessage || 'אירעה שגיאה בהתחברות. נסה שוב.');
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (provider === 'google' && isRestrictedOAuthEnvironment()) {
      setLoginError(getRestrictedOAuthMessage());
      return;
    }
    if (isSubmitting || oauthLoading) {
      return;
    }

    setLoginError('');
    setOauthLoading(provider);

    const useRedirect = prefersOAuthRedirect();

    try {
      const result =
        provider === 'google'
          ? await signInWithGoogle({ useRedirect })
          : await signInWithApple({ useRedirect });

      if (result.ok && 'redirecting' in result) {
        return;
      }

      if (!result.ok) {
        if (result.errorCode !== 'auth/popup-closed-by-user') {
          setLoginError(result.errorMessage);
        }
        return;
      }

      await completeOAuthLogin(result.user.uid);
    } catch (error) {
      logger.error('OAuth login error:', error);
      setLoginError(getErrorMessage(error) || 'אירעה שגיאה בהתחברות. נסה שוב.');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <LoginScreen
      email={formData.email}
      password={formData.password}
      errors={errors}
      loginError={loginError}
      isSubmitting={isSubmitting}
      oauthLoading={oauthLoading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onOAuthGoogle={() => handleOAuth('google')}
      onOAuthApple={() => handleOAuth('apple')}
    />
  );
}
