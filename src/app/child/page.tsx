'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { validateChildUrl } from '@/utils/url-validation';
import type { ValidateChildUrlResult } from '@/utils/url-validation';
import { generateChildUrl } from '@/utils/url-encoding';
import { ChildWaitRedemptionContent } from '@/components/child/ChildWaitRedemptionContent';
import { ChildSetupContent } from '@/components/child/ChildSetupContent';
import { ChildRedemptionContent } from '@/components/child/ChildRedemptionContent';

function ChildPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [result, setResult] = useState<ValidateChildUrlResult | null>(null);

  useEffect(() => {
    if (!token) {
      setResult({ mode: 'error', isValid: false, error: 'כתובת לא תקינה - חסר טוקן' });
      return;
    }
    let cancelled = false;
    validateChildUrl(token).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!result) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <p className="font-heebo text-base text-[#282743]">בודק כתובת...</p>
          </div>
        </div>
      </div>
    );
  }

  if (result.mode === 'error' || result.mode === 'challenge_inactive') {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <h1 className="font-heebo font-semibold text-2xl text-[#262135] mb-4">
              {result.mode === 'challenge_inactive' ? 'האתגר הושלם' : 'כתובת לא תקינה'}
            </h1>
            <p className="font-heebo text-base text-[#282743] mb-4">
              {result.error || 'הכתובת ששותפה איתך לא תקינה או שהפדיון הושלם כבר.'}
            </p>
            <p className="font-heebo text-sm text-[#948DA9]">בדוק עם ההורה שלך לקבלת כתובת חדשה.</p>
          </div>
        </div>
      </div>
    );
  }

  if (result.mode === 'completed') {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <Image src="/brand/icon-joystie.png" alt="" width={64} height={64} className="mx-auto mb-4" />
            <h1 className="font-heebo font-semibold text-2xl text-[#262135] mb-4">
              הפדיון בוצע בהצלחה!
            </h1>
            <p className="font-heebo text-base text-[#282743] mb-4">
              לשבוע הבא, ההורה ישלח לך כתובת חדשה.
            </p>
            <p className="font-heebo text-sm text-[#948DA9]">הכתובת הזו לא פעילה יותר</p>
          </div>
        </div>
      </div>
    );
  }

  if (result.mode === 'wait_redemption') {
    const childUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/child?token=${token}`
        : generateChildUrl(result.parentId!, result.childId || undefined, result.challengeId);
    return (
      <ChildWaitRedemptionContent
        childUrl={childUrl}
        redemptionDate={result.redemptionDate}
        daysRemaining={result.daysRemaining}
        isAfterSetup={false}
      />
    );
  }

  if (result.mode === 'setup') {
    return <ChildSetupContent validationOverride={result} />;
  }

  if (result.mode === 'redemption') {
    return <ChildRedemptionContent validationOverride={result} />;
  }

  return null;
}

export default function ChildPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">טוען...</div>
      }
    >
      <ChildPageContent />
    </Suspense>
  );
}
