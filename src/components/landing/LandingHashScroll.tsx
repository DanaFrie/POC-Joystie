'use client';

import { useEffect } from 'react';
import { scrollLandingToSection } from '@/components/landing/landingStatsStory';

/** Scroll to `#hash` after client navigations from other marketing pages (e.g. /about → /#faq). */
export function LandingHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;

      // Mobile/layout: element may exist before sticky stats finish measuring.
      const attempt = (n: number) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().height > 0) {
          scrollLandingToSection(id);
          // Second pass after sticky/scrub layout settles (esp. mobile).
          if (n < 3) {
            window.setTimeout(() => scrollLandingToSection(id), 120);
          }
          return;
        }
        if (n < 20) window.setTimeout(() => attempt(n + 1), 50);
      };

      window.requestAnimationFrame(() => attempt(0));
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    window.addEventListener('popstate', scrollToHash);
    return () => {
      window.removeEventListener('hashchange', scrollToHash);
      window.removeEventListener('popstate', scrollToHash);
    };
  }, []);

  return null;
}
