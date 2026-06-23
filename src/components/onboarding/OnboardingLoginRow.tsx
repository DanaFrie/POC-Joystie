import Link from 'next/link';
import { ONBOARDING_FUNNEL_LOGIN_TOP_PX } from '@/constants/onboarding-figma';

/**
 * Login prompt — Figma 12703:41525 (landing + role).
 * Uses the same content column as the CTA (`left-v03-gutter` + `w-v03-content`).
 */
export function OnboardingLoginRow() {
  return (
    <div
      className="absolute left-v03-gutter z-[11] w-v03-content"
      style={{ top: ONBOARDING_FUNNEL_LOGIN_TOP_PX }}
    >
      <p className="w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
        <span className="text-white">יש לך חשבון? </span>
        <Link
          href="/login"
          className="font-normal text-white underline decoration-white decoration-solid"
        >
          להתחברות
        </Link>
      </p>
    </div>
  );
}
