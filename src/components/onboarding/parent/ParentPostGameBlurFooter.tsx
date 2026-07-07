'use client';

import type { ReactNode } from 'react';
import {
  useFunnelBleedBarStyle,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import {
  FUNNEL_FOOTER_HOME_INDICATOR_SPACER_PX,
  FUNNEL_FOOTER_SHELL_PAD_TOP_PX,
  getFunnelStackedFooterShellHeightPx,
} from '@/constants/funnel-vertical-layout';

const FOOTER_GUTTER_BREAKOUT_STYLE = {
  left: 'calc(-1 * var(--v03-gutter))',
  width: 'calc(100% + 2 * var(--v03-gutter))',
} as const;

/** Figma stacked footer — white 10% frost over scrolling post-game content. */
const WHITE_FROST_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.10)',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
} as const;

type ParentPostGameBlurFooterProps = {
  children: ReactNode;
};

/** White frosted footer — canvas-anchored overlay; content scrolls underneath. */
export function ParentPostGameBlurFooter({ children }: ParentPostGameBlurFooterProps) {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const shellHeightPx = getFunnelStackedFooterShellHeightPx();
  const shellTopPx = usableCanvasHeightPx - shellHeightPx;
  const blurBackdropStyle = useFunnelBleedBarStyle(shellTopPx);

  return (
    <>
      <div
        className="pointer-events-none absolute z-[44]"
        style={{ ...blurBackdropStyle, ...WHITE_FROST_STYLE }}
        aria-hidden
      />

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
