'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { BallGameSliderCard } from '@/components/onboarding/game/BallGameSliderCard';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { BALL_GAME_MINT_ELLIPSE } from '@/constants/child-onboarding-layout';

type ChildDashboardErrorStateProps = {
  title?: string;
  detail?: string | null;
};

const DEFAULT_TITLE = 'הקישור לא תקין';
const DEFAULT_DETAIL = 'בקשו מההורה לשלוח את הלינק פעם נוספת';

/** Bottom-left Ellipse 385 — works outside FunnelViewport (dashboard 100dvh). */
function ChildErrorMintEllipse() {
  const { left, size, blur } = BALL_GAME_MINT_ELLIPSE;
  return (
    <div
      className="pointer-events-none absolute z-[1]"
      aria-hidden
      style={{
        left,
        bottom: -Math.round(size * 0.4),
        width: size,
        height: size,
        borderRadius: size,
        background: 'var(--v03-ellipse-385)',
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

/** Token / load failure — 100dvh + disappointed Dori + bottom-left mint ellipse. */
export function ChildDashboardErrorState({
  title,
  detail,
}: ChildDashboardErrorStateProps) {
  const isExpired = Boolean(detail?.includes('פג תוקף'));
  const headline = title ?? (isExpired ? 'הקישור פג תוקף' : DEFAULT_TITLE);
  const body =
    isExpired ||
    !detail ||
    detail === 'CHILD_NOT_READY' ||
    detail === 'כתובת לא תקינה' ||
    detail.length > 100
      ? DEFAULT_DETAIL
      : detail;

  return (
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center overflow-hidden bg-v03-green-900 px-v03-gutter"
      style={{
        width: '100%',
        height: '100dvh',
        paddingTop: 'max(24px, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
      }}
      role="alert"
      aria-labelledby="child-dashboard-error-title"
    >
      <ChildErrorMintEllipse />

      <div className="relative z-[2]">
        <BallGameSliderCard>
          <div className="aspect-square h-[291px] w-[291px] shrink-0">
            <OnboardingLazyImage
              src={CHILD_ONBOARDING_ASSETS.doriDisappointed}
              alt=""
              className="size-full object-contain"
              priority
            />
          </div>

          <div className="flex w-full shrink-0 flex-col items-center gap-[15px] self-stretch">
            <p
              id="child-dashboard-error-title"
              className="w-full shrink-0 text-center font-simpler text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white"
            >
              {headline}
            </p>
            <p className="w-full shrink-0 text-center font-simpler text-[16px] font-normal leading-[21.6px] tracking-[-0.24px] text-white/80">
              {body}
            </p>
          </div>
        </BallGameSliderCard>
      </div>
    </div>
  );
}
