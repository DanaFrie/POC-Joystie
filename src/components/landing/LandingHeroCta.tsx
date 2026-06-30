import Link from 'next/link';

type LandingHeroCtaProps = {
  className?: string;
};

/** Reveal funnel CTA — Figma 13292:4998 (white pill on dark). */
export function LandingHeroCta({ className = '' }: LandingHeroCtaProps) {
  return (
    <Link
      href="/onboarding"
      className={`inline-flex h-[52px] w-auto min-w-[11.5rem] items-center justify-center gap-2 rounded-v03-button bg-v03-white px-8 py-2 text-center font-simpler text-[17px] font-bold leading-normal text-v03-turquoise-950 shadow-v03-button transition hover:brightness-95 sm:h-[55px] sm:text-[18px] md:px-10 ${className}`}
    >
      התחילו ניסיון
    </Link>
  );
}
