'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildPostGameGreenBackground } from '@/components/onboarding/child/ChildPostGameGreenBackground';
import {
  FunnelStepForeground,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_MISSION_THREE_SELFIE } from '@/constants/child-post-game-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  ONBOARDING_STACKED_FOOTER_CONTENT_W_PX,
} from '@/constants/onboarding-footer';
import {
  CHILD_MISSION_THREE_BADGE,
  CHILD_MISSION_THREE_CAMERA_DISCLAIMER,
  CHILD_MISSION_THREE_HEADLINE_LINE1,
  CHILD_MISSION_THREE_HEADLINE_LINE2,
} from '@/lib/onboarding/childPostGameCopy';
import { childPlayReadyConfirmLabel } from '@/lib/onboarding/childBondingLabels';

function missionThreeHeroSrc(parentGender?: 'female' | 'male' | null): string {
  return parentGender === 'female'
    ? CHILD_ONBOARDING_ASSETS.motherChildDori
    : CHILD_ONBOARDING_ASSETS.fatherChildDori;
}

type ChildMissionThreeSelfieIntroStepProps = {
  parentName: string;
  parentGender?: 'female' | 'male' | null;
  onContinue?: () => void;
};

/** Mission 3 — selfie intro with parent+child hero art. */
export function ChildMissionThreeSelfieIntroStep({
  parentName,
  parentGender,
  onContinue,
}: ChildMissionThreeSelfieIntroStepProps) {
  const layout = CHILD_MISSION_THREE_SELFIE;
  const hero = layout.hero;
  const footer = layout.footer;
  const readyLabel = childPlayReadyConfirmLabel(parentName, parentGender);
  const heroSrc = missionThreeHeroSrc(parentGender);
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const gapScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const contentGap = Math.max(12, Math.round(layout.content.gap * gapScale));
  const headerGap = Math.max(16, Math.round(layout.header.gap * gapScale));
  const heroW = Math.round(hero.width * Math.min(1, gapScale + 0.04));
  const heroH = Math.round(hero.height * Math.min(1, gapScale + 0.04));
  const glowSize = Math.round(hero.glowSize * Math.min(1, gapScale + 0.04));
  const titleSize = Math.max(32, Math.round(layout.title.fontSize * Math.min(1, gapScale + 0.05)));

  return (
    <FunnelStepRoot
      fitViewport
      className="overflow-hidden bg-transparent"
      aria-label="משימה 3 — סלפי עם דורי"
    >
      <ChildPostGameGreenBackground />

      <FunnelStepForeground fitViewport distribution="between" padTopPx={0} padBottomPx={34}>
        <FunnelStepSection className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <div
            className="flex w-full max-w-v03-content flex-col items-center"
            style={{ gap: contentGap, width: layout.content.width }}
          >
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: headerGap }}
            >
              <div
                className="inline-flex items-center justify-center rounded-[16px] bg-v03-green-700"
                style={{
                  paddingLeft: layout.badge.paddingX,
                  paddingRight: layout.badge.paddingX,
                  paddingTop: layout.badge.paddingY,
                  paddingBottom: layout.badge.paddingY,
                }}
              >
                <p className="text-center font-simpler text-[18px] font-bold leading-[21.6px] text-white">
                  {CHILD_MISSION_THREE_BADGE}
                </p>
              </div>

              <h1
                className="w-full text-center font-simpler font-black text-white"
                style={{
                  fontSize: titleSize,
                  lineHeight: `${Math.round(titleSize * 1.1)}px`,
                }}
              >
                {CHILD_MISSION_THREE_HEADLINE_LINE1}
                <br />
                {CHILD_MISSION_THREE_HEADLINE_LINE2}
              </h1>
            </div>

            <div className="relative shrink-0" style={{ width: heroW, height: heroH }}>
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20"
                style={{ width: glowSize, height: glowSize }}
                aria-hidden
              />
              <OnboardingLazyImage
                src={heroSrc}
                alt=""
                className="absolute inset-0 size-full object-cover"
                priority
              />
            </div>
          </div>
        </FunnelStepSection>

        <FunnelStepSection>
          <div
            className="flex w-full flex-col items-center"
            style={{ gap: footer.gap, maxWidth: footer.columnWidth }}
          >
            {onContinue ? (
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-white px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
                style={{ maxWidth: ONBOARDING_STACKED_FOOTER_CONTENT_W_PX }}
              >
                {readyLabel}
              </button>
            ) : null}
            <p className="w-full text-center font-simpler text-[14px] font-normal leading-[17.5px] text-white">
              {CHILD_MISSION_THREE_CAMERA_DISCLAIMER}
            </p>
          </div>
        </FunnelStepSection>
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}
