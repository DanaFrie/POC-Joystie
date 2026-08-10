'use client';

import { useEffect } from 'react';
import { scrollLandingToSection } from '@/components/landing/landingStatsStory';

/** Scroll to `#hash` after client navigations from other marketing pages (e.g. /about → /#faq). */
export function LandingHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;
      // Wait a tick so the landing DOM is ready after client nav.
      window.requestAnimationFrame(() => scrollLandingToSection(id));
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return null;
}
