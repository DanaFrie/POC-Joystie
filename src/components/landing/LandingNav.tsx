'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BRAND_LOGO_SRC } from '@/constants/brand-assets';
import { ButtonLink } from '@/components/ui/Button';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'איך זה עובד?' },
  { href: '#questions', label: 'שאלות חשובות' },
  { href: '#behind-idea', label: 'מאחורי הרעיון' },
] as const;

export function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSectionClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault();
      setIsMenuOpen(false);

      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = 72;
        const offset = 20;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navHeight - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    },
    [],
  );

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-v03-green-900/90 backdrop-blur-md"
      dir="rtl"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <a href="#" className="flex shrink-0 items-center">
          <Image
            src={BRAND_LOGO_SRC}
            alt="Joystie"
            width={120}
            height={40}
            className="h-7 w-auto object-contain mix-blend-screen md:h-8"
            priority
            unoptimized
          />
        </a>

        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="font-simpler text-[16px] font-bold text-v03-text-on-dark transition-colors hover:text-v03-accent"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="font-simpler text-[15px] font-bold text-v03-text-muted-on-dark underline-offset-4 hover:text-v03-accent hover:underline"
          >
            התחברות
          </Link>
          <ButtonLink href="/onboarding" size="md" className="w-auto min-w-[140px] px-6">
            התחילו ניסיון
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="mr-auto rounded-v03-button p-2 text-v03-text-on-dark hover:bg-white/10 md:hidden"
          aria-label="תפריט"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div
          className="border-t border-white/10 bg-v03-green-900 px-6 py-5 md:hidden"
          role="menu"
        >
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={(e) => handleSectionClick(e, href.slice(1))}
                className="font-simpler text-lg font-bold text-v03-text-on-dark"
              >
                {label}
              </a>
            ))}
            <ButtonLink href="/onboarding" size="md">
              התחילו ניסיון
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
