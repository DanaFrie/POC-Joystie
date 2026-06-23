import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

/** Scale tuned so wallet + companions fit inside a single viewport column. */
export const HERO_SCENE_SCALE =
  'origin-center scale-[0.36] min-[380px]:scale-[0.40] sm:scale-[0.44] md:scale-[0.46] lg:scale-[0.50] xl:scale-[0.54]';

type FloatingCompanion = {
  src: string;
  wrapperClass: string;
  sizeClass: string;
  floatClass: string;
};

/** Companions 2–4 — float around the wallet (companion 1 is on the wallet header). */
const FLOATING_COMPANIONS: FloatingCompanion[] = [
  {
    src: SIGNUP_COMPANION_IMAGES[3],
    wrapperClass: 'absolute right-[-8px] top-[-4px]',
    sizeClass: 'h-[72px] w-[72px] md:h-[82px] md:w-[82px]',
    floatClass: 'duo-float-alt',
  },
  {
    src: SIGNUP_COMPANION_IMAGES[1],
    wrapperClass: 'absolute bottom-0 left-1/2 -translate-x-[58%]',
    sizeClass: 'h-[92px] w-[92px] md:h-[106px] md:w-[106px]',
    floatClass: 'duo-float-delayed',
  },
  {
    src: SIGNUP_COMPANION_IMAGES[2],
    wrapperClass: 'absolute bottom-[-8px] left-[-12px]',
    sizeClass: 'h-[120px] w-[120px] md:h-[142px] md:w-[142px]',
    floatClass: 'duo-float-slow',
  },
];

export function LandingHeroFloatingCompanions() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[-20px] z-[30] mx-auto h-[180px] w-[240px] md:bottom-[-24px] md:h-[200px] md:w-[260px]"
      aria-hidden
    >
      {FLOATING_COMPANIONS.map(({ src, wrapperClass, sizeClass, floatClass }) => (
        <div key={src} className={wrapperClass}>
          <div className={floatClass}>
            <img
              src={src}
              alt=""
              width={142}
              height={142}
              className={`object-contain drop-shadow-v03-display ${sizeClass}`}
              decoding="async"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
