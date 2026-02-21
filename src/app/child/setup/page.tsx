'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectToChild() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  useEffect(() => {
    if (typeof window !== 'undefined' && token) {
      window.location.replace(`/child?token=${encodeURIComponent(token)}`);
    }
  }, [token]);
  return (
    <div className="min-h-screen flex items-center justify-center font-varela text-[#282743]">
      מעביר...
    </div>
  );
}

export default function ChildSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
      <RedirectToChild />
    </Suspense>
  );
}
