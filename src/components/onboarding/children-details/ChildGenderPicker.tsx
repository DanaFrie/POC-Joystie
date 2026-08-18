'use client';

import type { ChildGender } from '@/lib/onboarding/childrenDetails';

type ChildGenderPickerProps = {
  value: ChildGender;
  onChange: (gender: ChildGender) => void;
};

/** בן / בת segmented control — Figma pill 92.58×33. */
export function ChildGenderPicker({ value, onChange }: ChildGenderPickerProps) {
  const options: { id: ChildGender; label: string }[] = [
    { id: 'boy', label: 'בן' },
    { id: 'girl', label: 'בת' },
  ];

  return (
    <div
      dir="ltr"
      className="inline-flex flex-row items-center gap-1.5 rounded-[68px] bg-white/5 p-1.5 outline outline-1 outline-white/20 outline-offset-[-1px]"
      role="radiogroup"
      aria-label="מין"
    >
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={`flex h-[33px] w-[92.58px] items-center justify-center rounded-[31px] px-3 text-center font-simpler text-[14px] leading-normal tracking-[-0.28px] transition ${
              selected
                ? 'bg-v03-green-100 font-bold text-v03-green-900'
                : 'font-normal text-[#88A49D]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
