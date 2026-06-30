'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — forgot password lives under /login/forgot-password. */
export default function ForgotPasswordRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login/forgot-password');
  }, [router]);

  return null;
}
