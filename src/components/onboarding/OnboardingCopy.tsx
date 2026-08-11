'use client';

import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { ONBOARDING_LANDING_COPY_TOP_PX } from '@/constants/onboarding-figma';

type OnboardingCopyProps = {
  /** Flow layout inside 100vh `FunnelStepForeground` — no absolute Y. */
  flow?: boolean;
};

/**
 * Frame 1430108622 — Figma 12703:41514.
 * Flow: middle band of landing 100vh stack. Absolute: top 402 (proportional).
 */
export function OnboardingCopy({ flow = false }: OnboardingCopyProps) {
  const topPx = useFunnelProportionalTopPx(ONBOARDING_LANDING_COPY_TOP_PX);

  if (flow) {
    return (
      <section
        dir="ltr"
        className="pointer-events-none z-[10] flex w-full flex-col items-end gap-2"
        aria-label="מידע על Joystie"
      >
        <CopyContent />
      </section>
    );
  }

  return (
    <section
      dir="ltr"
      className="pointer-events-none absolute left-v03-gutter z-[10] flex h-[198px] w-v03-content flex-col items-end gap-2"
      style={{ top: topPx }}
      aria-label="מידע על Joystie"
    >
      <CopyContent />
    </section>
  );
}

function CopyContent() {
  return (
    <div className="flex w-full flex-col items-end justify-center gap-2">
      <p className="h-[30px] w-full text-center font-simpler text-[18px] font-normal leading-[30px] tracking-[3.78px] text-v03-green-200">
        השינוי מתחיל כאן
      </p>

      <div className="flex w-full flex-col items-end gap-3">
        <h1 className="w-full text-center font-simpler text-[40px] font-bold leading-[1.1] tracking-[-1.2px] text-white [text-shadow:0_0_15px_rgba(255,255,255,0.2)]">
          הארנק הדיגיטלי שמשנה הרגלי מסך
        </h1>
        <p className="w-full text-center font-simpler text-[26px] font-normal leading-[1.35] tracking-[-0.78px] text-white">
          הילדים שלכם לומדים לבחור, לחסוך ולהוביל
        </p>
      </div>
    </div>
  );
}
