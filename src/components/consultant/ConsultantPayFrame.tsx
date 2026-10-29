'use client';

import type { ReactNode } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';

/** Child-details field label — Figma parent onboarding. */
export const CONSULTANT_PAY_LABEL_CLASS =
  'w-full px-2.5 text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white';

/** Child-details text field. */
export const CONSULTANT_PAY_INPUT_CLASS =
  'flex h-[49px] w-full items-center rounded-[18px] bg-white/5 px-[15px] py-3.5 font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white outline outline-1 outline-white/20 outline-offset-[-1px] placeholder:text-v03-green-400 focus:outline-white/40 disabled:opacity-60';

/** Same accent CTA as onboarding «המשך». */
export const CONSULTANT_PAY_CTA_CLASS =
  'inline-flex h-[55px] w-full items-center justify-center rounded-v03-button bg-v03-accent px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-v03-green-900 shadow-v03-button transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50';

export const CONSULTANT_PAY_TITLE_CLASS =
  'w-full font-simpler text-[30px] font-extrabold leading-[1.1] tracking-[-0.9px] text-white';

/**
 * Green-900 canvas + turquoise ellipse. Full viewport on desktop and mobile
 * (not the funnel mobile-only gate).
 */
export function ConsultantPayFrame({
  children,
  contentClassName = 'max-w-[420px] px-6',
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-v03-green-900 font-simpler text-white"
      dir="rtl"
      lang="he"
      style={{
        paddingTop: 'max(32px, env(safe-area-inset-top))',
        paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
      }}
    >
      <OnboardingMintGlow fit="viewport" className="z-0" />
      <div className={`relative z-10 flex w-full flex-col items-stretch ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
