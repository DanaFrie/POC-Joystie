'use client';

import { useState } from 'react';
import Image from 'next/image';

type ChildWaitRedemptionContentProps = {
  /** The single child URL (same for setup and redemption) */
  childUrl: string;
  /** Redemption date (day 7) in locale string */
  redemptionDate?: string;
  /** Days until redemption day */
  daysRemaining?: number;
  /** Shown after setup: "you're ready" style. If false, "come back on redemption day" style. */
  isAfterSetup?: boolean;
  childName?: string;
  childGender?: 'boy' | 'girl';
};

export function ChildWaitRedemptionContent({
  childUrl,
  redemptionDate,
  daysRemaining,
  isAfterSetup = false,
  childName,
  childGender = 'boy'
}: ChildWaitRedemptionContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(childUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const he = childGender === 'boy' ? 'אתה' : 'את';
  const ready = childGender === 'boy' ? 'מוכן' : 'מוכנה';
  const save = childGender === 'boy' ? 'שמור' : 'שמרי';
  const open = childGender === 'boy' ? 'תפתח' : 'תפתחי';
  const get = childGender === 'boy' ? 'תקבל' : 'תקבלי';

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        <div className="absolute right-0 top-0 z-0 pointer-events-none">
          <Image
            src="/piggy-bank.png"
            alt="Piggy Bank"
            width={120}
            height={120}
            className="object-contain w-28 h-28 sm:w-28 sm:h-28 md:w-34 md:h-34 max-w-[112px] sm:max-w-[112px] md:max-w-[136px]"
          />
        </div>

        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-20">
          <div className="text-center mb-6">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-2">
              {isAfterSetup
                ? `${childName || (childGender === 'boy' ? 'גיבור' : 'גיבורה')}, עכשיו ${he} ${ready} להתחיל!`
                : 'כל הכבוד! ההגדרה הושלמה.'}
            </h1>
          </div>

          <div className="rounded-[18px] p-6 mb-6 space-y-4">
            <h2 className="font-varela font-semibold text-lg text-[#262135] text-center">
              {save} את הכתובת הזו במקום בטוח!
            </h2>
            <p className="font-varela text-sm text-[#282743] text-center leading-relaxed">
              ביום הפדיון (יום 7) {open} את הכתובת הזו – אותה כתובת – ו{get} את מסך הפדיון: העלאת צילום מסך
              של זמן המסך ובחירה איך לקחת את הכסף.
            </p>
            {redemptionDate && (
              <p className="font-varela text-sm text-[#262135] text-center font-medium">
                תאריך הפדיון: {redemptionDate}
                {typeof daysRemaining === 'number' && daysRemaining > 0 && (
                  <span className="block text-[#948DA9] font-normal mt-1">
                    נותרו {daysRemaining} ימים
                  </span>
                )}
              </p>
            )}

            <div className="bg-white rounded-[12px] p-4 mb-4">
              <p className="font-varela text-xs text-[#948DA9] mb-2 text-center">הכתובת שלך:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={childUrl}
                  readOnly
                  className="flex-1 p-2 border-2 border-gray-200 rounded-[8px] font-varela text-xs text-[#282743] bg-gray-50"
                />
                <button
                  onClick={handleCopyUrl}
                  className={`px-4 py-2 rounded-[8px] font-varela font-semibold text-xs transition-all ${
                    copied ? 'bg-[#E6F19A] text-[#273143]' : 'bg-[#273143] text-white hover:bg-opacity-90'
                  }`}
                >
                  {copied ? 'הועתק! ✓' : 'העתק'}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[12px] p-4">
              <p className="font-varela text-xs text-[#262135] text-center leading-relaxed">
                <strong>טיפ:</strong> {save} את הכתובת בקיצור דרך או שלח אותה לעצמך בהודעה כדי ש{childGender === 'boy' ? 'תוכל' : 'תוכלי'} לגשת אליה ביום הפדיון בקלות!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
