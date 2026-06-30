'use client';

import { formatNumber } from '@/utils/formatting';
import { PARENT_DASHBOARD_COLORS } from '@/constants/parent-dashboard-layout';

type DashboardSavingsCardProps = {
  balance: number;
  childName?: string;
};

export function DashboardSavingsCard({ balance, childName }: DashboardSavingsCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-[290px]">
      <div
        className="rounded-[27px] p-2 backdrop-blur-[2px]"
        style={{ background: 'rgba(142, 142, 142, 0.20)' }}
      >
        <div
          className="relative h-[156px] overflow-hidden rounded-[24px]"
          style={{
            background: 'linear-gradient(135deg, #0a4a52 0%, #061C1E 45%, #1a3d4a 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'linear-gradient(177deg, rgba(0, 179, 203, 0) 0%, rgba(0, 99, 112, 0.5) 100%)',
            }}
          />

          <div className="relative z-10 flex items-start justify-between px-5 pt-5">
            <div>
              <div className="font-['Montserrat_Alternates',sans-serif] text-[19px] font-semibold leading-[22px] text-white">
                Joy
              </div>
              <div
                className="mt-1 h-[4px] w-[23px] rotate-[5deg] rounded-full"
                style={{ background: PARENT_DASHBOARD_COLORS.mintBright }}
              />
            </div>
            <div className="text-right">
              <p className="text-[14px] font-normal leading-4 text-white/60">
                {childName ? `כרטיס החיסכון של ${childName}` : 'כרטיס החסכון'}
              </p>
              <p className="mt-1 font-simpler text-[32px] leading-9 text-white drop-shadow-[2px_2px_10px_rgba(0,0,0,0.2)]">
                <span className="font-normal">₪ </span>
                <span className="font-black">{formatNumber(balance, 0)}</span>
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-4 font-['Roboto_Flex',sans-serif] text-[12px] text-white">
            <span className="font-semibold tracking-wider opacity-80">•••• •••• •••• ••••</span>
            <span className="font-light opacity-80">12/31</span>
          </div>
        </div>
      </div>
      <div
        className="mx-auto mt-3 h-[14px] w-[203px] rounded-full blur-[5px]"
        style={{ background: 'rgba(205, 205, 205, 0.10)' }}
        aria-hidden
      />
    </div>
  );
}
