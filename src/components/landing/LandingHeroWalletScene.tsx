'use client';

import Image from 'next/image';
import HeroWalletCard from '@/components/landing/HeroWalletCard';
import { LandingHeroEllipses } from '@/components/landing/LandingHeroEllipses';
import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

type GroupCompanion = {
  src: string;
  className: string;
  sizeClass: string;
  floatClass: string;
};

/** Companions 2–4 in one tight cluster (companion 1 is inside the wallet). */
const GROUP_COMPANIONS: GroupCompanion[] = [
  {
    src: SIGNUP_COMPANION_IMAGES[3],
    className: 'absolute right-0 top-0 z-[2]',
    sizeClass: 'h-[82px] w-[82px]',
    floatClass: 'duo-float-alt',
  },
  {
    src: SIGNUP_COMPANION_IMAGES[1],
    className: 'absolute bottom-2 left-1/2 z-[3] -translate-x-[58%]',
    sizeClass: 'h-[106px] w-[106px]',
    floatClass: 'duo-float-delayed',
  },
  {
    src: SIGNUP_COMPANION_IMAGES[2],
    className: 'absolute bottom-0 left-0 z-[4]',
    sizeClass: 'h-[142px] w-[142px]',
    floatClass: 'duo-float-slow',
  },
];

export function LandingHeroWalletScene() {
  return (
    <div className="flex h-full max-h-full w-full items-center justify-center overflow-hidden px-1 sm:px-2">
      <div className="relative flex h-full max-h-full w-full items-center justify-center overflow-hidden">
        <LandingHeroEllipses />

        <div className="relative mx-auto inline-block max-h-full origin-center scale-[0.62] min-[400px]:scale-[0.72] sm:scale-[0.82] md:scale-100">
          <div className="relative z-[5] mx-auto w-[268px]">
            <HeroWalletCard />
          </div>

          <div
            className="pointer-events-none absolute z-[6]"
            style={{
              left: '50%',
              top: '70%',
              transform: 'translate(-36%, -4%)',
            }}
            aria-hidden
          >
            <div className="relative h-[194px] w-[228px]">
              {GROUP_COMPANIONS.map(({ src, className, sizeClass, floatClass }) => (
                <div key={src} className={`${className} ${floatClass}`}>
                  <Image
                    src={src}
                    alt=""
                    width={142}
                    height={142}
                    className={`object-contain drop-shadow-v03-display ${sizeClass}`}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
