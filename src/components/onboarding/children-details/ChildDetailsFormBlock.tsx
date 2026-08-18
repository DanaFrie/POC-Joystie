'use client';

import { ChildAgeStepper } from '@/components/onboarding/children-details/ChildAgeStepper';
import { ChildGenderPicker } from '@/components/onboarding/children-details/ChildGenderPicker';
import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';

type ChildDetailsFormBlockProps = {
  nameLabel: string;
  child: OnboardingChildDraft;
  onChange: (child: OnboardingChildDraft) => void;
  nameError?: string;
  showDivider?: boolean;
  /** Figma 12703:41658 — gap between name field and age/gender row */
  blockGapPx?: number;
  /** Figma 12703:41660 — gap between age and gender columns */
  rowGapPx?: number;
};

const fieldLabelClass =
  'w-full px-2.5 text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white';

/** Single child — name, age, gender (Figma block). */
export function ChildDetailsFormBlock({
  nameLabel,
  child,
  onChange,
  nameError,
  showDivider = true,
  blockGapPx = 20,
  rowGapPx = 12,
}: ChildDetailsFormBlockProps) {
  return (
    <div
      dir="rtl"
      className="flex w-full flex-col items-stretch"
      style={{ gap: blockGapPx }}
    >
      <div className="flex w-full flex-col items-stretch gap-0.5">
        <span className={fieldLabelClass}>{nameLabel}</span>
        <input
          type="text"
          dir="rtl"
          value={child.name}
          onChange={(e) => onChange({ ...child, name: e.target.value })}
          placeholder="שם פרטי"
          className="flex h-[49px] w-full items-center justify-end rounded-[18px] bg-white/5 px-[15px] py-3.5 text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white outline outline-1 outline-white/20 outline-offset-[-1px] placeholder:text-v03-green-400 focus:outline-white/40"
        />
        {nameError ? (
          <p className="w-full px-2.5 text-right font-simpler text-sm text-red-300">
            {nameError}
          </p>
        ) : null}
      </div>

      {/* LTR row — גיל on screen-left, מין on screen-right (Figma 12703:41660). */}
      <div
        dir="ltr"
        className="flex w-full items-start"
        style={{ gap: rowGapPx }}
      >
        <div className="flex shrink-0 flex-col items-end gap-0.5 self-stretch">
          <span className={fieldLabelClass}>גיל</span>
          <ChildAgeStepper
            value={child.age}
            onChange={(age) => onChange({ ...child, age })}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
          <span className={fieldLabelClass}>מין</span>
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
