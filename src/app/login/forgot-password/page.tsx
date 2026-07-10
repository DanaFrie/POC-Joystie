'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ForgotPasswordScreen } from '@/components/login/ForgotPasswordScreen';
import { getLoginPath } from '@/lib/auth/postLoginNavigation';
import { sendPasswordReset } from '@/utils/auth';
import { getErrorMessage } from '@/utils/errors';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ForgotPassword');

function LoginForgotPasswordPageContent() {
  const searchParams = useSearchParams();
  const loginReturnHref = getLoginPath({
    email: searchParams?.get('email') ?? undefined,
    existing: searchParams?.get('existing') === '1',
  });

  const [email, setEmail] = useState(() => searchParams?.get('email') ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim()) {
      setError('אנא הכנס כתובת אימייל');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('כתובת אימייל לא תקינה');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await sendPasswordReset(email.trim().toLowerCase());
      setSuccess(true);
      logger.log('Password reset email sent successfully');
    } catch (submitError) {
      logger.error('Password reset error:', submitError);
      setError(
        getErrorMessage(submitError) ||
          'אירעה שגיאה בשליחת אימייל שחזור סיסמה. נסה שוב.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ForgotPasswordScreen
      email={email}
      error={error}
      success={success}
      isSubmitting={isSubmitting}
      loginReturnHref={loginReturnHref}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}

export default function LoginForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <LoginForgotPasswordPageContent />
    </Suspense>
  );
}