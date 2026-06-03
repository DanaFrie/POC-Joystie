'use client';

type PickFirstChildCardProps = {
  name: string;
  screenTimeLabel: string;
  selected: boolean;
  onSelect: () => void;
};

/** Child picker row — Figma 12703:42220 (327×card). */
export function PickFirstChildCard({
  name,
  screenTimeLabel,
  selected,
  onSelect,
}: PickFirstChildCardProps) {
  return (
    <button
      type="button"
      dir="ltr"
      onClick={onSelect}
      className={`relative flex w-full max-w-v03-content items-center justify-between overflow-hidden rounded-[24px] bg-white/5 px-[30px] py-[25px] transition ${
        selected
          ? 'outline outline-[1.5px] outline-offset-[-1.5px] outline-white'
          : 'outline outline-[1.5px] outline-offset-[-1.5px] outline-white/25 hover:outline-white/40'
      }`}
    >
      {selected && (
        <div
          className="pointer-events-none absolute h-[99px] w-[98px] rounded-full"
          style={{
            left: 205.75,
            top: 93.5,
            background: 'rgba(0, 255, 179, 0.90)',
            filter: 'blur(61.49px)',
          }}
          aria-hidden
        />
      )}

      <span
        className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center"
        aria-hidden
      >
        <span className="relative h-6 w-6 overflow-hidden rounded-xl bg-[#3A514F]">
          {selected && (
            <span className="absolute left-[7px] top-[7px] h-[10px] w-[10px] rounded-full bg-[#1BECAE]" />
          )}
        </span>
      </span>

      <div className="relative z-[1] flex w-[153.5px] shrink-0 flex-col items-end justify-center gap-1">
        <span className="text-center font-simpler text-[20px] font-bold leading-normal text-white">
          {name}
        </span>
        <span className="text-center font-simpler text-base font-normal leading-[21.6px] text-[#B0C6BF]">
          {screenTimeLabel}
        </span>
      </div>
    </button>
  );
}
