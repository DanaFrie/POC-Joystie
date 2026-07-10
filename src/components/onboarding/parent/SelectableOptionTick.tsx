import { TermsCheckboxIcon } from '@/components/onboarding/signup/TermsCheckboxIcon';

/** Tick indicator for multi-select cards (goals grid). */
export function SelectableOptionTick({ selected }: { selected: boolean }) {
  return (
    <span className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
      <TermsCheckboxIcon checked={selected} />
    </span>
  );
}
