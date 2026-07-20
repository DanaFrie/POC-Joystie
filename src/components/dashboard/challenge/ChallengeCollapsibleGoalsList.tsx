'use client';

import { ChallengeMoneyGoalsGrid } from '@/components/dashboard/challenge/ChallengeMoneyGoalsGrid';

type GoalOption = {
  id: string;
  label: string;
};

type ChallengeCollapsibleGoalsListProps = {
  options: readonly GoalOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

function DoubleChevron({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M6 7.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Collapsed: peek of list + bottom blur + open chevron; expanded: full grid + close chevron. */
export function ChallengeCollapsibleGoalsList({
  options,
  selectedIds,
  onToggle,
  expanded,
  onExpandedChange,
}: ChallengeCollapsibleGoalsListProps) {
  if (!expanded) {
    return (
      <div className="relative w-full overflow-hidden rounded-[16px]">
        <div className="max-h-[148px] w-full overflow-hidden" aria-hidden={false}>
          <ChallengeMoneyGoalsGrid
            options={options}
            selectedIds={selectedIds}
            onToggle={onToggle}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72px] bg-gradient-to-t from-[#061C1E] via-[#061C1E]/85 to-transparent backdrop-blur-[2px]" />
        <button
          type="button"
          onClick={() => onExpandedChange(true)}
          className="absolute inset-x-0 bottom-0 z-[1] flex h-[56px] items-end justify-center pb-1 text-white/85 transition hover:text-white"
          aria-label="פתיחת רשימת המטרות"
        >
          <DoubleChevron />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative w-full overflow-x-hidden">
        <ChallengeMoneyGoalsGrid
          options={options}
          selectedIds={selectedIds}
          onToggle={onToggle}
        />
      </div>

      <button
        type="button"
        onClick={() => onExpandedChange(false)}
        className="mx-auto inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-white/85 transition hover:bg-white/10 hover:text-white"
        aria-label="סגירת הרשימה"
      >
        <DoubleChevron className="rotate-180" />
      </button>
    </div>
  );
}
