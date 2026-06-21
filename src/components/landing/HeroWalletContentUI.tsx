'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

const scaleClass =
  'relative z-10 flex h-full w-full min-h-0 min-w-0 origin-center items-center justify-center transition-all duration-700 scale-[0.67] sm:scale-[0.69] md:scale-[0.59] lg:scale-[0.69] xl:scale-[0.77]';

const PHONE_SHADOW = '2.35px 2.35px 11.751px rgba(0, 0, 0, 0.10)';

type Props = { step: number };

/** Landing hero wallet — v0.3 reveal styling, v0.2 demo content. */
export function HeroWalletContentUI({ step }: Props) {
  return (
    <div className={scaleClass} dir="rtl">
      <div className="hero-wallet-float">
        <div
          className="relative rounded-[2.75rem] border border-white/90 bg-[#eaeaea] p-2 md:rounded-[3.25rem] md:p-2.5"
          style={{
            width: 320,
            height: 640,
            boxShadow: PHONE_SHADOW,
          }}
        >
          <div className="absolute left-1/2 top-2 z-30 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-v03-green-900 md:h-6 md:w-32" />

          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.25rem] border border-v03-green-100 bg-v03-white md:rounded-[2.75rem]">
            <div className="relative z-20 flex items-center justify-between bg-v03-green-900 px-6 pb-6 pt-10 shadow-lg md:px-8 md:pb-8 md:pt-12">
              <div className="h-14 w-14 shrink-0 md:h-16 md:w-16" aria-hidden />
              <div className="mr-3 flex flex-1 flex-col items-end md:mr-4">
                <span className="font-simpler text-xl font-black leading-none tracking-tight text-white md:text-2xl">
                  הארנק של מיכל
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute right-0 top-[2.25rem] z-20 flex h-[120px] w-[120px] items-center justify-center md:top-[2.5rem] md:h-[140px] md:w-[140px]">
              <Image
                src={SIGNUP_COMPANION_IMAGES[0]}
                alt=""
                width={140}
                height={140}
                className="h-full w-full object-contain drop-shadow-v03-display"
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
                <div className="relative flex h-16 items-center justify-center overflow-hidden md:h-20">
                  <span
                    className={`absolute font-simpler text-5xl font-black text-v03-text-on-light transition-all duration-700 md:text-6xl ${
                      step >= 2 ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
                    }`}
                  >
                    ₪22.00
                  </span>
                  <span
                    className={`absolute font-simpler text-5xl font-black text-v03-text-on-light transition-all duration-700 md:text-6xl ${
                      step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
                    }`}
                  >
                    ₪20.50
                  </span>
                </div>
                <div className="absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-v03-accent/15 blur-[50px] md:h-40 md:w-40" />
              </div>

              <div className="mb-8 px-5 md:mb-10 md:px-8">
                <div
                  className={`relative flex min-h-[100px] items-center justify-between overflow-hidden rounded-[1.75rem] border-[3px] p-4 transition-all duration-500 md:min-h-[130px] md:rounded-[2rem] md:border-4 md:p-6 ${
                    step === 1
                      ? 'scale-105 border-v03-accent shadow-v03-display ring-4 ring-v03-accent/20 md:ring-8'
                      : 'border-v03-green-100 bg-v03-white shadow-sm'
                  } ${step === 2 ? 'border-v03-accent bg-v03-accent/10' : ''}`}
                >
                  <div
                    className={`absolute inset-0 z-30 flex translate-y-full flex-col items-center justify-center gap-2 bg-v03-accent transition-all duration-500 ${
                      step === 2 ? 'translate-y-0 opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-v03-white p-2 shadow-lg ring-2 ring-v03-green-900/10">
                      <Image
                        src="/brand/icon-joystie.png"
                        alt="Joystie"
                        width={40}
                        height={40}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="font-simpler text-base font-black leading-none text-v03-accent-foreground md:text-xl">
                      הקניה הושלמה!
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center gap-4 md:gap-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center transition-all duration-500 md:h-14 md:w-14 ${
                        step === 1 ? 'rotate-12 scale-110' : ''
                      }`}
                    >
                      <Image
                        src="/icon-screen.png"
                        alt="זמן מסך"
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="font-simpler">
                      <div className="text-base font-black text-v03-text-on-light md:text-xl">שעת מסך</div>
                      <div className="text-xs font-bold tracking-wide text-v03-green-700 md:text-sm">₪1.50</div>
                    </div>
                  </div>

                  <div
                    className={`relative z-10 transition-all duration-500 ${
                      step >= 2 ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                    }`}
                  >
                    <div className="rounded-full border-2 border-v03-white bg-v03-accent p-2 text-v03-accent-foreground shadow-lg md:p-3">
                      <Plus size={18} strokeWidth={4} className="md:h-5 md:w-5" />
                    </div>
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
