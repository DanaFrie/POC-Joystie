'use client';

import { useEffect } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildPostGameFunnelShell } from '@/components/onboarding/child/ChildPostGameFunnelShell';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_CHANGE_KING,
  CHILD_KING_CONFETTI_MS,
} from '@/constants/child-post-game-layout';
import {
  childChangeKingBody,
  childChangeKingHeadline,
} from '@/lib/onboarding/childPostGameCopy';

type ChildChangeKingStepProps = {
  childName: string;
  childGender: 'boy' | 'girl';
  onConfettiEnd: () => void;
};

/** Figma 13466:18573 — king celebration over notebook hero. */
export function ChildChangeKingStep({
  childName,
  childGender,
  onConfettiEnd,
}: ChildChangeKingStepProps) {
  const layout = CHILD_CHANGE_KING;

  useEffect(() => {
    const timer = window.setTimeout(onConfettiEnd, CHILD_KING_CONFETTI_MS);
    return () => window.clearTimeout(timer);
  }, [onConfettiEnd]);

  return (
    <ChildPostGameFunnelShell ellipse="upper">
      <section
        className="absolute left-1/2 flex w-full max-w-v03-content -translate-x-1/2 flex-col items-center px-v03-gutter"
        style={{
          top: layout.contentTop,
          gap: layout.contentGap,
        }}
        aria-label="חגיגת בחירת שינוי"
      >
        <div
          className="relative shrink-0 overflow-visible"
          style={{ width: layout.heroSize, height: layout.heroSize }}
        >
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.doriNotebookOpen}
            alt=""
            className="size-full object-cover object-center"
            priority
          />
        </div>

        <div
          className="flex w-full flex-col items-center self-stretch"
          style={{ gap: layout.textGap }}
        >
          <div
            className="flex w-full flex-col items-end justify-center self-stretch px-[15px]"
            style={{ gap: layout.titleGap }}
          >
            <h1
              className="w-full text-center font-simpler font-black text-white"
              style={{
                fontSize: layout.title.fontSize,
                lineHeight: `${layout.title.lineHeight}px`,
              }}
            >
              {childChangeKingHeadline(childName, childGender)}
            </h1>
          </div>
          <p
            className="text-center font-simpler font-normal text-white"
            style={{
              width: layout.body.width,
              fontSize: layout.body.fontSize,
              lineHeight: `${layout.body.lineHeight}px`,
            }}
          >
            {childChangeKingBody(childGender)}
          </p>
        </div>
      </section>
    </ChildPostGameFunnelShell>
  );
}
