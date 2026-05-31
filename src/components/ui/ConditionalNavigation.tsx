'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show navigation for home page, child pages, onboarding/signup pages, login and forgot password.
  if (
    pathname === '/' ||
    pathname?.startsWith('/child') ||
    pathname === '/signup' ||
    pathname === '/onboarding' ||
    pathname?.startsWith('/onboarding/') ||
    pathname === '/challengeSetup' ||
    pathname?.startsWith('/signup/terms') ||
    pathname === '/login' ||
    pathname === '/forgot-password'
  ) {
    return null;
  }
  
  return <Navigation />;
}

