import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

const PHONE_SHADOW = '2.35px 2.35px 11.751px rgba(0, 0, 0, 0.10)';

/** SSR wallet shell (step 0) — paints before client animation hydrates. */
export function LandingHeroWalletStatic() {
  return (
    <div className="relative z-10" dir="rtl" aria-hidden>
      <div className="hero-wallet-float">
        <div
          className="relative rounded-[2.75rem] border border-white/90 bg-[#eaeaea] p-2 md:rounded-[3.25rem] md:p-2.5"
          style={{ width: 320, height: 640, boxShadow: PHONE_SHADOW }}
        >
          <div className="absolute left-1/2 top-2 z-30 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-v03-green-900 md:h-6 md:w-32" />

          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.25rem] border border-v03-green-100 bg-v03-white md:rounded-[2.75rem]">
            <div className="relative z-20 flex items-center justify-between bg-v03-green-900 px-6 pb-6 pt-10 shadow-lg md:px-8 md:pb-8 md:pt-12">
              <div className="h-14 w-14 shrink-0 md:h-16 md:w-16" />
              <div className="mr-3 flex flex-1 flex-col items-end md:mr-4">
                <span className="font-simpler text-xl font-black leading-none tracking-tight text-white md:text-2xl">
                  הארנק של מיכל
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute right-0 top-[2.25rem] z-20 flex h-[120px] w-[120px] items-center justify-center md:top-[2.5rem] md:h-[140px] md:w-[140px]">
              {/* Native img — skips /_next/image on App Hosting for faster LCP */}
              <img
                src={SIGNUP_COMPANION_IMAGES[0]}
                alt=""
                width={140}
                height={140}
                className="h-full w-full object-contain drop-shadow-v03-display"
                decoding="async"
                fetchPriority="high"
                draggable={false}
              />
            </div>

            <div className="relative z-10 flex flex-1 flex-col pt-12 md:pt-16">
              <div className="mb-4 w-full px-6 text-center">
                <span className="font-simpler text-[11px] font-bold uppercase tracking-[0.12em] text-v03-green-700 md:text-xs">
                  תכנון נכון של הזמן הופך אותנו לאלופים
                </span>
              </div>

              <div className="relative mb-8 mt-4 px-6 text-center md:mb-12 md:mt-6 md:px-10">
                <div className="mb-2 font-simpler text-[10px] font-black uppercase tracking-widest text-v03-green-400 md:text-xs">
                  יתרה נוכחית
                </div>
                <div className="relative flex h-16 items-center justify-center md:h-20">
                  <span className="font-simpler text-5xl font-black text-v03-text-on-light md:text-6xl">
                    ₪22.00
                  </span>
                </div>
              </div>

              <div className="mb-8 px-5 md:mb-10 md:px-8">
                <div className="relative flex min-h-[100px] items-center justify-between rounded-[1.75rem] border-[3px] border-v03-green-100 bg-v03-white p-4 shadow-sm md:min-h-[130px] md:rounded-[2rem] md:border-4 md:p-6">
                  <div className="relative z-10 flex items-center gap-4 md:gap-5">
                    <img
                      src="/icon-screen.png"
                      alt=""
                      width={56}
                      height={56}
                      className="h-12 w-12 object-contain md:h-14 md:w-14"
                      decoding="async"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="font-simpler">
                      <div className="text-base font-black text-v03-text-on-light md:text-xl">שעת מסך</div>
                      <div className="text-xs font-bold tracking-wide text-v03-green-700 md:text-sm">₪1.50</div>
                    </div>
                  </div>
                  <div
                    className="rounded-full border-2 border-v03-white p-2 text-white shadow-lg md:p-3"
                    style={{ backgroundColor: 'rgba(140, 0, 255, 1)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
