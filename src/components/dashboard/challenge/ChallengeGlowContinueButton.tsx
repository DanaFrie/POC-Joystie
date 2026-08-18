'use client';

import {
  ChildContinueGlowIcon,
  useGlowImmediateTap,
} from '@/components/onboarding/child/ChildContinueGlowButton';

type ChallengeGlowContinueButtonProps = {
  enabled: boolean;
  onClick?: () => void;
  label?: string;
};

/** Mint glow CTA — flicker animates only when enabled (≥1 goal selected). */
export function ChallengeGlowContinueButton({
  enabled,
  onClick,
  label = 'לוחצים כאן כדי להמשיך',
}: ChallengeGlowContinueButtonProps) {
  const { onPointerDown, onClick: onTapClick } = useGlowImmediateTap(
    enabled ? onClick : undefined
  );

  return (
    <button
      type="button"
      disabled={!enabled}
      onPointerDown={enabled ? onPointerDown : undefined}
      onClick={enabled ? onTapClick : undefined}
      className={`flex w-full flex-col items-center gap-3 border-0 bg-transparent p-0 ${
        enabled
          ? 'cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent]'
          : 'cursor-not-allowed opacity-45'
      }`}
      aria-label={label}
      aria-disabled={!enabled}
    >
      <ChildContinueGlowIcon
        className={enabled ? '' : '[&_.child-continue-glow-flicker]:!animate-none'}
      />
      <span className="w-full text-center font-simpler text-[16px] font-normal leading-[1.25] tracking-[-0.24px] text-[#CADCD6]">
        {label}
      </span>
    </button>
  );
}
