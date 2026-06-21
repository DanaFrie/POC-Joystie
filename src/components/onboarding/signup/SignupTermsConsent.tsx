'use client';

import Link from 'next/link';
import { TermsCheckboxIcon } from '@/components/onboarding/signup/TermsCheckboxIcon';

type SignupTermsConsentProps = {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  error?: string;
  disabled?: boolean;
};

/** Terms divider + copy + consent toggle — Figma signup screen. */
export function SignupTermsConsent({
  accepted,
  onAcceptedChange,
  error,
  disabled = false,
}: SignupTermsConsentProps) {
  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <div
        className="h-px w-full shrink-0 bg-[#586D66]"
        style={{ transform: 'scaleY(0.7)' }}
        aria-hidden
      />

      <div className="flex w-full flex-col items-stretch gap-5">
        <p className="px-2.5 text-right font-simpler text-[14px] font-normal leading-[17.5px] text-v03-green-100">
          כדי שנוכל ליצור עבורך חוויה אישית, בטוחה ומותאמת, נבקש לאשר את תנאי
          השימוש ומדיניות הפרטיות שלנו.
        </p>

        <button
          type="button"
          role="checkbox"
          aria-checked={accepted}
          disabled={disabled}
          onClick={() => onAcceptedChange(!accepted)}
          className={`flex w-full items-center gap-5 overflow-hidden rounded-[18px] bg-white/5 px-5 py-[15px] text-right outline outline-[1.5px] outline-offset-[-1.5px] outline-white transition ${
            disabled ? 'opacity-50' : 'hover:bg-white/[0.07]'
          }`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center">
            <TermsCheckboxIcon checked={accepted} />
          </span>

          <span className="flex-1 font-simpler text-[16px] font-normal leading-[21.6px] text-[#E3EDEA]">
            קראתי ואני מאשר/ת את{' '}
            <Link
              href="/signup/terms"
              className="underline decoration-solid underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              תנאי השימוש, מדיניות הפרטיות
            </Link>{' '}
            ושימוש ב-Cookies
          </span>
        </button>

        <div className="min-h-[21px] px-2.5" aria-live="polite">
          {error ? (
            <p className="text-right font-simpler text-sm leading-[21px] text-red-300">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
