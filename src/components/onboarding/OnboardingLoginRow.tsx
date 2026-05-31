import Link from 'next/link';

/**
 * Login prompt — Figma 12703:41525.
 * top 738, left 108, 158×22.
 */
export function OnboardingLoginRow() {
  return (
    <p className="absolute left-[108px] top-[738px] z-[11] w-[158px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white">
      <span className="text-white">יש לך חשבון? </span>
      <Link
        href="/login"
        className="font-normal text-white underline decoration-white decoration-solid"
      >
        להתחברות
      </Link>
    </p>
  );
}
