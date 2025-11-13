'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/utils/session';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure client-side is ready
    const timer = setTimeout(() => {
      try {
        // Check if logged in, redirect accordingly
        if (isLoggedIn()) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error during redirect:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <p className="text-xl">{isLoading ? 'טוען...' : 'מעביר...'}</p>
    </div>
  );
}