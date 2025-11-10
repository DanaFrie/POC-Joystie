'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show navigation for child pages, signup page, login page, and terms page
  if (pathname?.startsWith('/child') || pathname === '/signup' || pathname?.startsWith('/signup/terms') || pathname === '/login') {
    return null;
  }
  
  return <Navigation />;
}

