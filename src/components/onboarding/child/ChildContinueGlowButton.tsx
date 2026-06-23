'use client';

/** Mint glow continue affordance — Figma screens 6 & 8 (54px ring + label). */
export function ChildContinueGlowButton({
  label = 'לוחצים כאן כדי להמשיך',
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[217px] flex-col items-center gap-[17px] border-0 bg-transparent p-0"
      aria-label={label}
    >
      <span
        className="relative block size-[54px] shrink-0 rounded-full"
        aria-hidden
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: 'var(--v03-ellipse-385)',
            filter: 'blur(18px)',
            opacity: 0.85,
          }}
        />
        <span
          className="absolute inset-[6px] rounded-full border-2 border-white/30"
          style={{
            background:
              'radial-gradient(circle, rgba(27,236,174,0.9) 0%, rgba(27,236,174,0.35) 70%, transparent 100%)',
          }}
        />
      </span>
      <span className="w-full text-right font-simpler text-[24px] font-normal leading-[30px] tracking-[-0.36px] text-v03-green-100">
        {label}
      </span>
    </button>
  );
}
