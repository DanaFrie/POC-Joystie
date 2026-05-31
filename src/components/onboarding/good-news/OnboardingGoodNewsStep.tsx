'use client';

import { GoodNewsPercentArrow } from '@/components/onboarding/good-news/GoodNewsPercentArrow';
import { GoodNewsPhoneMockup } from '@/components/onboarding/good-news/GoodNewsPhoneMockup';
import { ONBOARDING_BLUR_FOOTER_RESERVE_CLASS } from '@/components/onboarding/OnboardingBlurFooter';

/** Back chevron: top 82px, h 24px → upper block starts 17px below */
const BACK_TOP_PX = 82;
const BACK_HEIGHT_PX = 24;
const GAP_BELOW_BACK_PX = 17;
const UPPER_BLOCK_TOP_PX = BACK_TOP_PX + BACK_HEIGHT_PX + GAP_BELOW_BACK_PX;
const UPPER_BLOCK_HEIGHT_PX = 237.509;
const HORIZONTAL_INSET_PX = 24;
const COPY_BLOCK_WIDTH_PX = 327;
const PERCENT_ARROW_LEFT_PX = 64;
const LOWER_BLOCK_GAP_PX = 15;

/** Figma — upper (phone + eyebrow) + lower (headline + 55%). */
export function OnboardingGoodNewsStep() {
  const lowerBlockTop =
    UPPER_BLOCK_TOP_PX + UPPER_BLOCK_HEIGHT_PX + LOWER_BLOCK_GAP_PX;

  return (
    <section
      className={`absolute inset-x-0 top-0 z-[10] overflow-y-auto v03-scroll-hidden ${ONBOARDING_BLUR_FOOTER_RESERVE_CLASS}`}
      aria-label="החדשות הטובות"
    >
      {/* Upper block — phone centered; eyebrow in lower third */}
      <div
        className="absolute inset-x-0 z-[1]"
        style={{
          top: UPPER_BLOCK_TOP_PX,
          height: UPPER_BLOCK_HEIGHT_PX,
          paddingLeft: HORIZONTAL_INSET_PX,
          paddingRight: HORIZONTAL_INSET_PX,
        }}
      >
        <div className="relative mx-auto h-full w-full max-w-v03-content">
          <div className="v03-fade-in-seq-0 flex h-full w-full justify-center">
            <GoodNewsPhoneMockup />
          </div>
          <p
            className="v03-fade-in-seq-1 absolute inset-x-0 z-[2] flex items-center justify-center text-center font-simpler text-[24px] font-normal leading-[30px] text-v03-text-on-light"
            style={{
              top: '66.6667%',
              height: '33.3333%',
            }}
          >
            החדשות הטובות הן:
          </p>
        </div>
      </div>

      {/* Lower block — headline + 55% */}
      <div
        className="absolute inset-x-0 z-[1] flex flex-col items-center gap-[35px]"
        style={{
          top: lowerBlockTop,
          paddingLeft: HORIZONTAL_INSET_PX,
          paddingRight: HORIZONTAL_INSET_PX,
        }}
      >
        <div
          className="flex w-full flex-col items-center gap-[35px]"
          style={{ maxWidth: COPY_BLOCK_WIDTH_PX }}
        >
          <h1 className="v03-fade-in-seq-2 w-full self-stretch text-center font-simpler text-[28px] font-black leading-[34px] text-v03-text-on-light">
            שימוש ב-Joystie יכול לצמצם זמן מסך ב-
          </h1>

          <div className="relative flex min-h-[80px] w-full self-stretch items-center justify-center">
            <div
              className="v03-fade-in-seq-3 text-center font-simpler text-v03-accent-purple"
              dir="ltr"
            >
              <span className="text-[80px] font-black leading-[43.8px]">55</span>
              <span className="text-[35px] font-black leading-[43.8px]">%</span>
            </div>
            <GoodNewsPercentArrow
              className="v03-fade-in-seq-3 absolute top-1/2 h-[37px] w-[37px] -translate-y-1/2"
              style={{ left: PERCENT_ARROW_LEFT_PX }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
