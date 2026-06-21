'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — funnel continues on /onboarding/parent. */
export default function OnboardingRevealPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding');
  }, [router]);

  return null;
}
