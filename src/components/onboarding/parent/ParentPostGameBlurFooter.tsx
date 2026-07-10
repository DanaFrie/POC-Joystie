'use client';

import type { ReactNode } from 'react';
import { FunnelBleedFooterBackdrop } from '@/components/ui/FunnelBleedFooterBackdrop';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX,
  FUNNEL_FOOTER_SHELL_PAD_TOP_PX,
  getFunnelStackedFooterShellHeightPx,
} from '@/constants/funnel-vertical-layout';

const FOOTER_GUTTER_BREAKOUT_STYLE = {
  left: 'calc(-1 * var(--v03-gutter))',
  width: 'calc(100% + 2 * var(--v03-gutter))',
} as const;

type ParentPostGameBlurFooterProps = {
  children: ReactNode;
};

/** White frosted footer — canvas-anchored overlay; blur bleeds into bottom safe area. */
export function ParentPostGameBlurFooter({ children }: ParentPostGameBlurFooterProps) {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const shellHeightPx = getFunnelStackedFooterShellHeightPx();
  const shellTopPx = usableCanvasHeightPx - shellHeightPx;

  return (
    <>
      <FunnelBleedFooterBackdrop shellTopPx={shellTopPx} />

      <div
        className="absolute z-[45] flex w-full flex-col items-center justify-end gap-[15px]"
        style={{
          top: shellTopPx,
          height: shellHeightPx,
          paddingTop: FUNNEL_FOOTER_SHELL_PAD_TOP_PX,
          ...FOOTER_GUTTER_BREAKOUT_STYLE,
        }}
      >
        <div className="relative w-full max-w-[375px] px-v03-gutter">{children}</div>
        <div
          className="w-full shrink-0"
          style={{
            height: `max(${FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX}px, env(safe-area-inset-bottom, 0px))`,
          }}
          aria-hidden
        />
      </div>
    </>
  );
}

/** Reserve scroll space so last card clears the overlay footer. */
export function parentPostGameBlurFooterScrollPadPx(): number {
  return getFunnelStackedFooterShellHeightPx();
}
