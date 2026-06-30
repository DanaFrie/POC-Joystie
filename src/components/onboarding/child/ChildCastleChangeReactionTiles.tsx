'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_CASTLE_CHANGE_REACTION } from '@/constants/child-post-game-layout';
import {
  childCastleChangeConfirmDeclineLabel,
  childCastleChangeConfirmReadyLabel,
} from '@/lib/onboarding/childPostGameCopy';

const layout = CHILD_CASTLE_CHANGE_REACTION;

type ChildCastleChangeReactionTilesProps = {
  childGender?: 'boy' | 'girl';
  dimmed?: boolean;
  onReady?: () => void;
  onDecline?: () => void;
};

/** V / X reaction tiles — Figma 13702:10060. */
export function ChildCastleChangeReactionTiles({
  childGender = 'boy',
  dimmed = false,
  onReady,
  onDecline,
}: ChildCastleChangeReactionTilesProps) {
  const readyLabel = childCastleChangeConfirmReadyLabel(childGender);
  const declineLabel = childCastleChangeConfirmDeclineLabel();
  const iconSize = layout.reactionIconSize;

  return (
    <div
      className="inline-flex items-center justify-start"
      style={{
        gap: layout.gap,
        opacity: dimmed ? layout.dimmedOpacity : 1,
        pointerEvents: dimmed ? 'none' : 'auto',
      }}
    >
      <button
        type="button"
        onClick={onReady}
        disabled={dimmed}
        className="inline-flex w-[120px] cursor-pointer touch-manipulation select-none flex-col items-center border-0 bg-transparent p-0 [-webkit-tap-highlight-color:transparent] disabled:cursor-default"
        style={{ gap: layout.labelGap }}
        aria-label={readyLabel}
      >
        <span
          className="inline-flex h-[120px] w-full items-center justify-center rounded-[16.14px] bg-[#F2F2F2] shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)]"
          style={{ padding: layout.tilePadding }}
        >
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.castleChangeConfirmIcon}
            alt=""
            className="shrink-0 object-contain"
            style={{ width: iconSize, height: iconSize }}
            priority
          />
        </span>
        <span
          className="w-full text-center font-simpler font-normal text-white"
          style={{
            fontSize: layout.label.fontSize,
            lineHeight: `${layout.label.lineHeight}px`,
          }}
        >
          {readyLabel}
        </span>
      </button>

      <button
        type="button"
        onClick={onDecline}
        disabled={dimmed}
        className="inline-flex w-[120px] cursor-pointer touch-manipulation select-none flex-col items-center border-0 bg-transparent p-0 [-webkit-tap-highlight-color:transparent] disabled:cursor-default"
        style={{ gap: layout.labelGap }}
        aria-label={declineLabel}
      >
        <span
          className="inline-flex h-[120px] w-full items-center justify-center rounded-[16.14px] bg-white outline outline-1 outline-white backdrop-blur-[6px]"
          style={{ padding: layout.tilePadding }}
        >
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.castleChangeDeclineIcon}
            alt=""
            className="shrink-0 object-contain"
            style={{ width: iconSize, height: iconSize }}
            priority
          />
        </span>
        <span
          className="w-full text-center font-simpler font-normal text-white"
          style={{
            fontSize: layout.label.fontSize,
            lineHeight: `${layout.label.lineHeight}px`,
          }}
        >
          {declineLabel}
        </span>
      </button>
    </div>
  );
}
