'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ChildContinueGlowButton } from '@/components/onboarding/child/ChildContinueGlowButton';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_ONBOARDING_PLACEHOLDER_NAME } from '@/constants/child-onboarding-figma';
import { CHILD_DORI_REVEALED } from '@/constants/child-onboarding-layout';

/** Screen 6 — Figma 13147:5622. Dori revealed after egg hatch. */
export function ChildDoriRevealedStep({ onContinue }: { onContinue?: () => void }) {
  const layout = CHILD_DORI_REVEALED;
  const hero = layout.hero;

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <OnboardingMintGlow />

      <div
        className="pointer-events-none absolute z-[2] overflow-hidden"
        style={{ left: hero.left, top: hero.top, width: hero.size, height: hero.size }}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriWaveHello}
          alt=""
          className="h-full w-full object-contain"
          priority
        />
      </div>

      <ChildSpeechBubble
        top={layout.bubble.top}
        width={layout.bubble.width}
        left={layout.bubble.left}
      >
        <p className="flex-1 text-center font-simpler text-[24px] leading-[30px] tracking-[-0.36px] text-white">
          <span className="font-normal">
            {`אין עליך ${CHILD_ONBOARDING_PLACEHOLDER_NAME}!`}
            <br />
          </span>
          <span className="font-black leading-[1.25]">תודה שהערת אותי!</span>
        </p>
      </ChildSpeechBubble>

      <div
        className="absolute left-1/2 z-10 -translate-x-1/2"
        style={{ top: layout.continue.top, width: layout.continue.width }}
      >
        <ChildContinueGlowButton onClick={onContinue} />
      </div>
    </div>
  );
}
