'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — pick child is a step on /onboarding/parent. */
export default function OnboardingPickChildPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/parent');
  }, [router]);

  return null;
}
