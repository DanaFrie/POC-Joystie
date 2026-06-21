import Link from 'next/link';
import {
  ONBOARDING_FUNNEL_LOGIN_LEFT_PX,
  ONBOARDING_FUNNEL_LOGIN_TOP_PX,
} from '@/constants/onboarding-figma';

/**
 * Login prompt — Figma 12703:41525 (landing + role).
 * top 738, left 108, 158×22.
 */
export function OnboardingLoginRow() {
  return (
    <p
      className="absolute z-[11] w-[158px] text-right font-simpler text-[16px] font-normal leading-[21.6px] text-white"
      style={{
        top: ONBOARDING_FUNNEL_LOGIN_TOP_PX,
        left: ONBOARDING_FUNNEL_LOGIN_LEFT_PX,
      }}
    >
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
