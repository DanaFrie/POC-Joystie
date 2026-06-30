'use client';

import { SelectableOptionCard } from '@/components/onboarding/parent/SelectableOptionCard';
import { PICK_FIRST_CHILD_CARD } from '@/constants/pick-first-child-layout';

type PickFirstChildCardProps = {
  name: string;
  screenTimeLabel: string;
  selected: boolean;
  onSelect: () => void;
};

/** Child picker row — Figma 13680:1526 (327×card, radio left · copy right). */
export function PickFirstChildCard({
  name,
  screenTimeLabel,
  selected,
  onSelect,
}: PickFirstChildCardProps) {
  const title = PICK_FIRST_CHILD_CARD.title;
  const subtitle = PICK_FIRST_CHILD_CARD.subtitle;

  return (
    <SelectableOptionCard
      selected={selected}
      onSelect={onSelect}
      textLayout="flex"
      contentGap={PICK_FIRST_CHILD_CARD.contentGap}
    >
      <span
        className="w-full text-right font-simpler font-bold text-white"
        style={{
          fontSize: title.fontSize,
          lineHeight: `${title.lineHeight}px`,
          letterSpacing: `${title.letterSpacing}px`,
        }}
      >
        {name}
      </span>
      <span
        className="w-full text-right font-simpler font-normal"
        style={{
          fontSize: subtitle.fontSize,
          lineHeight: `${subtitle.lineHeight}px`,
          letterSpacing: `${subtitle.letterSpacing}px`,
          color: subtitle.color,
        }}
      >
        {screenTimeLabel}
      </span>
    </SelectableOptionCard>
  );
}
