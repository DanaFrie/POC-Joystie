'use client';

import Image from 'next/image';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { useLandingLocale } from '@/components/landing/LandingLocaleContext';

/**
 * Figma Donex section 3 — celebration bubble + Dori.
 * HE: hang left of right-phone.
 * EN: parent @ left 287 / top 379.75; Dori absolute right -87.25 / bottom 8.609.
 */
export function LandingFeatureDonexCelebrate() {
  const isEn = useLandingLocale() === 'en';

  if (isEn) {
    return (
      <div
        className="pointer-events-none absolute left-[287px] top-[394.75px] z-20 hidden h-[173.975px] w-[327.331px] md:block"
        aria-hidden
      >
        <div className="relative h-full w-full overflow-visible rounded-[41.239px] border-[1.289px] border-[rgba(247,248,247,0.2)] bg-[rgba(255,255,255,0.25)] backdrop-blur-[25.774px]">
          <div
            className="absolute flex w-[220.369px] flex-col items-start gap-[11.598px] text-left text-[#F6F7F6]"
            style={{ top: 25.4, left: 42.4 }}
            dir="ltr"
          >
            <p
              className="w-full self-stretch font-rubik text-[24px] font-black leading-[115%] tracking-[-0.72px] text-[#F6F7F6]"
              style={{ fontWeight: 860 }}
            >
              Alex, you rock!
            </p>
            <p className="w-[184px] font-rubik text-[18px] font-normal leading-[128%] tracking-[-0.72px] text-[#F6F7F6]">
              You’re on an amazing 3-day streak of hitting your goals!
            </p>
          </div>
        </div>
        {/* Dori — Figma absolute vs parent frame */}
        <div
          className="absolute h-[215.214px] w-[215.214px]"
          style={{ right: -87.25, bottom: 8.609 }}
        >
          <Image
            src={LANDING_ASSETS.doriFlyHappy}
            alt=""
            width={215}
            height={215}
            className="h-full w-full max-w-none -scale-x-100 object-contain"
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute left-[-144px] top-[458px] z-20 hidden h-[249.57px] w-[287.96px] md:block"
      aria-hidden
    >
      <div className="relative h-full w-full">
        <div className="absolute left-[-39.37px] top-0 h-[173.975px] w-[327.331px] overflow-visible rounded-[41.239px] border-[1.289px] border-[rgba(247,248,247,0.2)] bg-[rgba(255,255,255,0.35)] md:bg-[rgba(255,255,255,0.25)] md:backdrop-blur-[25.774px]">
          <div
            className="absolute left-[69.01px] top-[30.28px] flex w-[220.369px] flex-col items-end gap-[11.598px] text-right text-[#f6f7f6]"
            dir="rtl"
          >
            <p className="font-simpler text-[25.774px] font-black leading-normal tracking-[-0.387px]">
              אלון, אתה אלוףףף!
            </p>
            <p className="w-full font-simpler text-[20.619px] font-normal leading-[1.2] tracking-[-0.309px]">
              אתה ברצף מטורף של שלושה ימים של עמידה ביעדים!
            </p>
          </div>
        </div>
        <div className="absolute left-[-148px] top-[-28.34px] h-[215.214px] w-[215.214px]">
          <Image
            src={LANDING_ASSETS.doriFlyHappy}
            alt=""
            width={215}
            height={215}
            className="h-full w-full max-w-none object-contain"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
