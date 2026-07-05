'use client';

import type { ReactNode } from 'react';

type FunnelStepMainProps = {
  children: ReactNode;
  className?: string;
  /** When true, main region scrolls (template B). */
  scroll?: boolean;
  /** Center content vertically when not scrolling (template A — news-style). */
  center?: boolean;
};

/**
 * Flexible middle band — absorbs auto space (`flex-1`) between header and footer.
 */
export function FunnelStepMain({
  children,
  className = '',
  scroll = false,
  center = false,
}: FunnelStepMainProps) {
  const layoutClass = center && !scroll ? 'justify-center' : 'justify-start';

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col ${layoutClass} ${
        scroll ? 'overflow-y-auto overflow-x-hidden v03-scroll-hidden' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
