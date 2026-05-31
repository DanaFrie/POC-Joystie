import Link from 'next/link';

const backClassName =
  'absolute right-v03-gutter top-[82px] z-[20] flex h-6 w-6 items-center justify-center';

type BackTone = 'dark' | 'light';

function BackChevron({ tone }: { tone: BackTone }) {
  const stroke = tone === 'light' ? 'var(--v03-green-900)' : 'white';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 8l5.5 4-5.5 4"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Back chevron — 24×24, top 82; `light` = green-900 on light funnel. */
export function OnboardingBackButton({
  href,
  onClick,
  tone = 'dark',
}: {
  href?: string;
  onClick?: () => void;
  tone?: BackTone;
}) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="חזרה"
        className={backClassName}
      >
        <BackChevron tone={tone} />
      </button>
    );
  }

  return (
    <Link href={href ?? '/onboarding'} aria-label="חזרה" className={backClassName}>
      <BackChevron tone={tone} />
    </Link>
  );
}
