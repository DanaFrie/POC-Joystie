'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createSession, isLoggedIn } from '@/utils/session';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => {
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

    if (!formData.username.trim()) {
      newErrors.username = 'אנא הכנס שם משתמש';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'אנא הכנס סיסמה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    // Get stored parent data
    if (typeof window === 'undefined') {
      setIsSubmitting(false);
      return;
    }

    const storedParentData = localStorage.getItem('parentData');
    if (!storedParentData) {
      setLoginError('לא נמצא חשבון. אנא הירשם תחילה.');
      setIsSubmitting(false);
      return;
    }

    try {
      const parentData = JSON.parse(storedParentData);
      
      // Check if username matches
      if (parentData.username?.toLowerCase() !== formData.username.trim().toLowerCase()) {
        setLoginError('שם משתמש לא נכון');
        setIsSubmitting(false);
        return;
      }

      // Check password (in production, use proper password hashing)
      const passwordHash = btoa(formData.password);
      if (parentData.passwordHash !== passwordHash) {
        setLoginError('סיסמה לא נכונה');
        setIsSubmitting(false);
        return;
      }

      // Create session
      const userId = `user_${Date.now()}`;
      createSession(userId);

      // Redirect to dashboard
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('אירעה שגיאה בהתחברות. נסה שוב.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Piggy Bank and Logo - פינה ימנית עליונה */}
        <div className="absolute right-0 top-0 z-10 flex items-center gap-4">
          <Image
            src="/piggy-bank.png"
            alt="Piggy Bank"
            width={120}
            height={120}
            className="object-contain"
          />
          <Image
            src="/logo-joystie.png"
            alt="Joystie Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
            style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)' }}
          />
        </div>

        {/* Welcome message */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-24">
          <h1 className="font-varela font-semibold text-2xl text-[#262135] text-center">
            התחברות
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          {/* Username */}
          <div className="mb-6">
            <label htmlFor="username" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              שם משתמש <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="הכנס שם משתמש"
              className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                errors.username ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.username && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              סיסמה <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="הכנס סיסמה"
              className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.password}</p>
            )}
          </div>

          {/* Login Error */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-[18px]">
              <p className="font-varela text-sm text-red-600 text-center">{loginError}</p>
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
            {isSubmitting ? 'מתחבר...' : 'התחבר'}
          </button>

          {/* Link to Signup */}
          <div className="mt-4 text-center">
            <p className="font-varela text-sm text-[#282743]">
              אין לך חשבון?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-[#273143] underline font-semibold"
              >
                הירשם
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

