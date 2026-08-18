'use client';

type ChallengeUploadPickButtonProps = {
  label: string;
  hasFile?: boolean;
  onClick: () => void;
};

/** Parent challenge stepper-style + circle inside dashed frame — file pick trigger. */
export function ChallengeUploadPickButton({
  label,
  hasFile = false,
  onClick,
}: ChallengeUploadPickButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed py-6 transition hover:bg-white/[0.03] ${
        hasFile ? 'border-[#1BECAE]/60 bg-white/[0.02]' : 'border-white/40 bg-white/[0.02]'
      }`}
    >
      <span
        className={`flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 px-[15px] py-[14px] outline outline-1 outline-offset-[-1px] transition ${
          hasFile ? 'outline-[#1BECAE]' : 'outline-[#EFEFEF]'
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 5v14M5 12h14"
            stroke={hasFile ? '#1BECAE' : 'white'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="max-w-full truncate px-4 text-center font-simpler text-[14px] font-semibold text-white/75">
        {label}
      </span>
    </button>
  );
}
