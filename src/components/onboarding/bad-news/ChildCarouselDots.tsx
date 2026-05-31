type ChildCarouselDotsProps = {
  count: number;
  activeIndex: number;
  className?: string;
};

/** Figma pagination — inactive white (visible on light funnel), active green-900. */
export function ChildCarouselDots({
  count,
  activeIndex,
  className = '',
}: ChildCarouselDotsProps) {
  if (count < 1) return null;

  return (
    <div
      className={`inline-flex items-center justify-center gap-[9px] ${className}`}
      role="tablist"
      aria-label="ילדים"
    >
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === activeIndex;
        return (
          <span
            key={i}
            role="tab"
            aria-selected={isActive}
            className={`h-3 w-3 shrink-0 rounded-full ${
              isActive
                ? 'bg-v03-green-900'
                : 'bg-white shadow-[inset_0_0_0_1px_#e5e5e5]'
            }`}
          />
        );
      })}
    </div>
  );
}
