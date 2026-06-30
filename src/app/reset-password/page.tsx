'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/login/reset-password?${query}` : '/login/reset-password');
  }, [router, searchParams]);

  return null;
}

/** Legacy route — password reset lives under /login/reset-password. */
export default function ResetPasswordRedirectPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordRedirect />
    </Suspense>
  );
}
