/**
 * Figma Donex close-up on presenting §1 — weekly pocket-money remaining bar.
 * Outer glass: 258×139 @ left −171 / top 471 (phone column).
 */
export function LandingFeatureDonex() {
  return (
    <div
      className="pointer-events-none absolute left-[-171px] top-[471px] z-20 hidden h-[139px] w-[258px] overflow-hidden rounded-[29.111px] bg-[rgba(255,255,255,0.4)] backdrop-blur-[20.24338722229004px] md:block"
      dir="ltr"
      aria-hidden
    >
      {/* Title row — Figma absolute heading */}
      <div className="absolute left-[-80px] top-4 flex w-[309.84px] items-center justify-between py-[1.85px]">
        <div className="flex flex-1 items-center justify-end gap-[7.4px]">
          <p className="text-center font-rubik text-base font-bold leading-4 text-white">
            דמי הכיס שלי השבוע
          </p>
        </div>
      </div>

      {/* Inner frosted panel — matches provided Figma HTML */}
      <div className="absolute left-[11px] top-[44.7px] inline-flex w-[233px] flex-col items-start gap-[15.81px] rounded-[25.29px] bg-[rgba(255,255,255,0.2)] px-[14.23px] pb-[11.86px] pt-2.5 outline outline-[0.79px] outline-offset-[-0.79px] outline-[rgba(247,248,247,0.2)]">
        <div className="flex w-full flex-col items-end justify-center gap-[11px]">
          <div className="inline-flex w-full items-center justify-start gap-5">
            <div className="inline-flex flex-1 flex-col items-start gap-1.5">
              <div className="inline-flex w-full items-start justify-between">
                <p className="text-center font-rubik text-sm font-medium leading-[17.5px] text-[#00E7A2]">
                  מתוך דמי כיס
                </p>
                <p className="text-center font-rubik text-sm font-medium leading-[17.5px] text-[#00E7A2]">
                  נותרו לי
                </p>
              </div>

              <div className="flex w-full flex-col items-start gap-1.5">
                <div className="relative h-[5px] w-full overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-white" />
                  <div className="absolute left-[14px] top-0 h-[5px] w-[calc(100%-14px)] rounded-full bg-[#00FFB3]" />
                </div>

                <div className="inline-flex w-full items-start justify-between">
                  <p className="text-right font-rubik text-base font-bold leading-[20.48px] text-white">
                    ₪40
                  </p>
                  <p className="text-right font-rubik text-base font-bold leading-[20.48px] text-white">
                    ₪38.4
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
