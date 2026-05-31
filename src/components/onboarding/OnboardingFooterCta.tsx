import Link from 'next/link';
import type { ReactNode } from 'react';

type OnboardingFooterCtaProps = {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
};

const variantClasses = {
  primary:
    'bg-v03-accent text-v03-accent-foreground shadow-v03-button hover:brightness-105',
  secondary:
    'bg-white text-v03-turquoise-950 shadow-v03-button hover:brightness-95',
};

/** Bottom CTA bar — Figma footer ~top 690, 327×55 (no home indicator). */
export function OnboardingFooterCta({
  href,
  onClick,
  disabled = false,
  variant = 'primary',
  children,
}: OnboardingFooterCtaProps) {
  const className = `inline-flex h-[55px] w-v03-content items-center justify-center gap-2 rounded-v03-button px-[15px] py-2 font-simpler text-[18px] font-bold transition ${variantClasses[variant]} ${
    disabled ? 'pointer-events-none opacity-50' : ''
  }`;

  if (href && !disabled) {
    return (
      <div className="absolute left-0 right-0 top-[690px] z-[11] flex flex-col items-center gap-[15px] pt-5">
        <Link href={href} className={className}>
          {children}
        </Link>
      </div>
    );
  }

  return (
    <div className="absolute left-0 right-0 top-[690px] z-[11] flex flex-col items-center gap-[15px] pt-5">
      <button type="button" onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    </div>
  );
}
