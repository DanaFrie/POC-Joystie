'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/utils/session';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if logged in, redirect accordingly
    if (isLoggedIn()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <p className="text-xl">מעביר לדשבורד...</p>
    </div>
  );
}