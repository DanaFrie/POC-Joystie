'use client';

import { useState } from 'react';
import { ChildDetailsFormBlock } from '@/components/onboarding/children-details/ChildDetailsFormBlock';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildScreenTimeSlider } from '@/components/onboarding/screen-time/ChildScreenTimeSlider';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { ONBOARDING_CHILDREN_PHONE_IMAGE } from '@/constants/onboarding-figma';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';
import {
  formatScreenTimeHours,
  snapScreenTimeHours,
} from '@/lib/onboarding/childrenScreenTime';

type SingleChildSetupStepProps = {
  child: OnboardingChildDraft;
  hours: number;
  nameError?: string;
  onChildChange: (child: OnboardingChildDraft) => void;
  onHoursChange: (hours: number) => void;
};

/** Figma badge — «שעה» / «חצי שעה» / «שעתיים» / «1.5 שעות». */
function formatHoursBadge(hours: number): string {
  const display = formatScreenTimeHours(snapScreenTimeHours(hours));
  if (display.kind === 'one') return 'שעה';
  if (display.kind === 'half') return 'חצי שעה';
  const value = Number.isInteger(display.value)
    ? `${display.value}`
    : display.value.toFixed(1).replace(/\.0$/, '');
  if (display.value === 2) return 'שעתיים';
  return `${value} שעות`;
}

/**
 * Figma 14663:27416 — single child setup.
 * Screen-time estimate: badge + slider (not main-branch ChildScreenTimeCard).
 */
export function SingleChildSetupStep({
  child,
  hours,
  nameError,
  onChildChange,
  onHoursChange,
}: SingleChildSetupStepProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [previewHours, setPreviewHours] = useState<number | null>(null);
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const topPx = (69 / V03_SCREEN_HEIGHT) * usableCanvasHeightPx;
  const displayHours = previewHours ?? hours;

  return (
    <section
      className="pointer-events-auto flex w-full max-w-full flex-col items-center overflow-x-hidden px-v03-gutter pb-4"
      style={{ paddingTop: topPx, gap: 19 }}
      aria-label="פרטי הילד"
    >
      <div className="v03-funnel-enter-0 relative h-[180px] w-[180px] shrink-0">
        {!imageFailed ? (
          <OnboardingLazyImage
            src={ONBOARDING_CHILDREN_PHONE_IMAGE}
            alt=""
            priority
            className="pointer-events-none absolute left-1/2 top-1/2 h-[205px] w-[205px] max-w-none -translate-x-1/2 -translate-y-[calc(50%+6px)] object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </div>

      <div className="flex w-full min-w-0 max-w-v03-content flex-col items-center gap-[30px]">
        <header className="v03-funnel-enter-1 flex w-full min-w-0 flex-col items-stretch gap-1.5 overflow-visible">
          <h1 className="w-full min-w-0 text-center font-simpler text-[clamp(28px,9.6vw,36px)] font-bold leading-[1.1] tracking-[-1.08px] text-white">
            אז... עם מי מתחילים?
          </h1>
          <p className="w-full min-w-0 text-center font-simpler text-[clamp(18px,6.4vw,24px)] font-normal leading-[1.35] tracking-[-0.72px] text-white/80">
            האפליקציה מתאימה לגילאים 6-12
          </p>
        </header>

        <div className="v03-funnel-enter-2 flex w-full min-w-0 flex-col items-stretch gap-6">
          <ChildDetailsFormBlock
            nameLabel="שם הילד/ה"
            child={child}
            onChange={onChildChange}
            nameError={nameError}
            showDivider={false}
            blockGapPx={24}
            rowGapPx={12}
          />

          {/* Figma 14663:14705 — estimate badge + slider */}
          <div dir="rtl" className="flex w-full min-w-0 flex-col items-stretch gap-1">
            <div className="flex w-full items-center justify-end px-2.5">
              <span className="text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
                זמן מסך יומי (הערכה)
              </span>
            </div>
            <div className="flex w-full flex-col items-center gap-3 overflow-hidden rounded-[18px] bg-white/5 px-[18px] pb-2.5 pt-3 shadow-[2px_2px_15px_rgba(0,0,0,0.08)] outline outline-1 outline-white/25 outline-offset-[-1px]">
              <div className="flex w-full items-center justify-center">
                <div className="flex h-8 w-[99px] shrink-0 items-center justify-center gap-2.5 rounded-[10px] bg-white/[0.08]">
                  <span className="whitespace-nowrap text-center font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-white">
                    {formatHoursBadge(displayHours)}
                  </span>
                </div>
              </div>
              <ChildScreenTimeSlider
                value={hours}
                onChange={onHoursChange}
                onDragChange={setPreviewHours}
                onDragEnd={() => setPreviewHours(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
