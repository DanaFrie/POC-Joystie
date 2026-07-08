'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy v0.2 consultation step — booking UI lives in the dashboard modal. */
export default function OnboardingCompleteRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?subscription=1');
  }, [router]);

  return null;
}
