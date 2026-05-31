'use client';

import { useState } from 'react';
import { ChildScreenTimeCard } from '@/components/onboarding/screen-time/ChildScreenTimeCard';
import { ONBOARDING_BLUR_FOOTER_HEIGHT_PX } from '@/components/onboarding/OnboardingBlurFooter';
import { ONBOARDING_SCREEN_TIME_HERO_IMAGE } from '@/constants/onboarding-figma';
import type { OnboardingChildScreenTime } from '@/lib/onboarding/childrenScreenTime';
import { getChildScreenTimeRoleLabels } from '@/lib/onboarding/childrenScreenTime';

type ChildrenScreenTimeStepProps = {
  entries: OnboardingChildScreenTime[];
  onEntriesChange: (entries: OnboardingChildScreenTime[]) => void;
};

/** Figma 1430108711 — fixed hero + title; scroll children only (1430108636). */
export function ChildrenScreenTimeStep({
  entries,
  onEntriesChange,
}: ChildrenScreenTimeStepProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const roleLabels = getChildScreenTimeRoleLabels(entries.length);

  const updateEntry = (index: number, hours: number) => {
    const next = [...entries];
    next[index] = { ...next[index]!, hours };
    onEntriesChange(next);
  };

  return (
    <div
      dir="rtl"
      className="absolute inset-x-0 top-[82px] z-[10] overflow-hidden"
      style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
      aria-label="שעות מסך יומיות"
    >
      <div className="absolute bottom-0 right-v03-gutter top-0 flex w-v03-content flex-col items-center gap-[19px] overflow-hidden">
        <div className="relative h-[180px] w-full shrink-0 overflow-hidden">
          {!imageFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ONBOARDING_SCREEN_TIME_HERO_IMAGE}
              alt=""
              className="pointer-events-none absolute left-[-25.8px] top-[27.56px] h-[176.6px] w-[176.6px] max-w-none origin-top-left -rotate-[15deg] object-contain"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className="w-full shrink-0 px-[15px]">
          <h1 className="w-full text-center font-simpler text-[30px] leading-[34.5px] text-white">
            <span className="font-black">כמה שעות ביום </span>
            <span className="font-normal">(בערך) </span>
            <span className="font-black">הילדים במסך לדעתך?</span>
          </h1>
        </div>

        <div className="v03-scroll-hidden min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex w-full flex-col items-end gap-[35px] pb-4">
            {entries.map((entry, index) => (
              <ChildScreenTimeCard
                key={`${entry.name}-${index}`}
                roleLabel={roleLabels[index] ?? `ילד/ה ${index + 1}`}
                name={entry.name}
                hours={entry.hours}
                onHoursChange={(hours) => updateEntry(index, hours)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
