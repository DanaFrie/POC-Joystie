'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top immediately when pathname changes
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    
    // Also ensure scroll is at top after a short delay (in case content loads asynchronously)
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}

