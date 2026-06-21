'use client';

import { PickFirstChildCard } from '@/components/onboarding/pick-child/PickFirstChildCard';
import {
  PICK_FIRST_CHILD_CARDS_GAP_PX,
  PICK_FIRST_CHILD_FOOTNOTE_MAX_W_PX,
  PICK_FIRST_CHILD_HEADER_GAP_PX,
  PICK_FIRST_CHILD_SECTION_GAP_PX,
} from '@/constants/pick-first-child-layout';
import { formatDailyScreenTimeSubtitle } from '@/lib/onboarding/childrenScreenTime';
import type { PickFirstChildOption } from '@/lib/onboarding/pickFirstChild';

export type { PickFirstChildOption };

type PickFirstChildStepProps = {
  options: PickFirstChildOption[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

/** Figma 12703:42220 — עם מי מתחילים? (flow layout for scroll region) */
export function PickFirstChildStep({
  options,
  selectedIndex,
  onSelectIndex,
}: PickFirstChildStepProps) {
  return (
    <div
      dir="rtl"
      className="flex w-full flex-col items-end px-v03-gutter pb-6 pt-[15px]"
      aria-label="בחירת ילד ראשון"
    >
      <header
        className="v03-funnel-enter-0 flex w-v03-content flex-col items-end justify-center px-[15px]"
        style={{ gap: PICK_FIRST_CHILD_HEADER_GAP_PX }}
      >
        <h1 className="w-full text-right font-simpler text-[30px] font-black leading-[34.5px] text-white">
          עם מי מתחילים?
        </h1>
        <p className="w-full text-right font-simpler text-[20px] font-normal text-[#CADCD6]">
          מזמינים אותך לבחור את הילד הראשון שיצא איתנו יחד למסע
        </p>
      </header>

      <div
        className="v03-funnel-enter-1 mt-[23px] flex w-v03-content flex-col items-center"
        style={{ gap: PICK_FIRST_CHILD_SECTION_GAP_PX }}
      >
        <div
          className="flex w-full flex-col items-stretch"
          style={{ gap: PICK_FIRST_CHILD_CARDS_GAP_PX }}
        >
          {options.map((option, index) => (
            <PickFirstChildCard
              key={`${option.name}-${index}`}
              name={option.name}
              screenTimeLabel={formatDailyScreenTimeSubtitle(option.hours)}
              selected={selectedIndex === index}
              onSelect={() => onSelectIndex(index)}
            />
          ))}
        </div>

        <p
          className="v03-funnel-enter-2 text-center font-simpler text-lg font-normal leading-[22.5px] text-[#B0C6BF]"
          style={{ maxWidth: PICK_FIRST_CHILD_FOOTNOTE_MAX_W_PX }}
        >
          * כשתרגישו מוכנים, תוכלו לצרף בהדרגה גם את שאר הילדים.
        </p>
      </div>
    </div>
  );
}
