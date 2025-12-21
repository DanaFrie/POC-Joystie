'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { sendPasswordReset } from '@/utils/auth';
import { getErrorMessage } from '@/utils/errors';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ForgotPassword');

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!email.trim()) {
      setError('אנא הכנס כתובת אימייל');
      return;
    }

    // Basic email validation
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
    } catch (error) {
      logger.error('Password reset error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage || 'אירעה שגיאה בשליחת אימייל שחזור סיסמא. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            שחזור סיסמא
          </h1>
        </div>

        {/* Form */}
        {success ? (
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-[18px] p-4">
                <p className="font-varela text-sm text-green-700 text-center">
                  נשלח אימייל עם קישור לשחזור הסיסמא. אנא בדוק את תיבת הדואר הנכנס שלך.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold bg-[#273143] text-white hover:bg-opacity-90 transition-all"
              >
                חזור להתחברות
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
            <div className="mb-6">
              <label htmlFor="email" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
                כתובת אימייל <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="הכנס כתובת אימייל"
                className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                  error ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-[18px]">
                <p className="font-varela text-sm text-red-600 text-center">{error}</p>
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
              {isSubmitting ? 'שולח...' : 'שלח קישור שחזור סיסמא'}
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

