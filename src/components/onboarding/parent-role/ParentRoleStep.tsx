'use client';

import { ParentRoleCard } from '@/components/onboarding/parent-role/ParentRoleCard';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { ONBOARDING_PARENT_IMAGES } from '@/constants/onboarding-figma';
import { PARENT_ROLE_STEP } from '@/constants/parent-onboarding-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import type { OnboardingParentRole } from '@/lib/onboarding/parentRole';

type ParentRoleStepProps = {
  role: OnboardingParentRole | null;
  onRoleChange: (role: OnboardingParentRole) => void;
};

/** Parent role picker — Figma @ top 97; flow stack inside `FunnelStepForeground`. */
export function ParentRoleStep({ role, onRoleChange }: ParentRoleStepProps) {
  const layout = PARENT_ROLE_STEP;
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const topPx = (layout.top / V03_SCREEN_HEIGHT) * usableCanvasHeightPx;

  return (
    <section
      className="pointer-events-auto flex w-full flex-col items-end gap-[35px] px-v03-gutter"
      style={{ paddingTop: topPx, gap: layout.columnGap }}
      aria-label="בחירת תפקיד הורה"
    >
      <header className="v03-funnel-enter-0 flex w-full max-w-v03-content flex-col items-end justify-center gap-1 px-[15px]">
        <h1 className="w-full text-right font-simpler text-[40px] font-bold leading-[1.1] tracking-[-1.2px] text-white">
          היי, נעים מאוד!
        </h1>
        <p className="w-[293px] max-w-full text-right font-simpler text-[24px] font-normal leading-[1.35] tracking-[-0.72px] text-white">
          שמחים להכיר, עם מי אנחנו מדברים?
        </p>
      </header>

      <div
        className="v03-funnel-enter-1 flex w-full max-w-v03-content flex-col"
        style={{ gap: layout.cardGap }}
      >
        <ParentRoleCard
          label="אני האמא"
          imageSrc={ONBOARDING_PARENT_IMAGES.mother}
          imageAlt="אמא"
          selected={role === 'mother'}
          onSelect={() => onRoleChange('mother')}
        />
        <ParentRoleCard
          label="אני האבא"
          imageSrc={ONBOARDING_PARENT_IMAGES.father}
          imageAlt="אבא"
          selected={role === 'father'}
          onSelect={() => onRoleChange('father')}
        />
      </div>
    </section>
  );
}
