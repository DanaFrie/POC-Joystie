'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { JoystieCompactMark } from '@/components/brand/JoystieCompactMark';
import { FunnelMintEllipse } from '@/components/onboarding/game/FunnelMintEllipse';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import {
  ONBOARDING_BACK_HEIGHT_PX,
  ONBOARDING_BACK_SCROLL_GAP_PX,
  ONBOARDING_BACK_TOP_PX,
} from '@/constants/onboarding-funnel-motion';
import { useGrowFunnelCanvasHeight } from '@/hooks/useGrowFunnelCanvasHeight';

type LegalDocumentScreenProps = {
  title: string;
  updatedLabel?: string;
  intro?: string;
  expandLabel?: string;
  children: (expanded: boolean) => ReactNode;
};

/** Shared funnel chrome for terms / privacy — green bg, mint ellipse, page scroll only. */
export function LegalDocumentScreen({
  title,
  updatedLabel = 'עודכן לאחרונה: יוני 2026',
  intro = 'כדי שנוכל ליצור עבורך חוויה אישית, בטוחה ומותאמת, נבקש לאשר את תנאי השימוש ומדיניות הפרטיות שלנו.',
  expandLabel = 'קרא הכל...',
  children,
}: LegalDocumentScreenProps) {
  const router = useRouter();
  /** Full text by default so `/terms` + `/privacy` page-scroll immediately. */
  const [expanded, setExpanded] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  useGrowFunnelCanvasHeight(rootRef, [expanded]);

  const contentTopPadPx =
    ONBOARDING_BACK_TOP_PX + ONBOARDING_BACK_HEIGHT_PX + ONBOARDING_BACK_SCROLL_GAP_PX;

  return (
    <div
      ref={rootRef}
      dir="rtl"
      className="relative z-[10] w-full overflow-visible bg-v03-green-900 px-v03-gutter pb-8 v03-funnel-screen"
      style={{ paddingTop: contentTopPadPx, minHeight: '100%' }}
    >
      <FunnelMintEllipse />
      <OnboardingBackButton onClick={() => router.back()} />

      <div className="relative z-[20] mx-auto flex w-v03-content flex-col items-center gap-5">
        <JoystieCompactMark className="v03-funnel-enter-0" width={45.47} height={45.04} />

        <div className="flex w-full flex-col items-center v03-funnel-enter-1">
          <h1 className="mb-2 text-center font-simpler text-[30px] font-bold leading-[34.5px] text-white">
            {title}
          </h1>
          <p className="mb-5 text-center font-simpler text-[14px] font-normal leading-[17.5px] text-[#E3EDEA]">
            {updatedLabel}
          </p>

          <div
            className={`relative flex w-v03-content flex-col items-center gap-5 rounded-[18px] border-[1.5px] border-white/25 bg-v03-green-900/40 px-5 py-[15px] backdrop-blur-[2px] v03-funnel-enter-2 ${
              expanded ? 'overflow-visible' : 'overflow-hidden'
            }`}
          >
            <p className="w-full text-center font-simpler text-[14px] font-normal leading-[17.5px] text-[#E3EDEA]">
              {intro}
            </p>

            <div className="relative w-full overflow-visible">
              {children(expanded)}

              {!expanded ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start bg-gradient-to-t from-v03-green-900 via-v03-green-900/90 to-transparent pb-1 pt-12">
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="pointer-events-auto text-right font-simpler text-[14px] font-bold leading-[17.5px] text-white underline decoration-solid underline-offset-2 transition hover:opacity-90"
                  >
                    {expandLabel}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
