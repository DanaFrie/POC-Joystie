'use client';

import type { ReactNode } from 'react';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';

type OnboardingAccentFooterProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  type?: 'button' | 'submit';
};

/** Bottom CTA — turquoise primary (Figma accent), portaled to full viewport width. */
export function OnboardingAccentFooter({
  onClick,
  disabled = false,
  className = '',
  children,
  type = 'button',
}: OnboardingAccentFooterProps) {
  const footer = (
    <div
      className={`absolute inset-x-0 bottom-0 z-[45] flex w-full flex-col items-center justify-end gap-[15px] overflow-hidden bg-white/10 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] backdrop-blur-[5px] ${className}`}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex h-[55px] w-v03-content max-w-[calc(100vw-48px)] items-center justify-center gap-2 overflow-hidden rounded-v03-button bg-v03-accent px-[15px] py-2 font-simpler text-[18px] font-bold leading-normal text-[#031D15] shadow-v03-button transition hover:brightness-105 ${
          disabled ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <span className="text-right">{children}</span>
      </button>
    </div>
  );

  return <FunnelRootPortal>{footer}</FunnelRootPortal>;
}
