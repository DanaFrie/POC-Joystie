'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';

const scaleClass = 'relative origin-center transition-all duration-700 z-10 scale-[0.67] sm:scale-[0.69] md:scale-[0.59] lg:scale-[0.69] xl:scale-[0.77]';
const phoneClass = 'w-[320px] h-[640px] md:w-[360px] md:h-[720px] lg:w-[380px] lg:h-[760px] bg-white rounded-[3rem] md:rounded-[4.5rem] p-2 md:p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative border border-slate-200';

type Props = { step: number };

export function HeroWalletContentUI({ step }: Props) {
  return (
    <div className={`w-full h-full flex items-center justify-center min-w-0 min-h-0 ${scaleClass}`} dir="rtl">
      <div className="hero-wallet-float">
        <div className={phoneClass}>
            <div className="absolute left-0 top-24 md:top-28 w-[2px] md:w-[3px] h-12 md:h-16 bg-slate-200 rounded-l-md" />
            <div className="absolute left-0 top-40 md:top-52 w-[2px] md:w-[3px] h-12 md:h-16 bg-slate-200 rounded-l-md" />
            <div className="absolute right-0 top-32 md:top-40 w-[2px] md:w-[3px] h-16 md:h-24 bg-slate-200 rounded-r-md" />
            <div className="w-full h-full bg-white rounded-[3rem] md:rounded-[3.5rem] overflow-hidden flex flex-col relative border border-slate-100 shadow-inner">
              <div className="bg-[#273143] pt-10 md:pt-12 pb-6 md:pb-8 px-6 md:px-8 flex justify-between items-center shadow-lg relative z-20">
                <div className="w-14 h-14 md:w-16 md:h-16 shrink-0" aria-hidden />
                <div className="flex flex-col items-end flex-1 mr-3 md:mr-4">
                  <span className="text-white text-xl md:text-2xl font-black leading-none tracking-tight" style={{ fontFamily: 'Rubik, sans-serif' }}>
                    הארנק של מיכל
                  </span>
                </div>
              </div>
              <div className="absolute top-[2.25rem] md:top-[2.5rem] right-0 md:right-1 w-[135px] h-[135px] md:w-[162px] md:h-[162px] z-20 flex items-center justify-center pointer-events-none">
                <Image src="/piggy-bank.png" alt="חסן" width={162} height={162} className="w-full h-full object-contain object-center drop-shadow-md" />
              </div>
              <div className="flex-1 flex flex-col pt-14 md:pt-20 relative z-10">
                <div className="w-full text-center px-6 mb-4">
                  <span className="text-[#273143]/70 font-bold uppercase tracking-[0.12em]" style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '12px' }}>
                    תכנון נכון של הזמן הופך אותנו לאלופים
                  </span>
                </div>
                <div className="text-center mt-5 md:mt-6 mb-8 md:mb-12 relative px-6 md:px-10">
                  <div className="text-[#273143]/30 text-[10px] md:text-xs mb-2 font-black uppercase tracking-widest" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    יתרה נוכחית
                  </div>
                  <div className="relative h-16 md:h-20 flex justify-center items-center overflow-hidden">
                    <span
                      className={`text-5xl md:text-6xl font-black text-[#273143] transition-all duration-700 absolute ${step >= 2 ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}
                      style={{ fontFamily: 'Rubik, sans-serif' }}
                    >
                      ₪22.00
                    </span>
                    <span
                      className={`text-5xl md:text-6xl font-black text-[#273143] transition-all duration-700 absolute ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
                      style={{ fontFamily: 'Rubik, sans-serif' }}
                    >
                      ₪20.50
                    </span>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 md:w-40 h-32 md:h-40 bg-[#BBE9FD]/20 rounded-full blur-[50px] -z-10" />
                </div>
                <div className="px-5 md:px-8 mb-8 md:mb-10">
                  <div
                    className={`p-4 md:p-6 rounded-[2.5rem] md:rounded-[3rem] border-[4px] md:border-[5px] transition-all duration-500 flex items-center justify-between relative overflow-hidden min-h-[100px] md:min-h-[130px]
                      ${step === 1 ? 'border-[#E6F19A] scale-105 shadow-2xl ring-4 md:ring-8 ring-[#E6F19A]/20' : 'border-[#F3F4F6] bg-white shadow-sm'}
                      ${step === 2 ? 'border-[#E6F19A] bg-[#E6F19A]/10' : ''}`}
                  >
                    <div
                      className={`absolute inset-0 bg-[#E6F19A] flex flex-col items-center justify-center gap-2 transition-all duration-500 z-30 ${step === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}
                    >
                      <div className="bg-white p-2 rounded-full shadow-lg flex items-center justify-center w-12 h-12 ring-2 ring-[#273143]/10">
                        <Image src="/icon-joystie.png" alt="Joystie" width={40} height={40} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[#273143] font-black text-base md:text-xl leading-none" style={{ fontFamily: 'Rubik, sans-serif' }}>
                        הקניה הושלמה!
                      </span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-5 relative z-10">
                      <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0 transition-all duration-500 ${step === 1 ? 'rotate-12 scale-110' : ''}`}>
                        <Image src="/icon-screen.png" alt="זמן מסך" width={56} height={56} className="w-full h-full object-contain" />
                      </div>
                      <div style={{ fontFamily: 'Fredoka, sans-serif' }}>
                        <div className="text-base md:text-xl font-black text-[#273143]">שעת מסך</div>
                        <div className="text-xs md:text-sm text-[#273143]/50 font-bold tracking-wide">₪1.50</div>
                      </div>
                    </div>
                    <div className={`transition-all duration-500 relative z-10 ${step >= 2 ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                      <div className="bg-[#E6F19A] p-2 md:p-3 rounded-full text-[#273143] shadow-lg border-2 border-white">
                        <Plus size={18} strokeWidth={4} className="md:w-5 md:h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 md:w-40 h-5 md:h-8 bg-[#273143] rounded-b-2xl md:rounded-b-3xl z-30" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none rotate-[25deg] z-40" />
        </div>
      </div>
    </div>
  );
}
