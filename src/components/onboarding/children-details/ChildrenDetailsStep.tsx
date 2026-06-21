'use client';

import { useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildDetailsFormBlock } from '@/components/onboarding/children-details/ChildDetailsFormBlock';
import { ONBOARDING_CHILDREN_DETAILS_IMAGE } from '@/constants/onboarding-figma';
import {
  PARENT_CHILDREN_DETAILS_FORMS_GAP_PX,
  PARENT_CHILDREN_DETAILS_HERO_CLIP_PX,
  PARENT_CHILDREN_DETAILS_IMAGE_CENTER_OFFSET_PX,
  PARENT_CHILDREN_DETAILS_IMAGE_PX,
  PARENT_CHILDREN_DETAILS_IMAGE_TOP_PX,
  PARENT_CHILDREN_DETAILS_TITLE_FORMS_GAP_PX,
} from '@/constants/parent-onboarding-layout';
import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';
import { getChildDetailsStaticNameLabel } from '@/lib/onboarding/childrenDetails';
import { getOnboardingParentRole } from '@/lib/onboarding/parentRole';

type ChildrenDetailsStepProps = {
  children: OnboardingChildDraft[];
  onChildrenChange: (children: OnboardingChildDraft[]) => void;
  nameErrors?: Record<number, string>;
};

/** Figma 12703:42228 — full column scrolls inside funnel scroll region. */
export function ChildrenDetailsStep({
  children,
  onChildrenChange,
  nameErrors = {},
}: ChildrenDetailsStepProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const parentRole = getOnboardingParentRole();
  const titleText =
    parentRole === 'father'
      ? 'ספר לנו קצת על הילדים:'
      : 'ספרי לנו קצת על הילדים:';

  const updateChild = (index: number, child: OnboardingChildDraft) => {
    const next = [...children];
    next[index] = child;
    onChildrenChange(next);
  };

  return (
    <div
      dir="rtl"
      className="flex w-full flex-col items-end px-v03-gutter pb-6 pt-0"
      aria-label="פרטי ילדים"
    >
      <div
        className="flex w-v03-content flex-col items-end"
        style={{ gap: PARENT_CHILDREN_DETAILS_TITLE_FORMS_GAP_PX }}
      >
        <div
          className="flex w-full shrink-0 justify-start overflow-hidden v03-funnel-enter-0"
          style={{ height: PARENT_CHILDREN_DETAILS_HERO_CLIP_PX }}
        >
          <div
            className="relative shrink-0 overflow-hidden"
            style={{
              width: PARENT_CHILDREN_DETAILS_HERO_CLIP_PX,
              height: PARENT_CHILDREN_DETAILS_HERO_CLIP_PX,
            }}
          >
            {!imageFailed && (
              <OnboardingLazyImage
                src={ONBOARDING_CHILDREN_DETAILS_IMAGE}
                alt=""
                className="pointer-events-none absolute max-w-none object-contain"
                style={{
                  top: PARENT_CHILDREN_DETAILS_IMAGE_TOP_PX,
                  right: `calc(50% - ${PARENT_CHILDREN_DETAILS_IMAGE_CENTER_OFFSET_PX}px)`,
                  width: PARENT_CHILDREN_DETAILS_IMAGE_PX,
                  height: PARENT_CHILDREN_DETAILS_IMAGE_PX,
                }}
                onError={() => setImageFailed(true)}
              />
            )}
          </div>
        </div>

        <h1 className="v03-funnel-enter-1 w-full shrink-0 text-right font-simpler text-[30px] font-black leading-[1.15] tracking-[-0.6px] text-white">
          {titleText}
        </h1>

        <div
          className="flex w-full flex-col items-end pb-4"
          style={{ gap: PARENT_CHILDREN_DETAILS_FORMS_GAP_PX }}
        >
          {children.map((child, index) => (
            <ChildDetailsFormBlock
              key={index}
              nameLabel={getChildDetailsStaticNameLabel(index, children.length)}
              child={child}
              nameError={nameErrors[index]}
              onChange={(updated) => updateChild(index, updated)}
              showDivider={index < children.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
