'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignupHeroEllipses } from '@/components/onboarding/signup/SignupHeroEllipses';
import { TermsOfUseContent } from '@/components/legal/TermsOfUseContent';
import { ONBOARDING_BLUR_FOOTER_HEIGHT_PX } from '@/components/onboarding/OnboardingBlurFooter';
import { FunnelBleedFooterBackdrop } from '@/components/ui/FunnelBleedFooterBackdrop';
import { ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX } from '@/constants/onboarding-footer';

const whiteButtonClass =
  'inline-flex h-[55px] w-v03-content max-w-[calc(100vw-48px)] items-center justify-center rounded-[22px] bg-white px-[15px] font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-v03-button transition hover:brightness-95';

const turquoiseButtonClass =
  'inline-flex h-[55px] w-v03-content max-w-[calc(100vw-48px)] items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-v03-button transition hover:brightness-95';

export function OnboardingTermsScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const footerReservePx = expanded
    ? ONBOARDING_BLUR_FOOTER_HEIGHT_PX
    : ONBOARDING_BLUR_FOOTER_HEIGHT_PX + 55 + 15;

  return (
    <>
      <div
        dir="rtl"
        className="absolute inset-x-0 top-0 z-[10] overflow-hidden bg-v03-green-900"
        style={{
          bottom: footerReservePx,
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[420px] overflow-visible">
          <SignupHeroEllipses />
        </div>

        <div
          className={`absolute inset-0 z-[20] px-v03-gutter pb-8 pt-6 ${
            expanded ? 'overflow-y-auto v03-scroll-hidden' : 'overflow-hidden'
          }`}
        >
          <div className="mx-auto flex w-v03-content flex-col items-center">
            <h1 className="mb-2 text-center font-simpler text-[30px] font-bold leading-[34.5px] text-white">
              תנאי שימוש
            </h1>
            <p className="mb-5 text-center font-simpler text-[14px] font-normal leading-[17.5px] text-[#E3EDEA]">
              עדכון אחרון: נובמבר, 2025
            </p>

            <div className="flex w-v03-content flex-col items-center gap-5 rounded-[18px] border-[1.5px] border-white/25 bg-white/5 px-5 py-[15px]">
              <p className="w-full text-center font-simpler text-[14px] font-normal leading-[17.5px] text-[#E3EDEA]">
                כדי שנוכל ליצור עבורך חוויה אישית, בטוחה ומותאמת, נבקש לאשר את תנאי
                השימוש ומדיניות הפרטיות שלנו.
              </p>

              <div className="w-full">
                <TermsOfUseContent expanded={expanded} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {expanded ? (
        <FunnelBleedFooterBackdrop shellTopPx={ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX} />
      ) : null}

      <div
        className="absolute left-v03-gutter z-[45] flex w-v03-content flex-col items-center gap-[15px] pt-5"
        style={{ top: ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX }}
      >
        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={whiteButtonClass}
          >
            קרא את כל התנאים
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => router.back()}
          className={turquoiseButtonClass}
        >
          חזרה
        </button>
      </div>
    </>
  );
}
