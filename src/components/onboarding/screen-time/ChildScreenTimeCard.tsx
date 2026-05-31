'use client';

import { ChildScreenTimeSlider } from '@/components/onboarding/screen-time/ChildScreenTimeSlider';
import { formatScreenTimeHours } from '@/lib/onboarding/childrenScreenTime';

type ChildScreenTimeCardProps = {
  roleLabel: string;
  name: string;
  hours: number;
  onHoursChange: (hours: number) => void;
};

/** Per-child screen-time card — Figma 327×slider. */
export function ChildScreenTimeCard({
  roleLabel,
  name,
  hours,
  onHoursChange,
}: ChildScreenTimeCardProps) {
  const display = formatScreenTimeHours(hours);

  return (
    <div className="flex w-full flex-col items-end gap-0.5">
      <div className="w-full px-2.5 text-right">
        <span className="font-simpler text-base font-normal leading-[21.6px] text-white">
          {roleLabel}
        </span>
      </div>

      <div className="flex w-full flex-col items-stretch gap-[15px] rounded-[18px] bg-white/5 px-[18px] pb-3.5 pt-4 shadow-[2px_2px_15px_rgba(0,0,0,0.08)] outline outline-1 outline-white/25 outline-offset-[-1px]">
        <div
          dir="ltr"
          className="flex w-full items-center justify-between gap-2"
        >
          <div className="flex items-center gap-[5px] text-white">
            {display.kind === 'one' ? (
              <span className="font-simpler text-[20px] font-normal leading-6">
                שעה אחת
              </span>
            ) : display.kind === 'half' ? (
              <span className="font-simpler text-[20px] font-normal leading-6">
                חצי שעה
              </span>
            ) : (
              <>
                <span className="font-simpler text-[20px] font-normal leading-6">
                  שעות
                </span>
                <span className="font-simpler text-2xl font-black leading-[30px]">
                  {Number.isInteger(display.value)
                    ? display.value
                    : display.value.toFixed(1)}
                </span>
              </>
            )}
          </div>
          <span className="font-simpler text-2xl font-bold leading-[30px] text-white">
            {name}
          </span>
        </div>

        <div className="flex w-full justify-end">
          <ChildScreenTimeSlider value={hours} onChange={onHoursChange} />
        </div>
      </div>
    </div>
  );
}
