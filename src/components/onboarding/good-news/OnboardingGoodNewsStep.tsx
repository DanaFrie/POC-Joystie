'use client';

import { GoodNewsPercentArrow } from '@/components/onboarding/good-news/GoodNewsPercentArrow';
import { GoodNewsPhoneMockup } from '@/components/onboarding/good-news/GoodNewsPhoneMockup';
import { useFunnelProportionalTopPx, useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  REVEAL_PHONE_BLOCK_HEIGHT_PX,
  REVEAL_PHONE_BLOCK_TOP_PX,
} from '@/constants/reveal-phone-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

const COPY_BLOCK_WIDTH_PX = 327;
const PERCENT_ARROW_GAP_PX = 12;
const LOWER_BLOCK_GAP_PX = 15;

/** Figma — upper (phone + eyebrow) + lower (headline + 55%). */
export function OnboardingGoodNewsStep() {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const phoneBlockTop = useFunnelProportionalTopPx(REVEAL_PHONE_BLOCK_TOP_PX);
  const phoneBlockHeight =
    (REVEAL_PHONE_BLOCK_HEIGHT_PX / V03_SCREEN_HEIGHT) * usableCanvasHeightPx;

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      aria-label="החדשות הטובות"
    >
      <div
        className="relative flex shrink-0 flex-col items-center px-v03-gutter"
        style={{
          paddingTop: phoneBlockTop,
          minHeight: phoneBlockHeight + phoneBlockTop,
        }}
      >
        <div className="relative mx-auto w-full max-w-v03-content">
          <div
            className="relative mx-auto flex justify-center"
            style={{ height: REVEAL_PHONE_BLOCK_HEIGHT_PX }}
          >
            <div className="v03-funnel-enter-reveal-0 flex h-full w-full justify-center">
              <GoodNewsPhoneMockup />
            </div>
            <p
              className="v03-funnel-enter-reveal-1 absolute inset-x-0 z-[2] flex items-center justify-center text-center font-simpler text-[24px] font-normal leading-[30px] text-v03-text-on-light"
              style={{
                top: '66.6667%',
                height: '33.3333%',
              }}
            >
              החדשות הטובות הן:
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-start gap-[35px] px-v03-gutter pb-2"
        style={{ marginTop: LOWER_BLOCK_GAP_PX }}
      >
        <div
          className="flex w-full flex-col items-center gap-[35px]"
          style={{ maxWidth: COPY_BLOCK_WIDTH_PX }}
        >
          <h1 className="v03-funnel-enter-reveal-2 w-full self-stretch text-center font-simpler text-[28px] font-black leading-[34px] text-v03-text-on-light">
            שימוש ב-Joystie יכול לצמצם זמן מסך ב-
          </h1>

          <div className="relative flex w-full self-stretch justify-center">
            <div className="v03-funnel-enter-reveal-3 relative inline-flex items-center">
              <GoodNewsPercentArrow
                className="absolute top-1/2 h-[37px] w-[37px] -translate-y-1/2"
                style={{ right: `calc(100% + ${PERCENT_ARROW_GAP_PX}px)` }}
              />
              <div
                className="text-center font-simpler text-v03-accent-purple inline-flex items-center"
                dir="ltr"
              >
                <span className="text-[80px] font-black leading-[43.8px]">55</span>
                <span className="text-[35px] font-black leading-[43.8px]">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
