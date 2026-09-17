'use client';

import { useLandingLocale } from '@/components/landing/LandingLocaleContext';

/**
 * Figma Donex close-up on presenting §1 — weekly pocket-money remaining bar.
 * HE: hangs left of phone (RTL). EN: hangs right of phone (Figma x≈234).
 */
export function LandingFeatureDonex() {
  const isEn = useLandingLocale() === 'en';

  return (
    <div
      className={`pointer-events-none absolute z-20 hidden h-[139px] w-[258px] overflow-hidden rounded-[29.111px] bg-[rgba(255,255,255,0.4)] backdrop-blur-[20.24338722229004px] md:block ${
        isEn ? 'left-[234px] top-[456px]' : 'left-[-171px] top-[471px]'
      }`}
      dir="ltr"
      aria-hidden
    >
      <div
        className={`absolute top-4 flex w-[309.84px] items-center justify-between py-[1.85px] ${
          isEn ? 'left-0' : 'left-[-80px]'
        }`}
      >
        <div className={`flex flex-1 items-center gap-[7.4px] ${isEn ? 'justify-start ps-4' : 'justify-end'}`}>
          <p className="text-center font-rubik text-base font-bold leading-4 text-white">
            {isEn ? 'My wallet this week' : 'דמי הכיס שלי השבוע'}
          </p>
        </div>
      </div>

      <div className="absolute left-[11px] top-[44.7px] inline-flex w-[233px] flex-col items-start gap-[15.81px] rounded-[25.29px] bg-[rgba(255,255,255,0.2)] px-[14.23px] pb-[11.86px] pt-2.5 outline outline-[0.79px] outline-offset-[-0.79px] outline-[rgba(247,248,247,0.2)]">
        <div className="flex w-full flex-col items-end justify-center gap-[11px]">
          <div className="inline-flex w-full items-center justify-start gap-5">
            <div className="inline-flex flex-1 flex-col items-start gap-1.5">
              <div
                className={`inline-flex w-full items-start justify-between ${isEn ? '' : ''}`}
                dir={isEn ? 'ltr' : 'rtl'}
              >
                <p className="text-center font-rubik text-sm font-medium leading-[17.5px] text-[#00E7A2]">
                  {isEn ? 'Money left' : 'נותרו לי'}
                </p>
                <p className="text-center font-rubik text-sm font-medium leading-[17.5px] text-[#00E7A2]">
                  {isEn ? 'Out of allowance' : 'מתוך דמי כיס'}
                </p>
              </div>

              <div className="flex w-full flex-col items-start gap-1.5">
                <div className="relative h-[5px] w-full overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-white" />
                  <div
                    className={`absolute top-0 h-[5px] rounded-full bg-[#00FFB3] ${
                      isEn ? 'left-0 w-[calc(100%-14px)]' : 'left-[14px] w-[calc(100%-14px)]'
                    }`}
                  />
                </div>

                <div
                  className="inline-flex w-full items-start justify-between"
                  dir={isEn ? 'ltr' : 'rtl'}
                >
                  <p className="font-rubik text-base font-bold leading-[20.48px] text-white">
                    {isEn ? '$18.4' : '₪38.4'}
                  </p>
                  <p className="font-rubik text-base font-bold leading-[20.48px] text-white">
                    {isEn ? '$20' : '₪40'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
