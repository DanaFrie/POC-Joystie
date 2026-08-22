'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileCheck2, Home, Share2, Smartphone } from 'lucide-react';
import { PARENT_DASHBOARD_ASSETS } from '@/constants/parent-dashboard-layout';
import { CHILD_DASHBOARD_ASSETS } from '@/constants/child-dashboard-layout';

type DashboardQuickActionsProps = {
  childName: string;
  showCreateDeal?: boolean;
  onCreateDeal?: () => void;
  /** Return true to mark DSM tick on the tile. */
  onCopyWalletLink?: () => Promise<boolean> | boolean;
  onShareContract?: () => void;
  onViewContract?: () => void;
  /** Return true to mark DSM tick on the tile. */
  onAddToHome?: () => Promise<boolean> | boolean;
  variant?: 'parent' | 'child';
  parentLabel?: string;
};

const cardClass =
  'relative flex w-[128px] shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-[24px] border border-[#527079] px-[15px] py-5 shadow-[2px_2px_10px_0px_rgba(255,255,255,0.1)]';

const childCardClass =
  'relative flex min-w-px flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-[24px] border border-[#527079] px-[15px] py-5 shadow-[2px_2px_10px_0px_rgba(255,255,255,0.1)]';

const cardStyle = {
  backgroundImage: 'linear-gradient(229.55deg, rgb(5, 22, 26) 7.211%, rgb(8, 29, 34) 93.011%)',
} as const;

function DsmTick({ className = '' }: { className?: string }) {
  return (
    <Image
      src={PARENT_DASHBOARD_ASSETS.quickActionTick}
      alt=""
      width={28}
      height={28}
      className={`size-7 ${className}`}
      unoptimized
    />
  );
}

function QuickActionCard({
  label,
  onClick,
  icon,
  done = false,
  className = cardClass,
}: {
  label: string;
  onClick?: () => void;
  icon: ReactNode;
  done?: boolean;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={className} style={cardStyle}>
      <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden text-white">
        {done ? <DsmTick /> : icon}
      </span>
      <span className="w-full whitespace-pre-wrap text-center font-simpler text-[14px] font-bold leading-normal tracking-[-0.28px] text-white">
        {label}
      </span>
    </button>
  );
}

/** Horizontal quick-actions strip — RTL. */
export function DashboardQuickActions({
  childName,
  showCreateDeal = false,
  onCreateDeal,
  onCopyWalletLink,
  onShareContract,
  onViewContract,
  onAddToHome,
  variant = 'parent',
  parentLabel = 'אמא',
}: DashboardQuickActionsProps) {
  const name = childName || 'הילד';
  const [linkCopied, setLinkCopied] = useState(false);
  const [homeAdded, setHomeAdded] = useState(false);

  useEffect(() => {
    if (!linkCopied) return;
    const id = window.setTimeout(() => setLinkCopied(false), 4000);
    return () => window.clearTimeout(id);
  }, [linkCopied]);

  useEffect(() => {
    if (!homeAdded) return;
    const id = window.setTimeout(() => setHomeAdded(false), 4000);
    return () => window.clearTimeout(id);
  }, [homeAdded]);

  const handleCopy = async () => {
    const ok = await onCopyWalletLink?.();
    if (ok) setLinkCopied(true);
  };

  const handleHome = async () => {
    const ok = await onAddToHome?.();
    if (ok) setHomeAdded(true);
  };

  if (variant === 'child') {
    return (
      <section className="flex w-full flex-col items-end justify-center gap-2" dir="rtl">
        <div className="flex w-full items-center justify-center px-2.5">
          <p className="w-full text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
            פעולות מהירות
          </p>
        </div>
        <div className="flex w-full gap-3">
          <QuickActionCard
            className={childCardClass}
            label={`צפייה בחוזה\nעם ${parentLabel}`}
            onClick={onViewContract}
            icon={<FileCheck2 size={24} strokeWidth={1.5} aria-hidden />}
          />
          <QuickActionCard
            className={childCardClass}
            label="הוספת ג׳ויסטי לדף הבית"
            onClick={() => void handleHome()}
            done={homeAdded}
            icon={
              <Image
                src={CHILD_DASHBOARD_ASSETS.quickHome}
                alt=""
                width={24}
                height={24}
                className="size-6"
                unoptimized
              />
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col items-stretch gap-2" dir="rtl">
      <div className="flex w-full items-center justify-center px-2.5">
        <p className="w-full text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
          פעולות מהירות
        </p>
      </div>

      <div className="v03-scroll-hidden flex w-full gap-3 overflow-x-auto pb-1 pe-0 ps-0">
        <QuickActionCard
          label={`העתקת לינק לארנק של ${name}`}
          onClick={() => void handleCopy()}
          done={linkCopied}
          icon={
            <Image
              src={PARENT_DASHBOARD_ASSETS.quickCopy}
              alt=""
              width={24}
              height={24}
              className="size-6"
              unoptimized
            />
          }
        />
        <QuickActionCard
          label={`שיתוף החוזה עם ${name}`}
          onClick={onShareContract}
          icon={<Share2 size={24} strokeWidth={1.5} aria-hidden />}
        />
        <QuickActionCard
          label={`צפייה בחוזה עם ${name}`}
          onClick={onViewContract}
          icon={<FileCheck2 size={24} strokeWidth={1.5} aria-hidden />}
        />
        <QuickActionCard
          label="הוספת ג׳ויסטי למסך הבית"
          onClick={() => void handleHome()}
          done={homeAdded}
          icon={<Home size={24} strokeWidth={1.5} aria-hidden />}
        />
        {showCreateDeal ? (
          <QuickActionCard
            label="יצירת דיל מסך חדש"
            onClick={onCreateDeal}
            icon={<Smartphone size={24} strokeWidth={1.5} aria-hidden />}
          />
        ) : null}
      </div>
    </section>
  );
}
