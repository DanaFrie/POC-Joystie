import { SIGNUP_JOURNEY_STAGE_COUNT } from '@/constants/signup-journey';

type SignupStageDotsProps = {
  activeStage: number;
  onSelect?: (stage: number) => void;
};

/** Figma — 3 dots for שלב 1–3 progress (not companions). */
export function SignupStageDots({ activeStage, onSelect }: SignupStageDotsProps) {
  return (
    <div
      dir="rtl"
      className="inline-flex items-center justify-center gap-[9px]"
      role="tablist"
      aria-label="התקדמות שלבים"
    >
      {Array.from({ length: SIGNUP_JOURNEY_STAGE_COUNT }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === activeStage}
          aria-label={`שלב ${index + 1}`}
          onClick={() => onSelect?.(index)}
          disabled={!onSelect}
          className={`h-3 w-3 shrink-0 rounded-full transition ${
            index === activeStage ? 'bg-white' : 'bg-[#4D6260]'
          } ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
        />
      ))}
    </div>
  );
}
