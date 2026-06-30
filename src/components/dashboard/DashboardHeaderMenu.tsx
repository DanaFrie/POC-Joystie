'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { clearSession } from '@/utils/session';
import { signOutUser } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('DashboardHeaderMenu');

export function DashboardHeaderMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      logger.error('Error signing out:', error);
    }
    clearSession();
    router.push('/');
    setOpen(false);
  };

  return (
    <div className="relative z-30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label={open ? 'סגור תפריט' : 'פתח תפריט'}
        aria-expanded={open}
      >
        {open ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="סגור תפריט"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-12 z-50 min-w-[180px] overflow-hidden rounded-[18px] border border-white/20 bg-v03-green-900/95 shadow-v03-display backdrop-blur-md">
            <Link
              href="/help"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-right font-simpler text-[15px] font-bold text-white transition hover:bg-white/10"
            >
              עזרה
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-3 text-right font-simpler text-[15px] font-bold text-red-200 transition hover:bg-white/10"
            >
              התנתק
            </button>
          </div>
        </>
      )}
    </div>
  );
}
