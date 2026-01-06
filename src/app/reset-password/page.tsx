'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { confirmPasswordReset } from '@/utils/auth';
import { getErrorMessage } from '@/utils/errors';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ResetPassword');

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Validate action code on mount
  useEffect(() => {
    const validateActionCode = async () => {
      const oobCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      if (!oobCode || mode !== 'resetPassword') {
        setValidationError('קישור לא תקין או פג תוקף. אנא בקש קישור חדש.');
        setIsValidating(false);
        return;
      }

      try {
        const { verifyPasswordResetCode } = await import('firebase/auth');
        const { getAuthInstance } = await import('@/lib/firebase');
        const auth = await getAuthInstance();
        await verifyPasswordResetCode(auth, oobCode);
        setIsValidating(false);
      } catch (error) {
        logger.error('Action code validation error:', error);
        setValidationError('קישור לא תקין או פג תוקף. אנא בקש קישור חדש.');
        setIsValidating(false);
      }
    };

    validateActionCode();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validation
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
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      logger.error('Password reset error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage || 'אירעה שגיאה באיפוס הסיסמה. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6">
            <p className="font-varela text-base text-[#262135] text-center">
              בודק קישור...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-md mx-auto px-4 py-8 relative">
          {/* Logo */}
          <div className="flex justify-center items-center mb-8 pt-4">
            <Image
              src="/logo-joystie.png"
              alt="Joystie Logo"
              width={200}
              height={67}
              className="h-12 w-auto sm:h-16 md:h-20"
              style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)', height: 'auto' }}
              priority
            />
          </div>

          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
            <div className="bg-[#dc3545] bg-opacity-10 border-2 border-[#dc3545] rounded-[18px] p-4 mb-4">
              <p className="font-varela font-semibold text-sm text-[#dc3545] text-center">
                {validationError}
              </p>
            </div>
            <button
              onClick={() => router.push('/forgot-password')}
              className="w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold bg-[#273143] text-white hover:bg-opacity-90 transition-all"
            >
              בקש קישור חדש
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Logo */}
        <div className="flex justify-center items-center mb-8 pt-4">
          <Image
            src="/logo-joystie.png"
            alt="Joystie Logo"
            width={200}
            height={67}
            className="h-12 w-auto sm:h-16 md:h-20"
            style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)', height: 'auto' }}
            priority
          />
        </div>

        {/* Title message */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          <h1 className="font-varela font-semibold text-2xl text-[#262135] text-center">
            איפוס סיסמה
          </h1>
        </div>

        {/* Form */}
        {success ? (
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
            <div className="space-y-4">
              <div className="bg-[#E6F19A] border-2 border-[#E6F19A] rounded-[18px] p-4">
                <p className="font-varela font-semibold text-sm text-[#273143] text-center">
                  הסיסמה עודכנה בהצלחה! מעביר לדף ההתחברות...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
            <div className="mb-6">
              <label htmlFor="password" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
                סיסמה חדשה <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="הכנס סיסמה חדשה (לפחות 6 תווים)"
                className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                  error ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
                אשר סיסמה <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="הכנס שוב את הסיסמה"
                className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                  error ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-[#dc3545] bg-opacity-10 border-2 border-[#dc3545] rounded-[18px]">
                <p className="font-varela font-semibold text-sm text-[#dc3545] text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#273143] text-white hover:bg-opacity-90'
              }`}
            >
              {isSubmitting ? 'מאפס...' : 'אפס סיסמה'}
            </button>

            {/* Back to login */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-[#273143] underline font-varela text-sm font-semibold"
              >
                חזור להתחברות
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

