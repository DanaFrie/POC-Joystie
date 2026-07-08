'use client';

type DashboardComboPrizeButtonProps = {
  weeklyBudget: number;
  onClick?: () => void;
};

export function DashboardComboPrizeButton({
  weeklyBudget,
  onClick,
}: DashboardComboPrizeButtonProps) {
  const label =
    weeklyBudget > 0
      ? `פרס שבועי: עד ₪${Math.round(weeklyBudget)}`
      : 'קביעת פרס על קומבו שינויים';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center rounded-[18px] bg-white px-3 font-simpler text-[13px] font-bold leading-[18px] tracking-[-0.2px] text-[#092125] shadow-[1.7px_1.7px_16.7px_rgba(109,109,109,0.15)]"
    >
      {label}
    </button>
  );
}
