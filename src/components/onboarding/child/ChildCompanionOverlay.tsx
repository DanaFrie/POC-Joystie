'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildDoriSpeechTail } from '@/components/onboarding/child/ChildDoriSpeechTail';
import { CHILD_ONBOARDING_COMPANION_HERO_IMAGE } from '@/constants/child-onboarding-figma';
import { CHILD_COMPANION_PICK_FRAME } from '@/constants/child-onboarding-layout';

/** Figma 13367:4097 — 327×540 frame: headline, companion, speech bubble, CTA. */
export function ChildCompanionOverlay({ onContinue }: { onContinue?: () => void }) {
  const frame = CHILD_COMPANION_PICK_FRAME;
  const headline = frame.headline;
  const speech = frame.speechBubble;
  const companion = frame.companion;
  const cta = frame.cta;

  return (
    <div
      className="absolute z-[10] inline-flex flex-col items-center justify-between"
      style={{
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height,
      }}
      aria-label="הכרות עם דורי הדרקון"
    >
      <div
        className="relative flex w-full flex-col items-center self-stretch"
        style={{ gap: frame.contentGap }}
      >
        <div
          className="v03-funnel-enter-0 flex w-full flex-col items-start self-stretch"
          style={{ gap: frame.headlineGap }}
        >
          <p
            className="w-full text-center font-simpler font-normal text-white"
            style={{
              fontSize: headline.line1FontSize,
              lineHeight: `${headline.line1LineHeight}px`,
              textShadow: headline.textShadow,
            }}
          >
            לפני שמתחילים, זה הזמן להכיר
          </p>
          <p
            className="w-full text-center font-simpler font-black text-white"
            style={{
              height: headline.line2Height,
              fontSize: headline.line2FontSize,
              lineHeight: `${headline.line2LineHeight}px`,
              textShadow: headline.textShadow,
            }}
          >
            את החבר שלנו למסע:
          </p>
        </div>

        <div
          className="v03-funnel-enter-1 relative shrink-0"
          style={{
            width: companion.size,
            height: companion.size,
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              borderRadius: companion.outerRadius,
              background: companion.outerBackground,
              boxShadow: companion.outerInsetShadow,
              backdropFilter: `blur(${companion.outerBackdropBlur}px)`,
              WebkitBackdropFilter: `blur(${companion.outerBackdropBlur}px)`,
            }}
          >
            <div
              className="pointer-events-none absolute box-border"
              style={{
                width: companion.ringSize,
                height: companion.ringSize,
                left: companion.ringLeft,
                top: companion.ringTop,
                borderRadius: companion.ringRadius,
                border: companion.ringBorder,
                background: 'transparent',
              }}
              aria-hidden
            />

            <OnboardingLazyImage
              src={CHILD_ONBOARDING_COMPANION_HERO_IMAGE}
              alt=""
              className="pointer-events-none absolute z-[1] object-contain"
              style={{
                width: companion.imageSize,
                height: companion.imageSize,
                left: companion.imageOffset,
                top: companion.imageOffset,
              }}
              priority
            />

            <div
              className="absolute"
              style={{
                width: companion.badgeSize,
                height: companion.badgeSize,
                left: companion.badgeLeft,
                top: companion.badgeTop,
              }}
              aria-hidden
            />
          </div>
        </div>

        <div
          className="v03-funnel-enter-2 absolute inline-flex items-center justify-center box-border"
          style={{
            width: speech.width,
            left: speech.left,
            top: speech.top,
            paddingTop: speech.paddingTop,
            paddingBottom: speech.paddingBottom,
            paddingLeft: speech.paddingLeft,
            paddingRight: speech.paddingRight,
            gap: speech.gap,
            borderRadius: speech.borderRadius,
            outline: speech.outline,
            outlineOffset: 0,
            background: speech.background,
            boxShadow: speech.boxShadow,
            backdropFilter: `blur(${speech.backdropBlur}px)`,
            WebkitBackdropFilter: `blur(${speech.backdropBlur}px)`,
          }}
        >
          <p
            className="flex-1 text-right font-simpler text-white"
            style={{
              fontSize: speech.fontSize,
              lineHeight: `${speech.lineHeight}px`,
            }}
          >
            <span className="font-normal">היי! </span>
            <span className="font-bold">אני דורי הדרקון</span>
            <span className="font-normal"> 👋 </span>
          </p>

          <ChildDoriSpeechTail
            className="pointer-events-none absolute"
            style={{
              left: speech.tailLeft,
              top: speech.tailTop,
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="v03-funnel-enter-3 inline-flex shrink-0 items-center justify-center overflow-hidden bg-white transition hover:brightness-95"
        style={{
          width: cta.width,
          height: cta.height,
          paddingLeft: cta.paddingX,
          paddingRight: cta.paddingX,
          paddingTop: cta.paddingY,
          paddingBottom: cta.paddingY,
          borderRadius: cta.borderRadius,
          gap: 10,
        }}
      >
        <span
          className="text-right font-simpler font-bold"
          style={{
            fontSize: cta.fontSize,
            color: cta.color,
          }}
        >
          לחץ כאן כדי להמשיך
        </span>
      </button>
    </div>
  );
}
