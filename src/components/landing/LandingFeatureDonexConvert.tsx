'use client';

import Image from 'next/image';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { useLandingLocale } from '@/components/landing/LandingLocaleContext';

/**
 * Figma Donex section 2 — convert bar.
 * HE: donex2-full.png right of left-phone.
 * EN: donex2-full-en.webp left of right-phone.
 */
export function LandingFeatureDonexConvert() {
  const isEn = useLandingLocale() === 'en';

  return (
    <div
      className={`pointer-events-none absolute z-20 hidden h-[104px] w-[270px] md:block ${
        isEn ? 'left-[-149px] top-[65px]' : 'left-[246px] top-[52px]'
      }`}
      aria-hidden
    >
      <Image
        src={isEn ? LANDING_ASSETS.donex2FullEn : LANDING_ASSETS.donex2Full}
        alt=""
        width={270}
        height={104}
        className="h-full w-full max-w-none rounded-[29.1px] object-cover object-center"
        unoptimized
      />
    </div>
  );
}
