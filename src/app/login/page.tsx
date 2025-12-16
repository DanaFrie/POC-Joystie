'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createSession, isLoggedIn } from '@/utils/session';
import { signIn, getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';
import { getUser, getUserByUsername } from '@/lib/api/users';
import { getActiveChallenge } from '@/lib/api/challenges';
import { getErrorMessage } from '@/utils/errors';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const router = useRouter();

  // Check if already logged in - wait for Firebase Auth to be ready
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Check localStorage session first (quick check)
      if (!isLoggedIn()) {
        return; // Not logged in, stay on login page
      }
      
      // Wait a bit for Firebase Auth to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check Firebase Auth
      try {
        const { isAuthenticated } = await import('@/utils/auth');
        const authenticated = await isAuthenticated();
        if (authenticated) {
          // User is authenticated with Firebase Auth, check redirect
          await checkUserAndRedirect();
        } else {
          // Has localStorage session but not Firebase Auth - clear session and stay on login
          console.warn('[Login] localStorage session exists but Firebase Auth not authenticated');
          // Don't redirect - let user log in again
        }
      } catch (error) {
        console.error('[Login] Error checking auth:', error);
        // On error, stay on login page
      }
    };
    
    checkAuthAndRedirect();
  }, [router]);

  // Check user and redirect to appropriate page
  const checkUserAndRedirect = async () => {
    try {
      const userId = await getCurrentUserIdAsync();
      if (!userId) {
        router.push('/login');
        return;
      }

      // Check if user has an active challenge
      const challenge = await getActiveChallenge(userId);
      
      if (challenge) {
        // User has active challenge, go to dashboard
        router.push('/dashboard');
      } else {
        // No active challenge, go to onboarding/challenge setup
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/onboarding');
    }
  };

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

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'אנא הכנס שם משתמש או אימייל';
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

    try {
      const usernameOrEmail = formData.usernameOrEmail.trim().toLowerCase();
      let email: string;

      // Check if input is email or username
      const isEmail = usernameOrEmail.includes('@');
      
      if (isEmail) {
        // User entered email, use it directly
        email = usernameOrEmail;
      } else {
        // User entered username, find user by username and get their email
        const user = await getUserByUsername(usernameOrEmail);
        if (!user) {
          setLoginError('שם משתמש או אימייל לא נמצא');
          setIsSubmitting(false);
          return;
        }
        email = user.email;
      }

      // Sign in with Firebase Auth using email and password
      const firebaseUser = await signIn(email, formData.password);

      // Get user data from Firestore
      const userData = await getUser(firebaseUser.uid);
      if (!userData) {
        setLoginError('נתוני המשתמש לא נמצאו. אנא הירשם מחדש.');
        setIsSubmitting(false);
        return;
      }

      // Create session with Firebase Auth UID
      createSession(firebaseUser.uid);

      // Check if user has an active challenge and redirect accordingly
      const challenge = await getActiveChallenge(firebaseUser.uid);
      
      setIsSubmitting(false);
      
      if (challenge) {
        // User has active challenge, go to dashboard
        router.push('/dashboard');
      } else {
        // No active challenge, go to onboarding/challenge setup
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      setLoginError(errorMessage || 'אירעה שגיאה בהתחברות. נסה שוב.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Logo - מרכז עליון */}
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

        {/* Welcome message */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          <h1 className="font-varela font-semibold text-2xl text-[#262135] text-center">
            התחברות
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          {/* Username or Email */}
          <div className="mb-6">
            <label htmlFor="usernameOrEmail" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              שם משתמש או אימייל <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="הכנס שם משתמש או אימייל"
              className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                errors.usernameOrEmail ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.usernameOrEmail && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.usernameOrEmail}</p>
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

