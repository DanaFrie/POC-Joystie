'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback } from 'react';

export default function Home() {
  const router = useRouter();

  // Optimized handlers with useCallback
  const handleSignup = useCallback(() => {
    router.push('/signup');
  }, [router]);

  const handleLogin = useCallback(() => {
    // Simple redirect - let the login page handle auth check
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent pb-12 sm:pb-24">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Logo and Action Buttons - Always Inline, aligned with content boxes */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-8 pt-2 sm:pt-4 w-full overflow-hidden">
          <div className="flex-shrink-0 min-w-0">
            <Image
              src="/logo-joystie.png"
              alt="Joystie Logo"
              width={200}
              height={67}
              className="h-12 w-auto sm:h-16 md:h-20 max-w-[140px] sm:max-w-[180px] md:max-w-[220px]"
              style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)', height: 'auto' }}
              priority
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={handleSignup}
              className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-[10px] sm:rounded-[14px] md:rounded-[18px] text-sm sm:text-sm md:text-base font-varela font-semibold bg-[#273143] text-white hover:bg-opacity-90 transition-all shadow-card whitespace-nowrap"
            >
              הירשם
            </button>
            <button
              onClick={handleLogin}
              className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-[10px] sm:rounded-[14px] md:rounded-[18px] text-sm sm:text-sm md:text-base font-varela font-semibold bg-white text-[#273143] border-2 border-[#273143] hover:bg-[#273143] hover:text-white transition-all shadow-card whitespace-nowrap"
            >
              התחבר
            </button>
          </div>
        </div>

        {/* Main Headline */}
        <div className="bg-[#273143] rounded-[12px] sm:rounded-[18px] shadow-card p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <h1 className="font-varela font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#E6F19A] mb-3 sm:mb-4 text-center leading-tight">
            כך תהפכו את המלחמה על זמן המסך לשיתוף פעולה
          </h1>
          <p className="font-varela text-sm sm:text-base text-[#FFFCF8] leading-relaxed text-center max-w-3xl mx-auto">
            ברוכים הבאים למסע משותף לאיזון דיגיטלי. אם אתם כאן, אתם בוודאי מבינים שהמאבק על המסכים הוא לא קרב הוגן. 
            מול המשפחה שלכם עומדים תקציבי עתק וצוותים שלמים שמתמחים בעיצוב התנהגות. אתם לא לבד בהתמודדות הזו.
          </p>
        </div>

        {/* Three Feature Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-[#3a455a] rounded-[12px] sm:rounded-[16px] shadow-card p-4 sm:p-6 border border-white/10">
            <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4 text-center">🌱</div>
            <h3 className="font-varela font-bold text-base sm:text-lg md:text-xl text-[#FFFCF8] mb-1 sm:mb-2 text-center">חינוך פיננסי</h3>
            <p className="font-varela text-xs sm:text-sm text-white/80 text-center">כלים חיוניים לטווח ארוך</p>
          </div>
          <div className="bg-[#3a455a] rounded-[12px] sm:rounded-[16px] shadow-card p-4 sm:p-6 border border-white/10">
            <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4 text-center">💳</div>
            <h3 className="font-varela font-bold text-base sm:text-lg md:text-xl text-[#FFFCF8] mb-1 sm:mb-2 text-center">ארנק דיגיטלי לילד</h3>
            <p className="font-varela text-xs sm:text-sm text-white/80 text-center">הבנק הראשון שלו</p>
          </div>
          <div className="bg-[#3a455a] rounded-[12px] sm:rounded-[16px] shadow-card p-4 sm:p-6 border border-white/10">
            <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4 text-center">⚖️</div>
            <h3 className="font-varela font-bold text-base sm:text-lg md:text-xl text-[#FFFCF8] mb-1 sm:mb-2 text-center">איזון זמן מסך</h3>
            <p className="font-varela text-xs sm:text-sm text-white/80 text-center">בלי הריב היומי!</p>
          </div>
        </div>

        {/* Overview Boxes */}
        <div className="space-y-4 sm:space-y-6">
          {/* Box 1: Introduction */}
          <div className="bg-[#FFFCF8] rounded-[12px] sm:rounded-[18px] shadow-card p-4 sm:p-6">
            <p className="font-varela text-sm sm:text-base text-[#282743] leading-relaxed">
              הפתרון שלנו מציע שפה חדשה ומשותפת. במקום מלחמות, אנחנו מחברים בין שני כלים קיימים – דמי כיס וזמן מסך – 
              והופכים אותם לשיעור מעשי על אחריות, בחירה וניהול זמן. זה פשוט, זה יעיל, וזה בעיקר מחזיר את השקט הביתה.
            </p>
          </div>

          {/* Box 2: How it works */}
          <div className="bg-[#3a455a] rounded-[12px] sm:rounded-[18px] shadow-card p-4 sm:p-6 border border-white/10">
            <h2 className="font-varela font-bold text-xl sm:text-2xl md:text-3xl text-[#E6F19A] mb-4 sm:mb-6 text-center">
              איך זה עובד?
            </h2>
            <div className="space-y-3 sm:space-y-5">
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#BBE9FD] flex items-center justify-center font-varela font-bold text-base sm:text-lg text-[#273143]">
                  1
                </div>
                <div>
                  <h3 className="font-varela font-bold text-base sm:text-lg text-[#FFFCF8] mb-1 sm:mb-2">קובעים חוקים</h3>
                  <p className="font-varela text-sm sm:text-base text-white/80 leading-relaxed">
                    מגדירים יחד "בנק" שעות מסך שבועיות.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#BBE9FD] flex items-center justify-center font-varela font-bold text-base sm:text-lg text-[#273143]">
                  2
                </div>
                <div>
                  <h3 className="font-varela font-bold text-base sm:text-lg text-[#FFFCF8] mb-1 sm:mb-2">מגדירים תגמול</h3>
                  <p className="font-varela text-sm sm:text-base text-white/80 leading-relaxed">
                    קושרים את השעות לדמי כיס קבועים.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#BBE9FD] flex items-center justify-center font-varela font-bold text-base sm:text-lg text-[#273143]">
                  3
                </div>
                <div>
                  <h3 className="font-varela font-bold text-base sm:text-lg text-[#FFFCF8] mb-1 sm:mb-2">התוצאה בידיים שלהם</h3>
                  <p className="font-varela text-sm sm:text-base text-white/80 leading-relaxed">
                    חיסכון בזמן מתגמל בתוספת, חריגה גוררת הפחתה.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Box 3: Call to Action */}
          <div className="bg-[#FFFCF8] rounded-[12px] sm:rounded-[18px] shadow-card p-4 sm:p-6">
            <h2 className="font-varela font-semibold text-xl sm:text-2xl text-[#262135] mb-3 sm:mb-4 text-center">
              מוכנים להתחיל?
            </h2>
            <p className="font-varela text-sm sm:text-base text-[#282743] leading-relaxed mb-3 sm:mb-4 text-center">
              התהליך פשוט ומהיר. הירשמו עכשיו, הגדירו את הפרופיל שלכם, הוסיפו את הילד שלכם, 
              והתחילו להגדיר את האתגר השבועי הראשון.
            </p>
            <p className="font-varela text-sm sm:text-base text-[#282743] leading-relaxed mb-4 sm:mb-6 text-center">
              כל יום הוא הזדמנות חדשה להצליח - גם אם אתמול היה פחות טוב, היום אפשר להתחיל מחדש.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleSignup}
                className="px-6 py-3 sm:px-8 sm:py-4 rounded-[12px] sm:rounded-[18px] text-base sm:text-lg font-varela font-semibold bg-[#273143] text-white hover:bg-opacity-90 transition-all shadow-card"
              >
                הירשם עכשיו
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 text-center">
        <p className="font-varela text-base sm:text-lg text-[#262135]">
          <a 
            href="mailto:info@joystie.com" 
            className="hover:text-[#273143] transition-colors"
          >
            info@joystie.com
          </a>
          {' | '}
          <a 
            href="https://linkedin.com/company/joystie" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#273143] transition-colors"
          >
            Joystie in LinkedIn
          </a>
        </p>
      </div>
    </div>
  );
}