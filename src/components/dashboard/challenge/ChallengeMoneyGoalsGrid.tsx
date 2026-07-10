'use client';

import { SelectableOptionCard } from '@/components/onboarding/parent/SelectableOptionCard';

type GoalOption = {
  id: string;
  label: string;
};

type ChallengeMoneyGoalsGridProps = {
  options: readonly GoalOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

/** 2-column goal picker — compact selectable cards (~50% standard row height). */
export function ChallengeMoneyGoalsGrid({
  options,
  selectedIds,
  onToggle,
}: ChallengeMoneyGoalsGridProps) {
  return (
    <div
      className="grid w-full grid-cols-2 gap-2"
      role="group"
      aria-label="מטרות לכסף"
    >
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);
        return (
          <div key={option.id} className="h-[52px] [&>button]:h-full">
            <SelectableOptionCard
              selected={selected}
              onSelect={() => onToggle(option.id)}
              borderRadius={16}
              paddingX={10}
              paddingY={8}
              textLayout="flex"
              textAlign="center"
              borderTone="white"
              showSelectedGlow
              compactGlow
              indicator="tick"
            >
              <span className="font-simpler text-[12px] font-bold leading-[14px] text-white">
                {option.label}
              </span>
            </SelectableOptionCard>
          </div>
        );
      })}
    </div>
  );
}
