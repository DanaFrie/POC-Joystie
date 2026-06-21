import { JoystieWordmark } from '@/components/brand/JoystieWordmark';
import { SIGNUP_CHILD_INVITE_WAITING_LOGO } from '@/constants/onboarding-figma';

/** Desktop funnel — centered «mobile only» screen (2.5× prior banner scale). */
const DESKTOP_OVERLAY_SCALE = 2.5;

const LOGO_W_PX = 164 * DESKTOP_OVERLAY_SCALE;
const LOGO_H_PX = 80 * DESKTOP_OVERLAY_SCALE;
const GIF_PX = 86.506 * DESKTOP_OVERLAY_SCALE * 0.7;
const TEXT_PX = 18 * DESKTOP_OVERLAY_SCALE;
const STACK_GAP_PX = 10 * DESKTOP_OVERLAY_SCALE;

export function FunnelDesktopOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-v03-green-900"
      role="alert"
      dir="rtl"
    >
      <div className="v03-onboarding-grid-layer" aria-hidden />

      <div
        className="relative z-10 flex max-w-[min(100%,460px)] flex-col items-center px-6"
        style={{ gap: STACK_GAP_PX }}
      >
        <JoystieWordmark
          width={LOGO_W_PX}
          height={LOGO_H_PX}
          className="h-auto w-[min(410px,85vw)] shrink-0"
        />

        <p
          className="text-center font-simpler font-bold text-v03-text-on-dark"
          style={{
            fontSize: TEXT_PX,
            lineHeight: 1.25,
            letterSpacing: '-0.36px',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.35)',
          }}
        >
          אנחנו זמינים במובייל - מחכים לכם שם
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SIGNUP_CHILD_INVITE_WAITING_LOGO}
          alt=""
          className="shrink-0 object-contain"
          style={{
            width: GIF_PX,
            height: GIF_PX,
            maxWidth: 'min(151px, 40vw)',
            maxHeight: 'min(151px, 40vw)',
          }}
          decoding="async"
        />
      </div>
    </div>
  );
}
