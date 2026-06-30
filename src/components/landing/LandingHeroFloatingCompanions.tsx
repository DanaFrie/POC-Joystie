import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

type FloatingCompanion = {
  src: string;
  wrapperClass: string;
  sizeClass: string;
  floatClass: string;
};

/**
 * Companions 2–4 orbit the phone (companion 1 lives on the wallet header).
 * Bear anchors bottom-left, chick bottom-right, seal peeks top-right.
 */
const FLOATING_COMPANIONS: FloatingCompanion[] = [
  {
    src: SIGNUP_COMPANION_IMAGES[2],
    wrapperClass: 'absolute bottom-[72px] left-[-48px] z-[30] md:bottom-[88px] md:left-[-56px]',
    sizeClass: 'h-[118px] w-[118px] sm:h-[132px] sm:w-[132px] md:h-[152px] md:w-[152px]',
    floatClass: 'landing-hero-companion-float-slow',
  },
  {
    src: SIGNUP_COMPANION_IMAGES[1],
    wrapperClass: 'absolute bottom-[28px] right-[-44px] z-[30] md:bottom-[36px] md:right-[-52px]',
    sizeClass: 'h-[100px] w-[100px] sm:h-[112px] sm:w-[112px] md:h-[128px] md:w-[128px]',
    floatClass: 'landing-hero-companion-float-delayed',
  },
  {
    src: SIGNUP_COMPANION_IMAGES[3],
    wrapperClass: 'absolute right-[-36px] top-[108px] z-[30] md:right-[-44px] md:top-[120px]',
    sizeClass: 'h-[84px] w-[84px] sm:h-[96px] sm:w-[96px] md:h-[108px] md:w-[108px]',
    floatClass: 'landing-hero-companion-float-alt',
  },
];

export function LandingHeroFloatingCompanions() {
  return (
    <>
      {FLOATING_COMPANIONS.map(({ src, wrapperClass, sizeClass, floatClass }) => (
        <div key={src} className={wrapperClass}>
          <div className={floatClass}>
            <img
              src={src}
              alt=""
              width={152}
              height={152}
              className={`object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${sizeClass}`}
              decoding="async"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>
      ))}
    </>
  );
}
