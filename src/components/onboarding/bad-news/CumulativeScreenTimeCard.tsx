'use client';

import type { ChildCumulativeProjection } from '@/lib/onboarding/cumulativeScreenTime';
import { futureScreenTimeVerb } from '@/lib/onboarding/cumulativeScreenTime';

type CumulativeScreenTimeCardProps = {
  child: ChildCumulativeProjection;
  className?: string;
};

export function CumulativeScreenTimeCard({
  child,
  className = '',
}: CumulativeScreenTimeCardProps) {
  const verb = futureScreenTimeVerb(child.gender);

  return (
    <article
      className={`flex w-full flex-col items-center gap-2 rounded-[24px] border border-[#efefef] bg-[linear-gradient(227deg,#fff_0%,#f7f7f7_100%)] p-[18px] ${className}`}
    >
      <p className="w-full text-center font-simpler text-[20px] leading-6 text-v03-text-on-light">
        <span className="font-bold">{child.name}</span>
        <span className="font-normal">{` ${verb} לבלות זמן מסך מצטבר של:`}</span>
      </p>
      <div className="inline-flex items-center justify-center rounded-[5px] bg-[#ececec] px-[5px] py-[3px]">
        <p className="text-center font-simpler text-[24px] font-black leading-[30px] text-[#292929]">
          {child.durationLabel}
        </p>
      </div>
    </article>
  );
}
