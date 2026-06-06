'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — funnel continues on /onboarding/parent. */
export default function OnboardingSignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/parent');
  }, [router]);

  return null;
}
