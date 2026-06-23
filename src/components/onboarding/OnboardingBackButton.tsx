'use client';

import Link from 'next/link';
import {
  ONBOARDING_BACK_HEIGHT_PX,
  ONBOARDING_BACK_SCROLL_GAP_PX,
  ONBOARDING_BACK_TOP_PX,
} from '@/constants/onboarding-funnel-motion';

type BackTone = 'dark' | 'light';

/** Figma chevron — 6×12, 1.5px outline; RTL back points right. */
function BackChevron({ tone }: { tone: BackTone }) {
  const stroke = tone === 'light' ? '#000000' : '#ffffff';

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="overflow-hidden"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const hitTargetClass =
  'absolute right-v03-gutter flex items-center justify-center z-[60]';

const controlStyle = {
  top: ONBOARDING_BACK_TOP_PX,
  width: ONBOARDING_BACK_HEIGHT_PX,
  height: ONBOARDING_BACK_HEIGHT_PX,
};

type OnboardingBackButtonProps = {
  href?: string;
  onClick?: () => void;
  tone?: BackTone;
  /** In-flow inside scroll regions — moves with content. */
  scrollWithContent?: boolean;
};

/**
 * Back chevron — overlay on static steps; in-flow when `scrollWithContent` (inside scroll bodies).
 * Always `right-v03-gutter` + top 41px — same slot as non-scroll steps.
 */
export function OnboardingBackButton({
  href,
  onClick,
  tone = 'dark',
  scrollWithContent = false,
}: OnboardingBackButtonProps) {
  const control = onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-label="חזרה"
      className={`${hitTargetClass} ${scrollWithContent ? '' : 'z-[60]'}`}
      style={controlStyle}
    >
      <BackChevron tone={tone} />
    </button>
  ) : (
    <Link
      href={href ?? '/onboarding'}
      aria-label="חזרה"
      className={`${hitTargetClass} ${scrollWithContent ? '' : 'z-[60]'}`}
      style={controlStyle}
    >
      <BackChevron tone={tone} />
    </Link>
  );

  if (scrollWithContent) {
    return (
      <div
        className="relative w-full shrink-0"
        style={{
          height:
            ONBOARDING_BACK_TOP_PX +
            ONBOARDING_BACK_HEIGHT_PX +
            ONBOARDING_BACK_SCROLL_GAP_PX,
        }}
      >
        {control}
      </div>
    );
  }

  return control;
}
