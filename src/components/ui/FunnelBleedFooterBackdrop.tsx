'use client';

import { useFunnelBleedBarStyle } from '@/components/ui/FunnelViewportContext';

type FunnelBleedFooterBackdropProps = {
  shellTopPx: number;
  className?: string;
};

/** Frosted bar spanning full viewport width + bottom letterbox (in-canvas coords). */
export function FunnelBleedFooterBackdrop({
  shellTopPx,
  className = '',
}: FunnelBleedFooterBackdropProps) {
  const style = useFunnelBleedBarStyle(shellTopPx);

  return (
    <div
      className={`pointer-events-none absolute z-[44] ${className}`}
      style={{
        ...style,
        backgroundColor: 'rgba(255, 255, 255, 0.10)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
      }}
      aria-hidden
    />
  );
}
