import Image from 'next/image';
import { LANDING_ASSETS } from '@/constants/landing-marketing';

/**
 * Figma Donex section 3 (15329:16672) — celebration bubble + Dori.
 * Group nudged down; Dori shifted further left.
 */
export function LandingFeatureDonexCelebrate() {
  return (
    <div
      className="pointer-events-none absolute left-[-144px] top-[458px] z-20 hidden h-[249.57px] w-[287.96px] md:block"
      aria-hidden
    >
      <div className="relative h-full w-full">
        {/* Glass card — Figma 15329:16675 */}
        <div
          className="absolute left-[-39.37px] top-0 h-[173.975px] w-[327.331px] overflow-visible rounded-[41.239px] border-[1.289px] border-[rgba(247,248,247,0.2)] bg-[rgba(255,255,255,0.25)] backdrop-blur-[25.774px]"
        >
          <div
            className="absolute left-[69.01px] top-[30.28px] flex w-[220.369px] flex-col items-end gap-[11.598px] text-right text-[#f6f7f6]"
            dir="rtl"
          >
            <p className="font-simpler text-[25.774px] font-black leading-normal tracking-[-0.387px]">
              יואב, אתה אלוףףף!
            </p>
            <p className="w-full font-simpler text-[20.619px] font-normal leading-[1.2] tracking-[-0.309px]">
              אתה ברצף מטורף של שלושה ימים של עמידה ביעדים!
            </p>
          </div>
        </div>
        {/* Dori — further left than Figma −108.83 */}
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
