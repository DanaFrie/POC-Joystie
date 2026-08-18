'use client';

type OverlayCloseButtonProps = {
  onClick: () => void;
  className?: string;
};

/** Subscription gate close — frosted X inside card frame (top-left inset). */
export function OverlayCloseButton({ onClick, className = '' }: OverlayCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="סגירה"
      className={`absolute left-[13px] top-[13px] z-[20] flex items-center rounded-full bg-white/30 p-[6px] backdrop-blur-[10px] ${className}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 7l10 10M17 7L7 17"
          stroke="#092125"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
