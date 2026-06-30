'use client';

import { ParentPostGameChangeConfirmIcon } from '@/components/onboarding/parent/ParentPostGameChangeConfirmIcon';
import { ParentPostGameGreenBackground } from '@/components/onboarding/parent/ParentPostGameGreenBackground';
import {
  PARENT_CONFIRM_CHILD_CHANGE,
  PARENT_POST_GAME_DEMO_CHILD_CHANGE,
} from '@/constants/parent-post-game-layout';
import {
  PARENT_REVIEW_APPROVE_LABEL,
  PARENT_REVIEW_SUGGEST_MORE_DIVIDER,
  PARENT_REVIEW_SUGGEST_MORE_LABEL,
  parentChildChangeCardLabel,
  parentChildDecidedChangeHeadline,
} from '@/lib/onboarding/parentPostGameCopy';

type ParentReviewChildChangeStepProps = {
  childName: string;
  childGender: 'boy' | 'girl';
  changeText?: string;
  onApprove: () => void;
  onSuggestMore: () => void;
};

/** Figma 13656:4329 — parent confirms child's first change choice. */
export function ParentReviewChildChangeStep({
  childName,
  childGender,
  changeText = PARENT_POST_GAME_DEMO_CHILD_CHANGE,
  onApprove,
  onSuggestMore,
}: ParentReviewChildChangeStepProps) {
  const layout = PARENT_CONFIRM_CHILD_CHANGE;
  const titleId = 'parent-confirm-child-change-title';

  return (
    <div dir="rtl" className="relative h-full w-full overflow-hidden">
      <ParentPostGameGreenBackground />

      <div
        className="absolute inset-x-0 z-10 flex flex-col justify-between px-v03-gutter"
        style={{
          top: layout.contentTop,
          bottom: layout.contentBottom,
        }}
        aria-labelledby={titleId}
      >
        <div
          className="flex w-full flex-col items-stretch"
          style={{ gap: layout.sectionGap }}
        >
          <div
            className="flex w-full flex-col items-center"
            style={{ gap: layout.heroGap }}
          >
            <ParentPostGameChangeConfirmIcon />
            <h1
              id={titleId}
              className="w-full text-center font-simpler font-black text-white"
              style={{
                fontSize: layout.headline.fontSize,
                lineHeight: `${layout.headline.lineHeight}px`,
                letterSpacing: `${layout.headline.letterSpacing}px`,
                textShadow: layout.headline.textShadow,
              }}
            >
              {parentChildDecidedChangeHeadline(childName, childGender)}
            </h1>
          </div>

          <div
            className="w-full bg-white/[0.05]"
            style={{
              borderRadius: layout.card.borderRadius,
              padding: `${layout.card.paddingY}px ${layout.card.paddingX}px`,
              outline: `${layout.card.outlineWidth}px solid rgba(255, 255, 255, 0.25)`,
              outlineOffset: -layout.card.outlineWidth,
            }}
          >
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: layout.card.gap }}
            >
              <p
                className="w-full text-center font-simpler font-normal text-[#B0C6BF]"
                style={{
                  fontSize: layout.cardLabel.fontSize,
                  lineHeight: `${layout.cardLabel.lineHeight}px`,
                }}
              >
                {parentChildChangeCardLabel(childName, childGender)}
              </p>
              <p
                className="w-full text-center font-simpler font-bold text-white"
                style={{
                  fontSize: layout.cardText.fontSize,
                  lineHeight: `${layout.cardText.lineHeight}px`,
                }}
              >
                {changeText}
              </p>
            </div>
          </div>

          <button type="button" onClick={onApprove} className={layout.primaryButtonClass}>
            {PARENT_REVIEW_APPROVE_LABEL}
          </button>
        </div>

        <div className="flex w-full flex-col" style={{ gap: layout.bottomSectionGap }}>
          <div className="flex w-full items-center gap-5">
            <div className="h-px flex-1 bg-[#90A79F]/70" aria-hidden />
            <span className="font-simpler text-[14px] font-normal uppercase leading-5 text-[#90A79F]">
              {PARENT_REVIEW_SUGGEST_MORE_DIVIDER}
            </span>
            <div className="h-px flex-1 bg-[#90A79F]/70" aria-hidden />
          </div>
          <button type="button" onClick={onSuggestMore} className={layout.secondaryButtonClass}>
            {PARENT_REVIEW_SUGGEST_MORE_LABEL}
          </button>
        </div>
      </div>
    </div>
  );
}
