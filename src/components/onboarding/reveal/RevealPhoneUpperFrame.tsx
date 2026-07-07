'use client';

import type { ReactNode } from 'react';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import {
  REVEAL_PHONE_BLOCK_HEIGHT_PX,
  REVEAL_PHONE_BLOCK_TOP_PX,
  REVEAL_PHONE_CLUSTER_WIDTH_PX,
} from '@/constants/reveal-phone-layout';

type RevealPhoneUpperFrameProps = {
  children: ReactNode;
};

/** Shared upper phone cluster — good news + real data (same Figma Y). */
export function RevealPhoneUpperFrame({ children }: RevealPhoneUpperFrameProps) {
  const topPx = useFunnelProportionalTopPx(REVEAL_PHONE_BLOCK_TOP_PX);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[1] flex justify-center"
      style={{ top: topPx, height: REVEAL_PHONE_BLOCK_HEIGHT_PX }}
    >
      <div
        className="relative"
        style={{
          width: REVEAL_PHONE_CLUSTER_WIDTH_PX,
          height: REVEAL_PHONE_BLOCK_HEIGHT_PX,
        }}
      >
        {children}
      </div>
    </div>
  );
}
