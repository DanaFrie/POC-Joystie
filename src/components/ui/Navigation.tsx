'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const [imageError, setImageError] = useState(false);

  const links = [
    { href: '/dashboard', label: 'ניצחונות' },
    { href: '/help', label: 'עזרה' },
    { href: '/onboarding', label: 'הגדרת חשבון' },
  ];

  // Don't show "Add Child" in the main navigation - it should be accessed from the dashboard
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className="relative py-4 bg-white bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center">
            {imageError ? (
              <span className="text-2xl font-varela font-bold text-dark-blue">Joystie</span>
            ) : (
              <div className="relative">
                <Image
                  src="/logo-joystie.png"
                  alt="Joystie"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)' }}
                  priority
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </Link>
          <div className="flex gap-4 flex-row-reverse">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-varela font-medium ${
                  isActive(link.href)
                    ? 'bg-dark-blue text-white'
                    : 'text-gray-600 hover:text-dark-blue hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}