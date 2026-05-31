'use client';

import { ChildAgeStepper } from '@/components/onboarding/children-details/ChildAgeStepper';
import { ChildGenderPicker } from '@/components/onboarding/children-details/ChildGenderPicker';
import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';

type ChildDetailsFormBlockProps = {
  nameLabel: string;
  child: OnboardingChildDraft;
  onChange: (child: OnboardingChildDraft) => void;
  showDivider?: boolean;
};

/** Single child — name, age, gender (Figma block). */
export function ChildDetailsFormBlock({
  nameLabel,
  child,
  onChange,
  showDivider = true,
}: ChildDetailsFormBlockProps) {
  return (
    <div dir="rtl" className="flex w-full flex-col items-stretch gap-5">
      <div className="flex w-full flex-col items-end gap-0.5">
        <div className="w-full px-2.5 text-right">
          <span className="font-simpler text-base font-normal leading-[21.6px] text-white">
            {nameLabel}
          </span>
        </div>
        <input
          type="text"
          dir="rtl"
          value={child.name}
          onChange={(e) => onChange({ ...child, name: e.target.value })}
          placeholder="שם פרטי"
          className="flex h-[49px] w-full items-center justify-end rounded-[18px] bg-white/5 px-[15px] py-3.5 text-right font-simpler text-base font-normal leading-[21.6px] text-white outline outline-1 outline-white/20 outline-offset-[-1px] placeholder:text-v03-green-400 focus:outline-white/40"
        />
      </div>

      {/* LTR row: גיל left, מין right (screen coords) */}
      <div
        dir="ltr"
        className="flex w-full max-w-full flex-row items-start justify-between gap-3 overflow-hidden"
      >
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <div className="w-full px-2.5 text-right">
            <span className="font-simpler text-base font-normal leading-[21.6px] text-white">
              גיל
            </span>
          </div>
          <ChildAgeStepper
            value={child.age}
            onChange={(age) => onChange({ ...child, age })}
          />
        </div>

        <div className="flex min-w-0 flex-col items-end gap-0.5">
          <div className="px-2.5 text-right">
            <span className="font-simpler text-base font-normal leading-[21.6px] text-white">
              מין
            </span>
          </div>
          <ChildGenderPicker
            value={child.gender}
            onChange={(gender) => onChange({ ...child, gender })}
          />
        </div>
      </div>

      {showDivider && (
        <div
          className="h-0 w-full outline outline-[0.75px] outline-offset-[-0.38px] outline-v03-green-700"
          aria-hidden
        />
      )}
    </div>
  );
}
