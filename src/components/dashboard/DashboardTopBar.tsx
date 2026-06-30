'use client';

import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';
import { formatNumber } from '@/utils/formatting';

type DashboardTopBarProps = {
  balance: number;
  notificationCount: number;
  onNotificationsClick: () => void;
  menuSlot: React.ReactNode;
};

function WalletCoinIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" aria-hidden className="shrink-0">
      <circle cx="11.5" cy="11.5" r="10" fill="#FEE268" />
      <circle cx="11.5" cy="11.5" r="8" fill="#FDBF22" />
      <path
        d="M8 11.5C8 9.5 9.5 8 11.5 8C13.5 8 15 9.5 15 11.5C15 13.5 13.5 15 11.5 15"
        stroke="#F19906"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function DashboardTopBar({
  balance,
  notificationCount,
  onNotificationsClick,
  menuSlot,
}: DashboardTopBarProps) {
  return (
    <div
      className="relative z-20 shrink-0 px-[15px] pb-2 pt-1"
      style={{ boxShadow: '0px 3px 12px rgba(133, 139, 187, 0.16)' }}
    >
      <div className="flex h-14 items-center justify-between">
        <div
          className="flex h-[42px] items-center rounded-full px-3"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            outline: `1px solid ${PARENT_DASHBOARD_COLORS.walletOutline}`,
            outlineOffset: -1,
          }}
        >
          <WalletCoinIcon />
          <div className="mr-2 flex items-baseline gap-0.5 font-simpler text-white">
            <span className="text-[13px] font-normal tracking-[0.65px]">₪</span>
            <span className="text-[15px] font-black tracking-[0.75px]">
              {formatNumber(balance, 0)}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <JoystieWordmarkLogo className="h-[34px] w-auto" />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative flex h-6 w-6 items-center justify-center text-white"
            aria-label="עדכונים"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 8.5C18 5.46 15.54 3 12.5 3S7 5.46 7 8.5V14L5 16.5H20L18 14V8.5Z"
                stroke="white"
                strokeWidth="1"
              />
              <path d="M9.5 18.5H15.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            </svg>
            {notificationCount > 0 && (
              <span
                className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-simpler text-[11px] text-[#F9F9FF]"
                style={{ background: '#AE10FD' }}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          {menuSlot}
        </div>
      </div>
    </div>
  );
}
