'use client';

import Link from 'next/link';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import { TermsCheckboxIcon } from '@/components/onboarding/signup/TermsCheckboxIcon';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  SIGNUP_OAUTH_TERMS_COPY_GAP_PX,
  SIGNUP_OAUTH_TERMS_HOME_INDICATOR_H_PX,
  SIGNUP_OAUTH_TERMS_SECTION_GAP_PX,
  SIGNUP_OAUTH_TERMS_SHEET_GAP_PX,
  SIGNUP_OAUTH_TERMS_SHEET_PAD_TOP_PX,
  SIGNUP_OAUTH_TERMS_SHEET_PAD_X_PX,
  SIGNUP_OAUTH_TERMS_SHEET_RADIUS_PX,
  SIGNUP_OAUTH_TERMS_TOGGLE_W_PX,
} from '@/constants/signup-oauth-terms-layout';
import { ONBOARDING_STACKED_FOOTER_BUTTON_H_PX } from '@/constants/onboarding-footer';
type SignupOAuthTermsSheetProps = {
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
  termsError?: string;
  onContinue: () => void;
};

function TermsToggle({
  accepted,
  onAcceptedChange,
  disabled,
}: {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={accepted}
      disabled={disabled}
      onClick={() => onAcceptedChange(!accepted)}
      className={`mx-auto flex w-full max-w-[327px] items-center gap-5 overflow-hidden rounded-[18px] bg-white/5 px-5 py-[15px] text-right outline outline-[1.5px] outline-offset-[-1.5px] outline-white transition ${
        disabled ? 'opacity-50' : 'hover:bg-white/[0.07]'
      }`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <TermsCheckboxIcon checked={accepted} />
      </span>

      <span className="flex-1 text-right font-simpler text-[16px] font-normal leading-[21.6px] text-[#E3EDEA]">
        קראתי ואני מאשר/ת את{' '}
        <Link
          href="/terms"
          className="underline decoration-solid underline-offset-2"
          onClick={(e) => e.stopPropagation()}
        >
          תנאי השימוש, מדיניות הפרטיות
        </Link>
      </span>
    </button>
  );
}

/**
 * OAuth post-signup — dim hero + Figma Frame 1597882425 bottom sheet.
 */
export function SignupOAuthTermsSheet({
  termsAccepted,
  onTermsAcceptedChange,
  termsError,
  onContinue,
}: SignupOAuthTermsSheetProps) {
  const { scale, viewportWidth, designWidth } = useFunnelViewportMetrics();

  const contentMaxWidthPx = designWidth * scale;
  const padTopPx = SIGNUP_OAUTH_TERMS_SHEET_PAD_TOP_PX * scale;
  const padXPx = SIGNUP_OAUTH_TERMS_SHEET_PAD_X_PX * scale;
  const gapPx = SIGNUP_OAUTH_TERMS_SHEET_GAP_PX * scale;
  const sectionGapPx = SIGNUP_OAUTH_TERMS_SECTION_GAP_PX * scale;
  const copyGapPx = SIGNUP_OAUTH_TERMS_COPY_GAP_PX * scale;
  const radiusPx = SIGNUP_OAUTH_TERMS_SHEET_RADIUS_PX * scale;
  const toggleWidthPx = SIGNUP_OAUTH_TERMS_TOGGLE_W_PX * scale;
  const homeIndicatorPx = SIGNUP_OAUTH_TERMS_HOME_INDICATOR_H_PX * scale;
  const buttonHeightPx = ONBOARDING_STACKED_FOOTER_BUTTON_H_PX * scale;

  return (
    <FunnelRootPortal>
      <div
        className="pointer-events-none fixed inset-0 z-[24] box-border"
        style={{
          width: viewportWidth,
          background: 'rgba(0, 0, 0, 0.50)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
        }}
        aria-hidden
      />

      <div
        className="v03-oauth-terms-sheet fixed inset-x-0 bottom-0 z-[25] box-border flex flex-col items-center justify-end border-t border-white bg-v03-green-900"
        style={{
          width: viewportWidth,
          paddingTop: padTopPx,
          paddingLeft: padXPx,
          paddingRight: padXPx,
          paddingBottom: `max(${homeIndicatorPx}px, env(safe-area-inset-bottom, 0px))`,
          gap: gapPx,
          borderTopLeftRadius: radiusPx,
          borderTopRightRadius: radiusPx,
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
        }}
        role="dialog"
        aria-labelledby="oauth-terms-title"
      >
        <div
          className="flex w-full flex-col items-stretch"
          style={{ gap: sectionGapPx, maxWidth: contentMaxWidthPx }}
        >
          <div className="flex w-full flex-col items-stretch" style={{ gap: copyGapPx }}>
            <div className="inline-flex items-center justify-center gap-2.5 self-stretch px-[15px]">
              <h1
                id="oauth-terms-title"
                className="flex-1 text-center font-simpler font-bold text-white"
                style={{
                  fontSize: 30 * scale,
                  lineHeight: `${34.5 * scale}px`,
                }}
              >
                לפני שמתחילים, נשמח לאישור תנאי השימוש
              </h1>
            </div>

            <div className="inline-flex items-center justify-center gap-2.5 self-stretch px-[15px]">
              <p
                className="flex-1 text-center font-simpler font-normal text-[#E3EDEA]"
                style={{
                  fontSize: 14 * scale,
                  lineHeight: `${17.5 * scale}px`,
                }}
              >
                כדי שנוכל ליצור עבורך חוויה אישית, בטוחה ומותאמת, נבקש לאשר את
                תנאי השימוש ומדיניות הפרטיות שלנו.
              </p>
            </div>

            <div
              className="flex justify-center self-center"
              style={{ width: toggleWidthPx, maxWidth: '100%' }}
            >
              <TermsToggle
                accepted={termsAccepted}
                onAcceptedChange={onTermsAcceptedChange}
              />
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch" style={{ gap: gapPx }}>
            <div className="min-h-[21px] px-[15px] text-center" aria-live="polite">
              {termsError ? (
                <p
                  className="font-simpler text-red-300"
                  style={{
                    fontSize: 14 * scale,
                    lineHeight: `${21 * scale}px`,
                  }}
                >
                  {termsError}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onContinue}
              className={`inline-flex w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-[22px] px-[15px] py-2 text-center font-simpler text-[18px] font-bold leading-[21.6px] shadow-v03-button transition ${
                termsAccepted
                  ? 'bg-white text-v03-green-900 hover:brightness-95'
                  : 'bg-white/30 text-white hover:bg-white/35'
              }`}
              style={{
                height: buttonHeightPx,
              }}
            >
              המשך
            </button>
          </div>
        </div>
      </div>
    </FunnelRootPortal>
  );
}
