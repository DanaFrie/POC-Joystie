'use client';

import type { ReactNode, Ref } from 'react';

type FunnelStepMainProps = {
  children: ReactNode;
  className?: string;
  /** When true, main region scrolls (template B). */
  scroll?: boolean;
  /** Center content vertically when not scrolling (template A — news-style). */
  center?: boolean;
  scrollRef?: Ref<HTMLDivElement>;
  onScroll?: () => void;
  /** Optional few px below scroll content — use `getFunnelScrollContentEndPadPx()`, not shell height. */
  footerOverlayReservePx?: number;
};

/**
 * Flexible middle band — absorbs auto space (`flex-1`) between header and footer.
 */
export function FunnelStepMain({
  children,
  className = '',
  scroll = false,
  center = false,
  scrollRef,
  onScroll,
  footerOverlayReservePx,
}: FunnelStepMainProps) {
  const layoutClass = center && !scroll ? 'justify-center' : 'justify-start';

  return (
    <div
      ref={scroll ? scrollRef : undefined}
      onScroll={scroll ? onScroll : undefined}
      className={`flex min-h-0 w-full flex-1 flex-col ${layoutClass} ${
        scroll ? 'overflow-y-auto overflow-x-hidden v03-scroll-hidden' : ''
      } ${className}`}
      style={
        footerOverlayReservePx
          ? { paddingBottom: footerOverlayReservePx }
          : undefined
      }
    >
      {children}
    </div>
  );
}
