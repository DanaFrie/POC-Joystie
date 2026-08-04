import Image from 'next/image';
import { LANDING_ASSETS } from '@/constants/landing-marketing';

/**
 * Figma Donex section 2 (15329:16599) — convert bar.
 * Nudged down from Figma top 9 for clearer phone overlap.
 */
export function LandingFeatureDonexConvert() {
  return (
    <div
      className="pointer-events-none absolute left-[246px] top-[52px] z-20 hidden h-[104px] w-[270px] md:block"
      aria-hidden
    >
      <Image
        src={LANDING_ASSETS.donex2Full}
        alt=""
        width={270}
        height={104}
        className="h-full w-full max-w-none rounded-[29.1px] object-cover object-center"
        unoptimized
      />
    </div>
  );
}
