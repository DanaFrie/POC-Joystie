'use client';

import { useState } from 'react';
import { ChildAgeStepper } from '@/components/onboarding/children-details/ChildAgeStepper';
import { ChildGenderPicker } from '@/components/onboarding/children-details/ChildGenderPicker';
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

const fieldLabelClass =
  'w-full px-2.5 text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white';

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
 * Figma 14663:27416 — single child setup (name, age, gender, daily screen time).
 * Keep existing children-phones hero. Ignore iPhone status chrome.
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
      className="pointer-events-auto flex w-full flex-col items-center px-v03-gutter"
      style={{ paddingTop: topPx, gap: 19 }}
      aria-label="פרטי הילד"
    >
      <div className="v03-funnel-enter-0 relative size-[180px] shrink-0">
        {!imageFailed ? (
          <OnboardingLazyImage
            src={ONBOARDING_CHILDREN_PHONE_IMAGE}
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 h-[205px] w-[205px] -translate-x-1/2 -translate-y-[calc(50%+6px)] object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </div>

      <div className="flex w-full max-w-v03-content flex-col items-center gap-[30px]">
        <header className="v03-funnel-enter-1 flex w-full flex-col items-stretch gap-1.5">
          <h1 className="w-full text-center font-simpler text-[36px] font-bold leading-[1.1] tracking-[-1.08px] text-white">
            אז... עם מי מתחילים?
          </h1>
          <p className="w-full text-center font-simpler text-[24px] font-normal leading-[1.35] tracking-[-0.72px] text-white/80">
            האפליקציה מתאימה לגילאים 6-12
          </p>
        </header>

        <div
          dir="rtl"
          className="v03-funnel-enter-2 flex w-full flex-col items-stretch gap-6"
        >
          <div className="flex w-full flex-col items-stretch gap-0.5">
            <span className={fieldLabelClass}>שם הילד/ה</span>
            <input
              type="text"
              dir="rtl"
              value={child.name}
              onChange={(e) => onChildChange({ ...child, name: e.target.value })}
              placeholder="שם פרטי"
              className="flex h-[49px] w-full items-center justify-end rounded-[18px] bg-white/5 px-[15px] py-3.5 text-right font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white outline outline-1 outline-white/20 outline-offset-[-1px] placeholder:text-v03-green-400 focus:outline-white/40"
            />
            {nameError ? (
              <p className="w-full px-2.5 text-right font-simpler text-sm text-red-300">
                {nameError}
              </p>
            ) : null}
          </div>

          <div dir="ltr" className="flex w-full items-start gap-3">
            <div className="flex shrink-0 flex-col items-end gap-0.5 self-stretch">
              <span className={fieldLabelClass}>גיל</span>
              <ChildAgeStepper
                value={child.age}
                onChange={(age) => onChildChange({ ...child, age })}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
              <span className={fieldLabelClass}>מין</span>
              <ChildGenderPicker
                value={child.gender}
                onChange={(gender) => onChildChange({ ...child, gender })}
              />
            </div>
          </div>

          <div className="flex w-full flex-col items-end gap-1">
            <span className={fieldLabelClass}>זמן מסך יומי (הערכה)</span>
            <div className="flex w-full flex-col items-center gap-3 overflow-hidden rounded-[18px] bg-white/5 px-[18px] pb-2.5 pt-3 shadow-[2px_2px_15px_rgba(0,0,0,0.08)] outline outline-1 outline-white/25 outline-offset-[-1px]">
              <div className="inline-flex h-8 min-w-[99px] items-center justify-center rounded-[10px] bg-white/8 px-3">
                <span className="font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-white">
                  {formatHoursBadge(displayHours)}
                </span>
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
