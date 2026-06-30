'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy v0.2 challenge setup — replaced by the v0.3 onboarding funnel. */
export default function OnboardingSetupRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding');
  }, [router]);

  return null;
}
