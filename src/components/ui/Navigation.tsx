'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession } from '@/utils/session';
import { getUserChallenges } from '@/lib/api/challenges';
import { getCurrentUserId, signOutUser } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Navigation');

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [challengeExists, setChallengeExists] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if any challenge exists (not just active)
  useEffect(() => {
    const checkChallenge = async () => {
      try {
        const userId = await getCurrentUserId();
        if (userId) {
          const challenges = await getUserChallenges(userId);
          setChallengeExists(challenges.length > 0);
        } else {
          setChallengeExists(false);
        }
      } catch (error) {
        logger.error('Error checking challenge:', error);
        setChallengeExists(false);
      }
    };
    
    checkChallenge();
  }, [pathname]); // Re-check when pathname changes

  // Order based on challenge existence
  // If challenge exists: לוח בקרה, עזרה, התנתק (no הגדרת אתגר)
  // If no challenge: הגדרת אתגר, עזרה, התנתק (no לוח בקרה)
  const orderedLinks = challengeExists
    ? [
        { href: '/dashboard', label: 'לוח בקרה', requiresChallenge: true },
        { href: '/help', label: 'עזרה', requiresChallenge: false }
      ]
    : [
        { href: '/onboarding', label: 'הגדרת אתגר', requiresChallenge: false },
        { href: '/help', label: 'עזרה', requiresChallenge: false }
      ];

  // Get the primary link for mobile (first visible link)
  const primaryLink = challengeExists
    ? { href: '/dashboard', label: 'לוח בקרה', requiresChallenge: true }
    : { href: '/onboarding', label: 'הגדרת אתגר', requiresChallenge: false };

  // Get other links for mobile menu (all except primary)
  const mobileMenuLinks = orderedLinks.filter(link => link.href !== primaryLink.href);

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth
      await signOutUser();
      logger.log('Signed out from Firebase Auth');
    } catch (error) {
      logger.error('Error signing out from Firebase Auth:', error);
    }
    
    // Clear session data
    clearSession();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="relative py-6 bg-white bg-opacity-80 backdrop-blur-sm overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 relative w-full">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center">
            {imageError ? (
              <span className="text-xl sm:text-2xl font-varela font-bold text-dark-blue">Joystie</span>
            ) : (
              <div className="relative">
                <Image
                  src="/logo-joystie.png"
                  alt="Joystie"
                  width={120}
                  height={40}
                  className="h-10 sm:h-8 w-auto"
                  style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(46%) saturate(1673%) hue-rotate(186deg) brightness(98%) contrast(91%)', height: 'auto' }}
                  priority
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </Link>
          
          {/* Desktop: Show all links (flipped order) */}
          <div className="hidden sm:flex gap-3 flex-row-reverse items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-md text-sm font-varela font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 whitespace-nowrap"
            >
              התנתק
            </button>
            {[...orderedLinks].reverse().map((link) => {
              const isDisabled = link.requiresChallenge && !challengeExists;
              
              if (isDisabled) {
                return (
                  <span
                    key={link.href}
                    className="px-4 py-2.5 rounded-md text-sm font-varela font-medium text-gray-400 cursor-not-allowed whitespace-nowrap"
                  >
                    {link.label}
                  </span>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2.5 rounded-md text-sm font-varela font-medium whitespace-nowrap ${
                    isActive(link.href)
                      ? 'bg-dark-blue text-white'
                      : 'text-gray-600 hover:text-dark-blue hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile: Show hamburger + primary link (flipped) */}
          <div className="flex sm:hidden gap-2 flex-row-reverse items-center">
            {/* Hamburger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-50"
              aria-label="תפריט"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            {/* Primary link */}
            <Link
              href={primaryLink.href}
              className={`px-3 py-2 rounded-md text-xs font-varela font-medium whitespace-nowrap ${
                isActive(primaryLink.href)
                  ? 'bg-dark-blue text-white'
                  : 'text-gray-600 hover:text-dark-blue hover:bg-gray-50'
              }`}
            >
              {primaryLink.label}
            </Link>
          </div>
        </div>

        {/* Mobile menu dropdown (original order) */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex flex-col gap-2">
              {mobileMenuLinks.map((link) => {
                const isDisabled = link.requiresChallenge && !challengeExists;
                
                if (isDisabled) {
                  return (
                    <span
                      key={link.href}
                      className="px-4 py-2 rounded-md text-sm font-varela font-medium text-gray-400 cursor-not-allowed text-right"
                    >
                      {link.label}
                    </span>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`px-4 py-2 rounded-md text-sm font-varela font-medium text-right ${
                      isActive(link.href)
                        ? 'bg-dark-blue text-white'
                        : 'text-gray-600 hover:text-dark-blue hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-varela font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 text-right"
              >
                התנתק
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}