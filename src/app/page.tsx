'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard by default
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <p className="text-xl">מעביר לדשבורד...</p>
    </div>
  );
}