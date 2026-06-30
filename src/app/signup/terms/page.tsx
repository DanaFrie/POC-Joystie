'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — terms live under /onboarding/terms. */
export default function SignupTermsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/terms');
  }, [router]);

  return null;
}
