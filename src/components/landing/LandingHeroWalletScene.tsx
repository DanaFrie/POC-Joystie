import Image from 'next/image';
import { LandingHeroEllipses } from '@/components/landing/LandingHeroEllipses';
import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

type GroupCompanion = {
  src: string;
  className: string;
  sizeClass: string;
  floatClass: string;
  priority?: boolean;
};

/** Companions 2–4 below the wallet title header (companion 1 sits on the header). */
const GROUP_COMPANIONS: GroupCompanion[] = [
  {
    src: SIGNUP_COMPANION_IMAGES[3],
    className: 'absolute right-0 top-0 z-[2]',
    sizeClass: 'h-[82px] w-[82px] md:h-[96px] md:w-[96px]',
    floatClass: 'duo-float-alt',
  },
  {
    src: SIGNUP_COMPANION_IMAGES[1],
    className: 'absolute bottom-2 left-1/2 z-[3] -translate-x-[58%]',
    sizeClass: 'h-[106px] w-[106px] md:h-[120px] md:w-[120px]',
    floatClass: 'duo-float-delayed',
  },
  {
    src: SIGNUP_COMPANION_IMAGES[2],
    className: 'absolute bottom-0 left-0 z-[4]',
    sizeClass: 'h-[142px] w-[142px] md:h-[156px] md:w-[156px]',
    floatClass: 'duo-float-slow',
  },
];

export function LandingHeroWalletScene() {
  return (
    <div className="flex h-full max-h-full w-full items-center justify-center overflow-hidden px-1 sm:px-2">
      <div className="relative flex h-full max-h-full w-full max-w-[340px] items-center justify-center overflow-visible md:max-w-[400px]">
        <LandingHeroEllipses />

        <div className="relative z-10 mx-auto w-[min(100%,288px)] origin-center scale-[0.78] min-[400px]:scale-[0.88] sm:scale-95 md:w-[320px] md:scale-100">
          <div className="relative rounded-t-[1.75rem] bg-v03-green-900 px-5 pb-5 pt-9 shadow-lg md:rounded-t-[2rem] md:px-6 md:pb-6 md:pt-11">
            <div className="pr-[88px] text-right md:pr-[100px]">
              <span className="font-simpler text-xl font-black leading-none tracking-tight text-white md:text-2xl">
                הארנק של מיכל
              </span>
            </div>

            <div className="pointer-events-none absolute -right-1 top-5 z-20 flex h-[108px] w-[108px] items-center justify-center md:top-6 md:h-[124px] md:w-[124px]">
              <Image
                src={SIGNUP_COMPANION_IMAGES[0]}
                alt=""
                width={124}
                height={124}
                className="h-full w-full object-contain drop-shadow-v03-display"
                draggable={false}
                priority
              />
            </div>
          </div>

          <div
            className="pointer-events-none relative z-[5] mx-auto -mt-2 h-[194px] w-[228px] md:-mt-3 md:h-[210px] md:w-[248px]"
            aria-hidden
          >
            {GROUP_COMPANIONS.map(({ src, className, sizeClass, floatClass }) => (
              <div key={src} className={`${className} ${floatClass}`}>
                <Image
                  src={src}
                  alt=""
                  width={156}
                  height={156}
                  className={`object-contain drop-shadow-v03-display ${sizeClass}`}
                  draggable={false}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
