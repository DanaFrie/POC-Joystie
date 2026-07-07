'use client';

import { PickFirstChildCard } from '@/components/onboarding/pick-child/PickFirstChildCard';
import {
  PICK_FIRST_CHILD_CARDS_GAP_PX,
  PICK_FIRST_CHILD_FOOTNOTE_MAX_W_PX,
  PICK_FIRST_CHILD_FRAME_W_PX,
  PICK_FIRST_CHILD_HEADER_GAP_PX,
  PICK_FIRST_CHILD_HEADER_PAD_X_PX,
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

/** Figma 13680:1526 — עם מי מתחילים? (two 327px in-flow frames) */
export function PickFirstChildStep({
  options,
  selectedIndex,
  onSelectIndex,
}: PickFirstChildStepProps) {
  return (
    <div
      dir="rtl"
      className="mx-auto flex w-full flex-col items-center gap-[23px]"
      aria-label="בחירת ילד ראשון"
    >
      <header
        className="v03-funnel-enter-0 flex flex-col items-end justify-center"
        style={{
          width: PICK_FIRST_CHILD_FRAME_W_PX,
          paddingLeft: PICK_FIRST_CHILD_HEADER_PAD_X_PX,
          paddingRight: PICK_FIRST_CHILD_HEADER_PAD_X_PX,
          gap: PICK_FIRST_CHILD_HEADER_GAP_PX,
        }}
      >
        <h1 className="w-full text-right font-simpler text-[30px] font-black leading-[34.5px] text-white">
          עם מי מתחילים?
        </h1>
        <p className="w-full text-right font-simpler text-[20px] font-normal text-[#CADCD6]">
          מזמינים אותך לבחור את הילד הראשון שיצא איתנו יחד למסע
        </p>
      </header>

      <div
        className="v03-funnel-enter-1 flex flex-col items-center"
        style={{
          width: PICK_FIRST_CHILD_FRAME_W_PX,
          gap: PICK_FIRST_CHILD_SECTION_GAP_PX,
        }}
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
