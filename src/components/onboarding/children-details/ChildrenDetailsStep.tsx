'use client';

import { useState } from 'react';
import { ChildDetailsFormBlock } from '@/components/onboarding/children-details/ChildDetailsFormBlock';
import { ONBOARDING_BLUR_FOOTER_HEIGHT_PX } from '@/components/onboarding/OnboardingBlurFooter';
import { ONBOARDING_CHILDREN_DETAILS_IMAGE } from '@/constants/onboarding-figma';
import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';
import { getChildNameLabels } from '@/lib/onboarding/childrenDetails';

type ChildrenDetailsStepProps = {
  children: OnboardingChildDraft[];
  onChildrenChange: (children: OnboardingChildDraft[]) => void;
};

/** Figma 1430108638 — fixed hero + title; scroll child forms only (1430108636). */
export function ChildrenDetailsStep({
  children,
  onChildrenChange,
}: ChildrenDetailsStepProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const labels = getChildNameLabels(children.length);

  const updateChild = (index: number, child: OnboardingChildDraft) => {
    const next = [...children];
    next[index] = child;
    onChildrenChange(next);
  };

  return (
    <div
      dir="rtl"
      className="absolute inset-x-0 top-[82px] z-[10] overflow-hidden"
      style={{ bottom: ONBOARDING_BLUR_FOOTER_HEIGHT_PX }}
      aria-label="פרטי ילדים"
    >
      <div className="absolute bottom-0 right-v03-gutter top-0 flex w-v03-content flex-col items-center gap-[19px] overflow-hidden">
        <div
          dir="ltr"
          className="flex h-[180px] w-full shrink-0 justify-end overflow-hidden"
        >
          <div className="relative h-[180px] w-[180px]">
            {!imageFailed && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ONBOARDING_CHILDREN_DETAILS_IMAGE}
                alt=""
                className="pointer-events-none absolute right-[-65px] top-[-26.4px] h-[250.8px] w-[250.8px] max-w-none object-contain"
                onError={() => setImageFailed(true)}
              />
            )}
          </div>
        </div>

        <h1 className="w-full shrink-0 text-right font-simpler text-[30px] font-black leading-[34.5px] text-white">
          ספרי לנו קצת על הילדים:
        </h1>

        <div className="v03-scroll-hidden min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex w-full flex-col items-start gap-[25px] pb-4">
            {children.map((child, index) => (
              <ChildDetailsFormBlock
                key={index}
                nameLabel={labels[index]!}
                child={child}
                onChange={(updated) => updateChild(index, updated)}
                showDivider={index < children.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
