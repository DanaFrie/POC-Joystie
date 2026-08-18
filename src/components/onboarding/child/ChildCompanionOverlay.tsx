'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildDoriSpeechBubble } from '@/components/onboarding/child/ChildDoriSpeechBubble';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_COMPANION_HERO_IMAGE } from '@/constants/child-onboarding-figma';
import { CHILD_COMPANION_PICK_FRAME } from '@/constants/child-onboarding-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

type ChildCompanionOverlayProps = {
  onContinue?: () => void;
  /** 100vh flex stack — scales on SE / S8; CTA lives in `FunnelStepFooter`. */
  flow?: boolean;
};

/** Figma 13367:4097 — headline, companion, speech bubble (+ CTA in flow footer). */
export function ChildCompanionOverlay({
  onContinue,
  flow = false,
}: ChildCompanionOverlayProps) {
  if (flow) {
    return <CompanionOverlayFlow />;
  }

  const frame = CHILD_COMPANION_PICK_FRAME;

  return (
    <div
      className="absolute z-10 inline-flex flex-col items-center justify-between"
      style={{
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height,
      }}
      aria-label="הכרות עם דורי הדרקון"
    >
      <CompanionOverlayLegacyContent frame={frame} onContinue={onContinue} />
    </div>
  );
}

/** Flex foreground — fills available height between logo and footer. */
function CompanionOverlayFlow() {
  const frame = CHILD_COMPANION_PICK_FRAME;
  const companion = frame.companion;
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const isCompact = usableCanvasHeightPx < V03_SCREEN_HEIGHT;
  const companionSize = isCompact
    ? Math.min(companion.size, Math.max(176, usableCanvasHeightPx * 0.3))
    : companion.size;
  const companionScale = companionSize / companion.size;

  return (
    <div
      className="pointer-events-none flex w-full min-h-0 flex-col items-center justify-center"
      aria-label="הכרות עם דורי הדרקון"
    >
      <CompanionPickContentFrame
        isCompact={isCompact}
        companionSize={companionSize}
        companionScale={companionScale}
      />
    </div>
  );
}

/** Figma Frame 1430108608 — 327px column: headline → companion → absolute bubble. */
function CompanionPickContentFrame({
  isCompact = false,
  companionSize,
  companionScale = 1,
}: {
  isCompact?: boolean;
  companionSize?: number;
  companionScale?: number;
}) {
  const frame = CHILD_COMPANION_PICK_FRAME;
  const headline = frame.headline;
  const companion = frame.companion;
  const circleSize = companionSize ?? companion.size;
  const contentGap = isCompact
    ? Math.max(24, frame.contentGap * companionScale)
    : frame.contentGap;

  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-center"
      style={{
        width: frame.width,
        gap: contentGap,
      }}
    >
      <div
        className="v03-funnel-enter-0 flex w-full flex-col items-start self-stretch"
        style={{ gap: frame.headlineGap }}
      >
        <p
          className="w-full text-center font-simpler font-normal text-white"
          style={{
            fontSize: isCompact ? 20 : headline.line1FontSize,
            lineHeight: isCompact ? '26px' : `${headline.line1LineHeight}px`,
            textShadow: headline.textShadow,
          }}
        >
          לפני שמתחילים, זה הזמן להכיר
        </p>
        <p
          className="w-full text-center font-simpler font-black text-white"
          style={{
            fontSize: isCompact ? 26 : headline.line2FontSize,
            lineHeight: isCompact ? '30px' : `${headline.line2LineHeight}px`,
            textShadow: headline.textShadow,
            ...(isCompact ? {} : { height: headline.line2Height }),
          }}
        >
          את החבר שלנו למסע:
        </p>
      </div>

      <div
        className="v03-funnel-enter-1 shrink-0"
        style={{
          width: circleSize,
          height: circleSize,
        }}
      >
        <CompanionCircle companion={companion} scale={companionScale} />
      </div>

      <ChildDoriSpeechBubble
        className="v03-funnel-enter-2"
        scale={companionScale}
      />
    </div>
  );
}

function CompanionOverlayLegacyContent({
  frame,
  onContinue,
}: {
  frame: typeof CHILD_COMPANION_PICK_FRAME;
  onContinue?: () => void;
}) {
  const cta = frame.cta;

  return (
    <>
      <CompanionPickContentFrame />

      <button
        type="button"
        onClick={onContinue}
        className="v03-funnel-enter-3 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-v03-accent px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-[#031D15] shadow-v03-button transition hover:brightness-105"
        style={{
          width: cta.width,
          minHeight: cta.height,
        }}
      >
        {cta.label}
      </button>
    </>
  );
}

function CompanionCircle({
  companion,
  scale = 1,
}: {
  companion: (typeof CHILD_COMPANION_PICK_FRAME)['companion'];
  scale?: number;
}) {
  return (
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
          width: companion.ringSize * scale,
          height: companion.ringSize * scale,
          left: companion.ringLeft * scale,
          top: companion.ringTop * scale,
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
          width: companion.imageSize * scale,
          height: companion.imageSize * scale,
          left: companion.imageOffset * scale,
          top: companion.imageOffset * scale,
        }}
        priority
      />
    </div>
  );
}
