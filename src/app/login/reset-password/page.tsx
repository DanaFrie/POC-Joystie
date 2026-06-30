'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordScreen } from '@/components/login/ResetPasswordScreen';
import { confirmPasswordReset } from '@/utils/auth';
import { getErrorMessage } from '@/utils/errors';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ResetPassword');

function ResetPasswordPageContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const validateActionCode = async () => {
      const oobCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      if (!oobCode || mode !== 'resetPassword') {
        setValidationError('קישור לא תקין או פג תוקף. אנא בקשו קישור חדש.');
        setIsValidating(false);
        return;
      }

      try {
        const { verifyPasswordResetCode } = await import('firebase/auth');
        const { getAuthInstance } = await import('@/lib/firebase');
        const auth = await getAuthInstance();
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidating(false);
      } catch (validateError) {
        logger.error('Action code validation error:', validateError);
        setValidationError('קישור לא תקין או פג תוקף. אנא בקשו קישור חדש.');
        setIsValidating(false);
      }
    };

    void validateActionCode();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!password.trim()) {
      setError('אנא הכנס סיסמה');
      return;
    }
    if (password.length < 6) {
      setError('סיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (password !== confirmPassword) {
      setError('הסיסמאות לא תואמות');
      return;
    }

    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError('קישור לא תקין');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await confirmPasswordReset(oobCode, password);
      setSuccess(true);
      logger.log('Password reset successfully');
      window.setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (submitError) {
      logger.error('Password reset error:', submitError);
      setError(getErrorMessage(submitError) || 'אירעה שגיאה באיפוס הסיסמה. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResetPasswordScreen
      password={password}
      confirmPassword={confirmPassword}
      error={error}
      success={success}
      isSubmitting={isSubmitting}
      validationError={validationError}
      isValidating={isValidating}
      onPasswordChange={(e) => {
        setPassword(e.target.value);
        setError('');
      }}
      onConfirmPasswordChange={(e) => {
        setConfirmPassword(e.target.value);
        setError('');
      }}
      onSubmit={handleSubmit}
    />
  );
}

export default function LoginResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
