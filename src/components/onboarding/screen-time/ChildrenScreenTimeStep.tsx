'use client';

import { useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildScreenTimeCard } from '@/components/onboarding/screen-time/ChildScreenTimeCard';
import { ONBOARDING_SCREEN_TIME_HERO_IMAGE } from '@/constants/onboarding-figma';
import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';
import { getChildScreenTimeRoleLabel } from '@/lib/onboarding/childrenDetails';
import type { OnboardingChildScreenTime } from '@/lib/onboarding/childrenScreenTime';

type ChildrenScreenTimeStepProps = {
  children: OnboardingChildDraft[];
  entries: OnboardingChildScreenTime[];
  onEntriesChange: (entries: OnboardingChildScreenTime[]) => void;
};

/** Figma 1430108711 — full column scrolls inside funnel scroll region. */
export function ChildrenScreenTimeStep({
  children,
  entries,
  onEntriesChange,
}: ChildrenScreenTimeStepProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const updateEntry = (index: number, hours: number) => {
    const next = [...entries];
    next[index] = { ...next[index]!, hours };
    onEntriesChange(next);
  };

  return (
    <div
      dir="rtl"
      className="flex w-full flex-col items-center pt-0"
      aria-label="שעות מסך יומיות"
    >
      <div className="flex w-v03-content flex-col items-center gap-[19px]">
        <div className="relative flex h-[180px] w-full shrink-0 items-center justify-center overflow-hidden">
          {!imageFailed && (
            <OnboardingLazyImage
              src={ONBOARDING_SCREEN_TIME_HERO_IMAGE}
              alt=""
              className="v03-funnel-enter-0 pointer-events-none h-[176.6px] w-[176.6px] max-w-none rotate-[15deg] object-contain"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className="w-full shrink-0 px-[15px]">
          <h1 className="v03-funnel-enter-1 w-full self-stretch text-center font-simpler text-[30px] font-extrabold leading-[1.1] tracking-[-0.9px] text-white">
            <span className="font-extrabold">כמה שעות ביום </span>
            <span className="font-normal">(בערך) </span>
            <span className="font-extrabold">הילדים במסך לדעתך?</span>
          </h1>
        </div>

        <div className="flex w-full flex-col items-end gap-[35px]">
          {entries.map((entry, index) => (
            <ChildScreenTimeCard
              key={`${entry.name}-${index}`}
              roleLabel={
                getChildScreenTimeRoleLabel(
                  index,
                  children.length,
                  children[index]?.gender ?? 'girl'
                ) || `ילד/ה ${index + 1}`
              }
              name={entry.name}
              hours={entry.hours}
              onHoursChange={(hours) => updateEntry(index, hours)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
