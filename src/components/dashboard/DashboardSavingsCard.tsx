'use client';

import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';
import { CHILD_DASHBOARD_ASSETS } from '@/constants/child-dashboard-layout';

type DashboardSavingsCardProps = {
  balance: number;
  childName?: string;
  dimmed?: boolean;
  variant?: 'parent' | 'child';
};

export function DashboardSavingsCard({
  balance,
  childName,
  dimmed = false,
  variant = 'parent',
}: DashboardSavingsCardProps) {
  const isChild = variant === 'child';
  const label = isChild
    ? 'כרטיס החסכון שלי'
    : childName
      ? `כרטיס החיסכון של ${childName}`
      : 'כרטיס החסכון';

  return (
    <div
      className="relative mx-auto h-[172px] w-full max-w-[314px]"
      style={{ opacity: dimmed ? 0.5 : 1 }}
    >
      <div
        className="absolute inset-x-0 top-[-10px] mx-auto flex w-full max-w-[314px] flex-col items-center justify-end rounded-[27px] p-2 backdrop-blur-[2px]"
        style={{ background: 'rgba(143, 143, 143, 0.20)' }}
      >
        <div className="flex w-full max-w-[290px] flex-col items-start">
          <div className="relative h-[156px] w-full overflow-hidden rounded-[24px]">
            <Image
              src={CHILD_DASHBOARD_ASSETS.savingsCardBg}
              alt=""
              fill
              className="object-cover object-bottom"
              unoptimized
            />
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.30)' }}
              aria-hidden
            />

            <div
              className="pointer-events-none absolute left-[207px] top-[122px] h-[194px] w-[240px] origin-top-left rotate-[125deg] blur-[4.5px]"
              style={{
                background:
                  'linear-gradient(355deg, rgba(88, 249, 255, 0.20) 0%, rgba(88, 249, 255, 0) 100%)',
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-[214px] top-[125px] h-[234px] w-[283px] origin-top-left rotate-[122deg] opacity-60"
              style={{
                background:
                  'linear-gradient(177deg, rgba(0, 179, 203, 0) 0%, rgba(0, 99, 113, 0.50) 100%)',
              }}
              aria-hidden
            />

            {/* Joystie SVG left · כרטיס החסכון שלי + balance right */}
            <div
              className="absolute left-5 right-5 top-[23px] z-10 flex items-start justify-between"
              dir="ltr"
            >
              <JoystieWordmarkLogo
                className="h-[31px] w-auto shrink-0"
                aria-label="Joystie"
                role="img"
              />

              <div className="flex min-w-[102px] flex-col items-end justify-center gap-[8.5px] text-right">
                <p
                  className="font-simpler text-[14px] font-normal leading-4 text-white opacity-60"
                  dir="rtl"
                >
                  {label}
                </p>
                <p
                  className="font-simpler text-[32px] leading-9 text-white [text-shadow:2px_2px_10px_rgba(0,0,0,0.20)]"
                  dir="rtl"
                >
                  <span className="font-black">{formatNumber(balance, 0)}</span>
                  <span className="font-normal"> ₪</span>
                </p>
              </div>
            </div>

            <div
              className="absolute left-[15px] right-[15px] top-[127px] z-10 flex items-center justify-between font-['Roboto_Flex',sans-serif] text-[12px] leading-4 text-white"
              dir="ltr"
            >
              <span className="font-semibold">5294 2436 4780 2468</span>
              <span className="font-light">12/31</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute left-1/2 top-[184px] h-[14px] w-[203px] -translate-x-1/2 rounded-full blur-[5px]"
        style={{ background: 'rgba(205, 205, 205, 0.10)' }}
        aria-hidden
      />
    </div>
  );
}
