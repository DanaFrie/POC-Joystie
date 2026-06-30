'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy v0.2 signup — funnel lives at `/onboarding`. */
export default function SignupRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding');
  }, [router]);

  return null;
}
