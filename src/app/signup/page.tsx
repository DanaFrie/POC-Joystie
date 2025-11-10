'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    gender: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    kidsAges: [] as string[],
    termsAccepted: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isRequestingNotification, setIsRequestingNotification] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();

  const genderOptions = [
    { value: 'male', label: 'גבר' },
    { value: 'female', label: 'אישה' },
    { value: 'other', label: 'אחר' }
  ];

  // Username pool for random generation - funny usernames with special characters
  const usernamePool = [
    'אמא@של@כל@הדברים', 'אבא#המנצח', 'הורה&על', 'מלך$הבית', 'מלכת#המטבח',
    'אבא_המגניב', 'אמא@הסופר', 'הורה#הטוב', 'מנהל$הבית', 'מנהלת&החיים',
    'אבא#הגיבור', 'אמא@הסופרוומן', 'הורה$המושלם', 'מלך&הסלון', 'מלכת#הסדר',
    'אבא_הכי@טוב', 'אמא#הכי$טובה', 'הורה&המוביל', 'מנהל$הכל', 'מנהלת@הכל',
    'אבא#המקצועי', 'אמא_המקצועית', 'הורה$המוביל', 'מלך&הארגון', 'מלכת#הארגון',
    'אבא@המנצח', 'אמא#המנצחת', 'הורה$המוביל', 'מנהל&הזמן', 'מנהלת@הזמן',
    'אבא_המגניב', 'אמא#המגניבה', 'הורה$המוביל', 'מלך&הבית', 'מלכת@הבית',
    'אבא#הטוב', 'אמא_הטובה', 'הורה$המוביל', 'מנהל&החיים', 'מנהלת#החיים',
    'אבא@הסופר', 'אמא#הסופר', 'הורה$המוביל', 'מלך&הסדר', 'מלכת@הסדר',
    'אבא#הגיבור', 'אמא_הגיבורה', 'הורה$המוביל', 'מנהל&הכל', 'מנהלת@הכל',
    'אמא@של@הכל', 'אבא#הכי@טוב', 'הורה$המוביל', 'מלך&הכל', 'מלכת#הכל',
    'אבא_הסופר', 'אמא@הגיבורה', 'הורה#המוביל', 'מנהל$הכל', 'מנהלת&הכל'
  ];

  const generateRandomUsername = () => {
    const randomBase = usernamePool[Math.floor(Math.random() * usernamePool.length)];
    setFormData(prev => ({ ...prev, username: randomBase }));
    
    // Clear username error if exists
    if (errors.username) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.username;
        return newErrors;
      });
    }
  };

  // Load form data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = localStorage.getItem('signupFormData');
      if (savedFormData) {
        try {
          const parsed = JSON.parse(savedFormData);
          // Don't restore passwords for security
          setFormData(prev => ({
            ...prev,
            username: parsed.username || '',
            gender: parsed.gender || '',
            firstName: parsed.firstName || '',
            lastName: parsed.lastName || '',
            kidsAges: parsed.kidsAges && parsed.kidsAges.length > 0 ? parsed.kidsAges : [''],
            termsAccepted: parsed.termsAccepted || false
          }));
        } catch (e) {
          console.error('Error loading form data:', e);
          // Initialize with one empty age input if error
          setFormData(prev => ({ 
            ...prev, 
            kidsAges: prev.kidsAges.length === 0 ? [''] : prev.kidsAges 
          }));
        }
      } else {
        // Initialize with one empty age input if no saved data
        setFormData(prev => ({ 
          ...prev, 
          kidsAges: prev.kidsAges.length === 0 ? [''] : prev.kidsAges 
        }));
      }
      // Mark initial load as complete
      setIsInitialLoad(false);
    }
  }, []);

  // Save form data to localStorage whenever it changes (except passwords)
  // Don't save during initial load to avoid overwriting with empty data
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialLoad) {
      const dataToSave = {
        username: formData.username,
        gender: formData.gender,
        firstName: formData.firstName,
        lastName: formData.lastName,
        kidsAges: formData.kidsAges,
        termsAccepted: formData.termsAccepted
        // Don't save passwords for security
      };
      localStorage.setItem('signupFormData', JSON.stringify(dataToSave));
    }
  }, [formData.username, formData.gender, formData.firstName, formData.lastName, formData.kidsAges, formData.termsAccepted, isInitialLoad]);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'אנא הכנס שם משתמש';
    }
    if (!formData.gender) {
      newErrors.gender = 'אנא בחר מין';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'אנא הכנס שם פרטי';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'אנא הכנס שם משפחה';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'אנא הכנס סיסמה';
    } else if (formData.password.length < 6) {
      newErrors.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'אנא אשר את הסיסמה';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'הסיסמאות לא תואמות';
    }
    if (formData.kidsAges.length === 0 || formData.kidsAges.every(age => !age.trim())) {
      newErrors.kidsAges = 'אנא הכנס את גילאי הילדים';
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'אנא אשר את תנאי השימוש';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleGenderSelect = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
    if (errors.gender) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.gender;
        return newErrors;
      });
    }
  };

  const handleKidAgeChange = (index: number, value: string) => {
    setFormData(prev => {
      const newAges = [...prev.kidsAges];
      newAges[index] = value;
      
      // If this is the last input and it has a value, add a new empty input
      if (index === newAges.length - 1 && value.trim() !== '') {
        newAges.push('');
      }
      
      return {
        ...prev,
        kidsAges: newAges
      };
    });

    // Clear error when user starts typing
    if (errors.kidsAges) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.kidsAges;
        return newErrors;
      });
    }
  };

  const handleRemoveKidAge = (index: number) => {
    setFormData(prev => {
      const newAges = prev.kidsAges.filter((_, i) => i !== index);
      return {
        ...prev,
        kidsAges: newAges.length > 0 ? newAges : ['']
      };
    });
  };

  const handleRequestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('הדפדפן שלך לא תומך בהתראות');
      return;
    }

    setIsRequestingNotification(true);

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        // Save notification preference
        localStorage.setItem('notificationsEnabled', 'true');
        
        // Show a test notification
        new Notification('Joystie', {
          body: 'תודה! תקבלו התראות על עדכונים חשובים',
          icon: '/logo-joystie.png',
          lang: 'he'
        });
      } else if (permission === 'denied') {
        localStorage.setItem('notificationsEnabled', 'false');
        alert('התראות נדחו. תוכלו להפעיל אותן מאוחר יותר בהגדרות הדפדפן.');
      } else {
        localStorage.setItem('notificationsEnabled', 'false');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('אירעה שגיאה בבקשת הרשאות התראות');
    } finally {
      setIsRequestingNotification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Hash password (in production, use proper hashing like bcrypt)
    // For now, we'll store a simple hash (in production, this should be done server-side)
    const passwordHash = btoa(formData.password); // Simple encoding - NOT secure for production!
    
    // Filter out empty ages
    const validAges = formData.kidsAges.filter(age => age.trim() !== '');
    
    // Save parent data to localStorage (in a real app, this would go to a backend)
    const parentData = {
      username: formData.username,
      gender: formData.gender,
      firstName: formData.firstName,
      lastName: formData.lastName,
      passwordHash: passwordHash, // In production, never store passwords in localStorage!
      kidsAges: validAges,
      termsAccepted: formData.termsAccepted,
      notificationsEnabled: notificationPermission === 'granted',
      signupDate: new Date().toISOString()
    };

    localStorage.setItem('parentData', JSON.stringify(parentData));
    
    // Create session
    const sessionData = {
      userId: `user_${Date.now()}`,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    localStorage.setItem('session', JSON.stringify(sessionData));

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Clear saved form data after successful submission
      localStorage.removeItem('signupFormData');
      // Redirect to onboarding
      router.push('/onboarding');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Welcome message */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-8">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo-joystie.png"
              alt="Joystie Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)' }}
            />
          </div>
          <p className="font-varela text-base text-[#282743] leading-relaxed text-center mb-3">
            הרשמה קלילה ומהירה - רק הפרטים החשובים
          </p>
          <p className="font-varela text-sm text-[#948DA9] leading-relaxed text-center">
            נגיע בדיוק למה שאתם צריכים, בלי עיכובים מיותרים
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          {/* Username */}
          <div className="mb-6">
            <label htmlFor="username" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              שם משתמש <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                readOnly
                placeholder="לחץ על 'להגריל' כדי ליצור שם משתמש"
                className={`flex-1 p-4 border-2 rounded-[18px] bg-gray-50 cursor-not-allowed font-varela text-base text-[#282743] ${
                  errors.username ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={generateRandomUsername}
                className="px-4 sm:px-6 py-4 bg-[#E6F19A] hover:bg-[#E6F19A] hover:bg-opacity-80 border-2 border-[#E6F19A] rounded-[18px] font-varela font-semibold text-base text-[#262135] transition-all whitespace-nowrap"
              >
                להגריל
              </button>
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.username}</p>
            )}
          </div>

          {/* Gender - Inline */}
          <div className="mb-6">
            <label className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              מין <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleGenderSelect(option.value)}
                  className={`flex-1 p-4 rounded-[18px] border-2 transition-all text-center ${
                    formData.gender === option.value
                      ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                      : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                  }`}
                >
                  <span className="font-varela font-semibold text-base text-[#282743]">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.gender && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.gender}</p>
            )}
          </div>

          {/* First Name */}
          <div className="mb-6">
            <label htmlFor="firstName" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              שם פרטי <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="הכנס שם פרטי"
              className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                errors.firstName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="mb-6">
            <label htmlFor="lastName" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              שם משפחה <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="הכנס שם משפחה"
              className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                errors.lastName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.lastName}</p>
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
              placeholder="הכנס סיסמה (לפחות 6 תווים)"
              className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              אשר סיסמה <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="הכנס שוב את הסיסמה"
              className={`w-full p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Kids Ages */}
          <div className="mb-6">
            <label className="block font-varela font-semibold text-lg text-[#262135] mb-3">
              בני כמה הילדים שלך? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {(formData.kidsAges.length === 0 ? [''] : formData.kidsAges).map((age, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => handleKidAgeChange(index, e.target.value)}
                    placeholder={`גיל ילד ${index + 1}`}
                    min="0"
                    max="18"
                    className={`flex-1 p-4 border-2 rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#273143] focus:border-[#273143] font-varela text-base text-[#282743] ${
                      errors.kidsAges ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formData.kidsAges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveKidAge(index)}
                      className="px-4 py-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-[18px] font-varela font-semibold text-sm text-red-600 transition-all"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.kidsAges && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.kidsAges}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-[#273143] focus:ring-2 focus:ring-[#273143] cursor-pointer"
              />
              <span className="font-varela text-base text-[#282743] flex-1">
                אני מסכים/ה ל
                <button
                  type="button"
                  onClick={() => {
                    router.push('/signup/terms');
                  }}
                  className="text-[#273143] underline font-semibold mr-1"
                >
                  תנאי השימוש
                </button>
                <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="mt-2 text-sm text-red-500 font-varela">{errors.termsAccepted}</p>
            )}
          </div>

          {/* Enable Notifications */}
          <div className="mb-6">
            <div className="bg-[#E6F19A] bg-opacity-30 rounded-[18px] border-2 border-[#E6F19A] p-4">
              <h3 className="font-varela font-semibold text-base text-[#262135] mb-2">
                🔔 הפעלת התראות
              </h3>
              <p className="font-varela text-sm text-[#282743] mb-4">
                קבלו התראות על עדכונים חשובים: העלאת סטטוס יומי, אישורים נדרשים, ותזכורות.
              </p>
              {notificationPermission === 'granted' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-lg">✓</span>
                  <span className="font-varela font-semibold text-sm">התראות מופעלות</span>
                </div>
              ) : notificationPermission === 'denied' ? (
                <div className="flex items-center gap-2 text-orange-600">
                  <span className="text-lg">⚠</span>
                  <span className="font-varela text-sm">
                    התראות נדחו. תוכלו להפעיל אותן בהגדרות הדפדפן.
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestNotification}
                  disabled={isRequestingNotification}
                  className={`w-full py-3 px-4 rounded-[12px] font-varela font-semibold text-sm transition-all ${
                    isRequestingNotification
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#273143] text-white hover:bg-opacity-90'
                  }`}
                >
                  {isRequestingNotification ? 'מבקש הרשאה...' : 'הפעל התראות'}
                </button>
              )}
            </div>
          </div>

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
            {isSubmitting ? 'שומר...' : 'המשך'}
          </button>
          
          {/* Link to Login */}
          <div className="mt-4 text-center">
            <p className="font-varela text-sm text-[#282743]">
              כבר יש לך חשבון?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-[#273143] underline font-semibold"
              >
                התחבר
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

