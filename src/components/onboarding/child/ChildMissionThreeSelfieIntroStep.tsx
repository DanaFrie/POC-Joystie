'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildPostGameFunnelShell } from '@/components/onboarding/child/ChildPostGameFunnelShell';
import { ONBOARDING_COMPLETION_IMAGE } from '@/constants/onboarding-completion-layout';
import { CHILD_MISSION_THREE_SELFIE } from '@/constants/child-post-game-layout';
import {
  CHILD_MISSION_THREE_BADGE,
  CHILD_MISSION_THREE_CAMERA_DISCLAIMER,
  CHILD_MISSION_THREE_HEADLINE_LINE1,
  CHILD_MISSION_THREE_HEADLINE_LINE2,
} from '@/lib/onboarding/childPostGameCopy';
import { childPlayReadyConfirmLabel } from '@/lib/onboarding/childBondingLabels';

type ChildMissionThreeSelfieIntroStepProps = {
  parentName: string;
  parentGender?: 'female' | 'male' | null;
  onContinue?: () => void;
};

/** Mission 3 — same content frame as parent «התחלתם את המסע…» completion. */
export function ChildMissionThreeSelfieIntroStep({
  parentName,
  parentGender,
  onContinue,
}: ChildMissionThreeSelfieIntroStepProps) {
  const layout = CHILD_MISSION_THREE_SELFIE;
  const hero = layout.hero;
  const readyLabel = childPlayReadyConfirmLabel(parentName, parentGender);

  return (
    <ChildPostGameFunnelShell ellipse="lowerLeft">
      <section
        className="absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
        style={{
          top: layout.content.top,
          width: layout.content.width,
          gap: layout.content.gap,
        }}
        aria-label="משימה 3 — סלפי עם דורי"
      >
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: layout.header.gap }}
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
              fontSize: layout.title.fontSize,
              lineHeight: `${layout.title.lineHeight}px`,
            }}
          >
            {CHILD_MISSION_THREE_HEADLINE_LINE1}
            <br />
            {CHILD_MISSION_THREE_HEADLINE_LINE2}
          </h1>
        </div>

        <div
          className="relative shrink-0"
          style={{ width: hero.width, height: hero.height }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20"
            style={{ width: hero.glowSize, height: hero.glowSize }}
            aria-hidden
          />
          <OnboardingLazyImage
            src={ONBOARDING_COMPLETION_IMAGE}
            alt=""
            className="absolute inset-0 size-full object-cover"
            priority
          />
        </div>
      </section>

      <div
        className="absolute inset-x-0 bottom-0 z-[30] flex flex-col items-center justify-end"
        style={{
          paddingTop: layout.footer.paddingTop,
          gap: layout.footer.gap,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{ width: layout.footer.columnWidth, gap: layout.footer.columnGap }}
        >
          {onContinue ? (
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-white px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
            >
              {readyLabel}
            </button>
          ) : null}
          <p className="w-full text-center font-simpler text-[14px] font-normal leading-[17.5px] text-white">
            {CHILD_MISSION_THREE_CAMERA_DISCLAIMER}
          </p>
        </div>
      </div>
    </ChildPostGameFunnelShell>
  );
}
