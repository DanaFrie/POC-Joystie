'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show navigation for home page, child pages, onboarding, login, help, dashboard.
  if (
    pathname === '/' ||
    pathname === '/about' ||
    pathname?.startsWith('/game') ||
    pathname === '/onboarding' ||
    pathname?.startsWith('/onboarding/') ||
    pathname === '/login' ||
    pathname?.startsWith('/login/') ||
    pathname === '/terms' ||
    pathname === '/help' ||
    pathname === '/dashboard' ||
    pathname?.startsWith('/dashboard/')
  ) {
    return null;
  }
  
  return <Navigation />;
}

