'use client';

import type { ReactNode } from 'react';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX,
  ONBOARDING_STACKED_FOOTER_CONTENT_W_PX,
} from '@/constants/onboarding-footer';

type ChildTurquoiseFooterProps = {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
};

/** Turquoise stacked CTA — child post-game light/green screens. */
export function ChildTurquoiseFooter({
  onClick,
  disabled = false,
  children,
}: ChildTurquoiseFooterProps) {
  const topPx = useFunnelProportionalTopPx(ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="absolute z-[30] inline-flex h-[55px] items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-v03-green-900 shadow-v03-button transition hover:brightness-95 disabled:cursor-default disabled:opacity-50"
      style={{
        top: topPx,
        left: `calc(50% - ${ONBOARDING_STACKED_FOOTER_CONTENT_W_PX / 2}px)`,
        width: ONBOARDING_STACKED_FOOTER_CONTENT_W_PX,
      }}
    >
      {children}
    </button>
  );
}
