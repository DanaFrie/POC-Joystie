/** Radio indicator — matches pick-first-child card (Figma 12703:42220). */
export function SelectableOptionRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center"
      aria-hidden
    >
      <span className="relative h-6 w-6 overflow-hidden rounded-xl bg-[#3A514F]">
        {selected ? (
          <span className="absolute left-[7px] top-[7px] h-[10px] w-[10px] rounded-full bg-[#1BECAE]" />
        ) : null}
      </span>
    </span>
  );
}
