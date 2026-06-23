'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const V02_BG_PATHS = new Set(['/dashboard', '/help', '/forgot-password', '/reset-password']);

function needsLegacyV02Surface(pathname: string | null): boolean {
  if (!pathname) return false;
  if (V02_BG_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/admin')) return true;
  if (pathname.startsWith('/signup/terms')) return true;
  return false;
}

function needsLegacyV02Fonts(pathname: string | null): boolean {
  if (!pathname) return false;
  if (needsLegacyV02Surface(pathname)) return true;
  if (pathname === '/signup') return true;
  if (pathname.startsWith('/signup/')) return true;
  return false;
}

export default function ConditionalMainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isFullBleed =
    pathname === '/' ||
    pathname === '/onboarding' ||
    pathname?.startsWith('/onboarding/') ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname?.startsWith('/signup/terms');

  const useLegacyBg = needsLegacyV02Surface(pathname);
  const useLegacyFonts = needsLegacyV02Fonts(pathname);

  useEffect(() => {
    document.body.classList.toggle('layout-v02-bg', useLegacyBg);
    return () => {
      document.body.classList.remove('layout-v02-bg');
    };
  }, [useLegacyBg]);

  useEffect(() => {
    if (!useLegacyFonts) return;
    void import('@/styles/legacy-v02-fonts.css');
  }, [useLegacyFonts]);

  if (isFullBleed) {
    return <>{children}</>;
  }

  return (
    <main
      className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:[&>*]:rounded-[20px] lg:rounded-[20px] rounded-none overflow-x-hidden"
      style={{ border: 'none', outline: 'none' }}
    >
      {children}
    </main>
  );
}
