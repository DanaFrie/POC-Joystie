'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy v0.2 consultation step — booking UI lives in the dashboard modal. */
export default function OnboardingCompleteRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
