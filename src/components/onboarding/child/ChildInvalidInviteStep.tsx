'use client';

import { ChildFunnelBleedBackground } from '@/components/onboarding/child/ChildFunnelBleedBackground';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';

type ChildInvalidInviteStepProps = {
  title: string;
  detail?: string;
};

/** Shown when `?invite=` is missing, invalid, or expired. */
export function ChildInvalidInviteStep({ title, detail }: ChildInvalidInviteStepProps) {
  return (
    <>
      <ChildFunnelBleedBackground />
      <OnboardingFunnelStepSlot stepKey="invalidToken" clipOverflow={false}>
        <div
          dir="rtl"
          className="flex h-full flex-col items-center justify-center px-v03-gutter text-center"
        >
          <h1 className="font-simpler text-2xl font-black leading-tight text-white">{title}</h1>
          {detail ? (
            <p className="mt-4 max-w-[320px] font-simpler text-base leading-relaxed text-white/80">
              {detail}
            </p>
          ) : null}
        </div>
      </OnboardingFunnelStepSlot>
    </>
  );
}
