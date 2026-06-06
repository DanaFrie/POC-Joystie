import Link from 'next/link';
import { ONBOARDING_BACK_TOP_PX } from '@/constants/onboarding-funnel-motion';

const backClassName =
  'absolute right-v03-gutter z-[20] flex h-6 w-6 items-center justify-center';

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

/** Back chevron — lifted toward top; `light` = black on bright funnel, `dark` = white. */
export function OnboardingBackButton({
  href,
  onClick,
  tone = 'dark',
}: {
  href?: string;
  onClick?: () => void;
  tone?: BackTone;
}) {
  const style = { top: ONBOARDING_BACK_TOP_PX };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="חזרה"
        className={backClassName}
        style={style}
      >
        <BackChevron tone={tone} />
      </button>
    );
  }

  return (
    <Link
      href={href ?? '/onboarding'}
      aria-label="חזרה"
      className={backClassName}
      style={style}
    >
      <BackChevron tone={tone} />
    </Link>
  );
}
