'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show navigation for home page, child pages, signup page, login page, forgot password page, and terms page
  if (pathname === '/' || pathname?.startsWith('/child') || pathname === '/signup' || pathname?.startsWith('/signup/terms') || pathname === '/login' || pathname === '/forgot-password') {
    return null;
  }
  
  return <Navigation />;
}

