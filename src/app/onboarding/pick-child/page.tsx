'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Legacy route — pick-child is now a step on /onboarding/signup. */
export default function OnboardingPickChildRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/signup');
  }, [router]);

  return null;
}
