'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OnboardingCompleteContent() {
  const searchParams = useSearchParams();

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        {/* Consultation Booking Section */}
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6">
          <h1 className="font-varela font-semibold text-2xl md:text-3xl text-[#262135] mb-4 text-center">
            כדי שתצליחו! רגע לפני שאתם מתחילים!
          </h1>
          
          <p className="font-varela text-base text-[#282743] leading-relaxed mb-6 text-center">
            אנחנו מזמינים אתכם לשיחה קצרה עם יועץ הקשב שלנו
          </p>

          {/* Google Calendar iframe */}
          <div className="w-full rounded-[12px] overflow-hidden border-2 border-gray-200" style={{ minHeight: '600px' }}>
            <iframe
              src="https://calendar.app.google/uZAZZk61eKmZtvmu8"
              style={{ width: '100%', height: '600px', border: 'none' }}
              title="תאום פגישה עם יועץ קשב"
              allow="calendar"
            />
          </div>
        </div>

        {/* Go to Dashboard button */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('challengeData');
            }
            window.location.href = '/dashboard';
          }}
          className="w-full py-4 px-6 rounded-[18px] bg-[#273143] text-white text-lg font-varela font-semibold hover:bg-opacity-90 transition-all"
        >
          מעבר ללוח בקרה
        </button>
      </div>
    </div>
  );
}

export default function OnboardingCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
      <OnboardingCompleteContent />
    </Suspense>
  );
}

