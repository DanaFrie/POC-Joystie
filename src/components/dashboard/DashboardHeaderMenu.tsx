'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession } from '@/utils/session';
import { signOutUser } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('DashboardHeaderMenu');

const NOTIFICATION_BELL_SRC = '/dashboard/notification-01.svg';

type DashboardHeaderMenuProps = {
  /** Parent: Help + Logout dropdown. Child: generic purple avatar. */
  variant?: 'parent' | 'child';
};

function NotificationBellIcon() {
  return (
    <span className="relative size-6 shrink-0 overflow-hidden" aria-hidden>
      <Image
        src={NOTIFICATION_BELL_SRC}
        alt=""
        width={24}
        height={24}
        className="size-6 object-contain"
        unoptimized
      />
    </span>
  );
}

/** Landing user glyph in the Figma 32px Blue-900 disc. */
function GenericPurpleProfileIcon({ className = '' }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center ${className}`}
      style={{
        width: 32,
        height: 32,
        gap: 13.333,
        borderRadius: 57.333,
        background: '#05161A',
      }}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17.5"
        height="17.5"
        viewBox="0 0 17.5 17.5"
        fill="none"
        className="size-[17.5px] shrink-0"
      >
        <path
          d="M8.74943 8.02083C10.3603 8.02083 11.6661 6.715 11.6661 5.10417C11.6661 3.49334 10.3603 2.1875 8.74943 2.1875C7.1386 2.1875 5.83276 3.49334 5.83276 5.10417C5.83276 6.715 7.1386 8.02083 8.74943 8.02083Z"
          fill="white"
        />
        <path
          d="M8.75057 10.2082C5.10474 10.2082 2.91724 12.0311 2.91724 13.854C2.91724 14.6595 3.57015 15.3124 4.37557 15.3124H13.1256C13.931 15.3124 14.5839 14.6595 14.5839 13.854C14.5839 12.0311 12.3964 10.2082 8.75057 10.2082Z"
          fill="white"
        />
      </svg>
    </span>
  );
}

export function DashboardHeaderMenu({
  variant = 'parent',
}: DashboardHeaderMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (variant === 'child') {
    return (
      <div className="flex items-center gap-4">
        <NotificationBellIcon />
        <GenericPurpleProfileIcon />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      logger.error('Error signing out:', error);
    }
    clearSession();
    router.push('/login');
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-4">
      <NotificationBellIcon />
      <div className="relative z-30">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 items-center justify-center"
          aria-label=          {open ? 'סגור תפריט' : 'פתח תפריט'}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <GenericPurpleProfileIcon />
        </button>

        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              aria-label="סגור תפריט"
              onClick={() => setOpen(false)}
            />
            <div
              role="menu"
              className="absolute right-0 top-10 z-50 min-w-[160px] overflow-hidden rounded-[18px] border border-white/20 bg-v03-green-900/95 shadow-v03-display backdrop-blur-md"
            >
              <Link
                href="/help"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-right font-simpler text-[15px] font-bold text-white transition hover:bg-white/10"
              >
                עזרה
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="block w-full px-4 py-3 text-right font-simpler text-[15px] font-bold text-red-200 transition hover:bg-white/10"
              >
                התנתק
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
