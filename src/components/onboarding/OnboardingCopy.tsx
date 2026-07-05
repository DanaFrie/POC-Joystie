type OnboardingCopyProps = {
  /** Flow layout inside `FunnelStepForeground` — gaps flex with viewport height. */
  flow?: boolean;
};

/**
 * Frame 1430108622 — Figma 12703:41514.
 * Fixed: top 402. Flow: middle band of landing foreground stack.
 */
export function OnboardingCopy({ flow = false }: OnboardingCopyProps) {
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
      className="pointer-events-none absolute left-v03-gutter top-[402px] z-[10] flex h-[198px] w-v03-content flex-col items-end gap-2"
      aria-label="מידע על Joystie"
    >
      <CopyContent />
    </section>
  );
}

function CopyContent() {
  return (
    <>
      <div className="flex w-full justify-end">
        <p className="max-w-[184px] text-center font-simpler text-[18px] font-normal leading-[30px] tracking-[3.78px] text-v03-green-200">
          השינוי מתחיל כאן
        </p>
      </div>

      <div className="flex w-full flex-col items-end gap-3">
        <h1 className="w-full text-right font-simpler text-[40px] font-black leading-[44px] text-white [text-shadow:0_0_15px_rgba(255,255,255,0.2)]">
          הארנק הדיגיטלי שמשנה הרגלי מסך
        </h1>
        <p className="w-full max-w-[293px] text-right font-simpler text-[24px] font-normal leading-[30px] text-white">
          הילדים שלכם לומדים לבחור, לחסוך ולהוביל
        </p>
      </div>
    </>
  );
}
