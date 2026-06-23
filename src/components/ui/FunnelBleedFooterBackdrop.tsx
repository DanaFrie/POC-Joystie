'use client';

import { useFunnelBleedBarStyle } from '@/components/ui/FunnelViewportContext';

type FunnelBleedFooterBackdropProps = {
  shellTopPx: number;
  className?: string;
};

/** Frosted bar spanning full viewport width + bottom letterbox (in-canvas coords). */
export function FunnelBleedFooterBackdrop({
  shellTopPx,
  className = 'bg-white/10 backdrop-blur-[5px]',
}: FunnelBleedFooterBackdropProps) {
  const style = useFunnelBleedBarStyle(shellTopPx);

  return (
    <div
      className={`pointer-events-none absolute z-[44] ${className}`}
      style={style}
      aria-hidden
    />
  );
}
