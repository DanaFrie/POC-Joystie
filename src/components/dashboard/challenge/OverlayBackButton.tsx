'use client';

type OverlayBackButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Plain white back chevron — onboarding style, top-left inside card. */
export function OverlayBackButton({ onClick, className = '' }: OverlayBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="חזרה"
      className={`absolute left-[13px] top-[13px] z-[20] flex size-6 items-center justify-center border-0 bg-transparent p-0 touch-manipulation [-webkit-tap-highlight-color:transparent] ${className}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M15 6l-6 6 6 6"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
