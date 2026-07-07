'use client';

import { useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildDetailsFormBlock } from '@/components/onboarding/children-details/ChildDetailsFormBlock';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { ONBOARDING_CHILDREN_DETAILS_IMAGE } from '@/constants/onboarding-figma';
import { PARENT_CHILDREN_DETAILS_STEP } from '@/constants/parent-onboarding-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import type { OnboardingChildDraft } from '@/lib/onboarding/childrenDetails';
import { getChildDetailsStaticNameLabel } from '@/lib/onboarding/childrenDetails';
import { getOnboardingParentRole } from '@/lib/onboarding/parentRole';

type ChildrenDetailsStepProps = {
  children: OnboardingChildDraft[];
  onChildrenChange: (children: OnboardingChildDraft[]) => void;
  nameErrors?: Record<number, string>;
};

/**
 * Figma 12703:41650 — 327px column @ top 69, gap 19, RTL text + right-aligned blocks.
 * Child 1: hero asset · Child 2: title + nested form frames (12703:41653).
 */
export function ChildrenDetailsStep({
  children,
  onChildrenChange,
  nameErrors = {},
}: ChildrenDetailsStepProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const layout = PARENT_CHILDREN_DETAILS_STEP;
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const topPx = (layout.top / V03_SCREEN_HEIGHT) * usableCanvasHeightPx;
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
    <section
      dir="rtl"
      className="pointer-events-auto flex w-full flex-col items-center px-v03-gutter"
      style={{
        paddingTop: topPx,
        paddingBottom: layout.scrollPadBottomPx,
      }}
      aria-label="פרטי ילדים"
    >
      <div
        className="flex w-full shrink-0 flex-col items-start justify-center"
        style={{
          width: layout.frameWidthPx,
          gap: layout.columnGap,
        }}
      >
        <div
          className="v03-funnel-enter-0 relative shrink-0 overflow-hidden"
          style={{
            width: layout.heroFramePx,
            height: layout.heroFramePx,
          }}
        >
          {!imageFailed && (
            <OnboardingLazyImage
              src={ONBOARDING_CHILDREN_DETAILS_IMAGE}
              alt=""
              className="pointer-events-none absolute max-w-none object-contain object-bottom"
              style={{
                top: layout.heroImageTopPx,
                left: `calc(50% - ${layout.heroImageCenterOffsetPx}px)`,
                width: layout.heroImagePx,
                height: layout.heroImagePx,
              }}
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div
          className="flex w-full flex-col items-stretch"
          style={{ gap: layout.contentFrameGap }}
        >
          <header className="v03-funnel-enter-1 w-full">
            <h1 className="w-full text-right font-simpler text-[30px] font-black leading-[1.1] tracking-[-0.6px] text-white">
              {titleText}
            </h1>
          </header>

          <div
            className="flex w-full flex-col items-stretch"
            style={{ gap: layout.formsGap }}
          >
            {children.map((child, index) => (
              <div key={index} className="contents">
                <ChildDetailsFormBlock
                  nameLabel={getChildDetailsStaticNameLabel(index, children.length)}
                  child={child}
                  nameError={nameErrors[index]}
                  onChange={(updated) => updateChild(index, updated)}
                  showDivider={false}
                  blockGapPx={layout.childBlockGap}
                  rowGapPx={layout.childRowGap}
                />
                {index < children.length - 1 ? (
                  <div
                    className="h-0 w-full outline outline-[0.75px] outline-offset-[-0.38px] outline-v03-green-700"
                    aria-hidden
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
