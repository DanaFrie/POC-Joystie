'use client';

import {
  PARENT_DASHBOARD_ASSETS,
  PARENT_DASHBOARD_COLORS,
} from '@/constants/parent-dashboard-layout';

type DashboardChallengeBannerProps = {
  childName: string;
  reductionPercent?: number | null;
  onClick?: () => void;
};

export function DashboardChallengeBanner({
  childName,
  reductionPercent = 55,
  onClick,
}: DashboardChallengeBannerProps) {
  const tagText =
    reductionPercent != null && reductionPercent > 0
      ? `לצמצום זמן מסך ב-${reductionPercent}%`
      : 'לצמצום זמן מסך';

  const headline = childName
    ? `להתחלת אתגר המסך הראשון של ${childName} >>`
    : 'להתחלת אתגר המסך הראשון >>';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-[145px] w-full flex-col items-center justify-center overflow-hidden rounded-[32px] px-[18px] py-[25px] text-right"
      style={{
        background: `linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.40) 49.17%), url(${PARENT_DASHBOARD_ASSETS.challengeBanner}) lightgray -20.052px -9.483px / 105.38% 103.791% no-repeat`,
        outline: `1px solid ${PARENT_DASHBOARD_COLORS.cardOutline}`,
        outlineOffset: -1,
      }}
    >
      <span className="absolute left-[165px] top-[52px] z-[1] inline-flex items-center justify-center rounded-full bg-white/25 px-2 py-1 font-simpler text-[12px] font-normal leading-[15px] text-white backdrop-blur-[2px]">
        {tagText}
      </span>

      <p className="absolute left-[68px] top-[83px] z-[1] w-[229px] px-2 text-right font-simpler text-[20px] font-black leading-6 text-white [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]">
        {headline}
      </p>
    </button>
  );
}
