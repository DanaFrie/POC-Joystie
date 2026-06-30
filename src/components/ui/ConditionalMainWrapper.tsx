'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function needsLegacyV02Surface(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/child')) return true;
  return false;
}

function needsLegacyV02Fonts(pathname: string | null): boolean {
  return needsLegacyV02Surface(pathname);
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
    pathname?.startsWith('/login/') ||
    pathname === '/signup' ||
    pathname?.startsWith('/signup/') ||
    pathname?.startsWith('/child') ||
    pathname === '/help' ||
    pathname === '/dashboard';

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
