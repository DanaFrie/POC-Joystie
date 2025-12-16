'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isLoggedIn, updateLastActivity } from '@/utils/session';

export default function OnboardingPage() {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [challengeExists, setChallengeExists] = useState(false);
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    // Update activity on page load
    updateLastActivity();
  }, [router]);

  // Challenge existence will be determined from API when needed
  useEffect(() => {
    setChallengeExists(false);
  }, []);

  const reasons = [
    {
      id: 'balance',
      title: 'שהילד שלי יצא לשחק בחוץ'
    },
    {
      id: 'education',
      title: 'חינוך פיננסי דרך ניהול כסף'
    },
    {
      id: 'communication',
      title: 'לשפר את התקשורת במשפחה'
    }
  ];

  const handleContinue = () => {
    if (selectedReason) {
      // שמור את הבחירה ב-sessionStorage כדי להעביר לדף הבא
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('motivationReason', selectedReason);
      }
      router.push('/onboarding/setup');
    }
  };

  // אם יש אתגר מוגדר, הצג הודעה "יצאתם לדרך"
  if (challengeExists) {
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-md mx-auto px-4 py-8 relative">
          {/* Piggy Bank - פינה ימנית עליונה */}
          <div className="absolute right-0 top-0 z-10">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>

          {/* הודעה: יצאתם לדרך */}
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-24">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4 text-center">
              יצאתם לדרך!
            </h1>
            <p className="font-varela text-base text-[#282743] leading-relaxed mb-6 text-center">
              האתגר כבר מוגדר ואתם בדרך למטרה. תוכלו לערוך את פרטי האתגר בכל עת.
            </p>
            <button
              onClick={() => {
                // TODO: פתח עמוד עריכה (כרגע רק כפתור)
                alert('עמוד עריכת האתגר יפותח בהמשך');
              }}
              className="w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all bg-[#273143] text-white hover:bg-opacity-90"
            >
              ערוך אתגר
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Piggy Bank - פינה ימנית עליונה */}
        <div className="absolute right-0 top-0 z-10">
          <Image
            src="/piggy-bank.png"
            alt="Piggy Bank"
            width={120}
            height={120}
            className="object-contain"
            priority
          />
        </div>

        {/* הסבר קצר על התהליך */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-24">
          <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4 text-center">
            אם אתם איתנו, אתם רוצים שינוי. ברוכים הבאים!
          </h1>
          <p className="font-varela text-base text-[#282743] leading-relaxed mb-4">
            אנחנו כאן כדי לעזור לכם ולילד שלכם לנהל יחד את זמן המסך בצורה בריאה ומאוזנת.
          </p>
          <p className="font-varela text-base text-[#282743] leading-relaxed mb-4">
            התהליך פשוט: נגדיר יחד אתגר לשבוע ימים, הילד יקבל דמי כיס שבועיים בהתאם לניהול זמן המסך שלו, אתם תוכלו לעקוב, לעודד אותו בדרך ואנחנו איתכם.
          </p>
          <p className="font-varela text-base text-[#282743] leading-relaxed">
            כל יום הוא הזדמנות חדשה להצליח - גם אם אתמול היה פחות טוב, היום אפשר להתחיל מחדש.
          </p>
        </div>

        {/* למה אתם עושים את זה? */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4 text-center">
            למה אתם עושים את זה?
          </h2>
          <p className="font-varela text-sm text-[#948DA9] mb-4 text-center">
            בחרו את הסיבה העיקרית שלכם:
          </p>
          <div className="space-y-3">
            {reasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                className={`w-full p-4 rounded-[18px] border-2 transition-all text-right ${
                  selectedReason === reason.id
                    ? 'border-[#273143] bg-[#273143] bg-opacity-10'
                    : 'border-gray-200 bg-white hover:border-[#273143] hover:border-opacity-50'
                }`}
              >
                <h3 className="font-varela font-semibold text-base text-[#282743]">
                  {reason.title}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* כפתור המשך */}
        <button
          onClick={handleContinue}
          disabled={!selectedReason}
          className={`w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
            selectedReason
              ? 'bg-[#273143] text-white hover:bg-opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          המשך
        </button>
      </div>
    </div>
  );
}
