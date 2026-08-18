import Image from 'next/image';
import { LANDING_ASSETS } from '@/constants/landing-marketing';

/**
 * Figma Donex (15329:16567) — glass pocket-money card on presenting section 1.
 * Nudged down from Figma top 426 for clearer phone overlap.
 */
export function LandingFeatureDonex() {
  return (
    <div
      className="pointer-events-none absolute left-[-171px] top-[470px] z-20 hidden h-[216.54px] w-[257.67px] md:block"
      aria-hidden
    >
      <Image
        src={LANDING_ASSETS.donexFull}
        alt=""
        width={258}
        height={217}
        className="h-full w-full max-w-none rounded-[29.11px] object-cover object-center"
        unoptimized
      />
    </div>
  );
}
