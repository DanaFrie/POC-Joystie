'use client';

import { useState } from 'react';
import { LANDING_FAQ } from '@/constants/landing-marketing';
import { LandingReveal } from '@/components/landing/LandingReveal';

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/** Figma FAQ toggle — gray 35.5² box + chevron (closed ↓, open ↑) */
function FaqArrow({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform duration-300 ease-in-out ${
        open ? 'rotate-0' : 'rotate-180'
      }`}
      style={{
        width: '35.5px',
        height: '35.5px',
        flexShrink: 0,
        transitionTimingFunction: EASE,
      }}
    >
      <rect
        width="35.5"
        height="35.5"
        rx="13"
        transform="matrix(-4.37114e-08 -1 -1 4.37114e-08 35.5 35.5)"
        fill="#E8E8E8"
      />
      <path
        d="M11.75 21.5L17.75 15.5L23.75 21.5"
        stroke="#05161A"
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MarketingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="questions" className="landing-section landing-gutter py-12 md:py-24">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-5">
        <LandingReveal>
          <h2 className="bg-gradient-to-b from-[#efefef] from-[10%] to-[#d1d1d1] to-[94%] bg-clip-text text-center font-rubik text-[28px] font-bold leading-[1.15] tracking-[-0.9px] text-transparent md:text-[45px] md:tracking-[-1px]">
            שאלות שחשוב לשאול
          </h2>
        </LandingReveal>

        <div className="w-full">
          {LANDING_FAQ.map((item, index) => {
            const isOpen = open === index;
            return (
              <LandingReveal key={item.q} delayMs={80 + index * 70} variant="fade">
                <div className="border-b border-[#293639]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-[15px] px-3 py-[15px] text-right md:gap-4 md:px-6 md:py-7"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    {/* RTL: question on the right, arrow on the left (Figma) */}
                    <span className="min-w-0 flex-1 font-rubik text-base font-medium leading-[1.28] tracking-[-0.32px] text-white md:text-2xl md:leading-[1.1] md:tracking-[-0.72px]">
                      {item.q}
                    </span>
                    <FaqArrow open={isOpen} />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-[420ms]"
                    style={{
                      transitionTimingFunction: EASE,
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                    }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        className="mb-4 px-3 transition-opacity duration-300 md:px-6"
                        style={{
                          transitionTimingFunction: EASE,
                          transitionDelay: isOpen ? '60ms' : '0ms',
                          opacity: isOpen ? 1 : 0,
                        }}
                      >
                        <div className="rounded-[15px] bg-white/10 p-5 font-rubik text-base leading-[1.2] tracking-[-0.4px] text-white md:text-[20px]">
                          {item.a.split('\n').map((line, lineIdx) =>
                            line ? (
                              <p key={lineIdx} className={lineIdx > 0 ? 'mt-3' : ''}>
                                {line}
                              </p>
                            ) : null,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </LandingReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
