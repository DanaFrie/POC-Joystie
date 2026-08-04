'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalMainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isFullBleed =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/onboarding' ||
    pathname?.startsWith('/onboarding/') ||
    pathname?.startsWith('/game') ||
    pathname === '/login' ||
    pathname?.startsWith('/login/') ||
    pathname === '/terms' ||
    pathname === '/help' ||
    pathname === '/dashboard' ||
    pathname?.startsWith('/dashboard/');

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
