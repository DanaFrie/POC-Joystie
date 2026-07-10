'use client';

import type { ReactNode } from 'react';
import { SelectableOptionRadio } from '@/components/onboarding/parent/SelectableOptionRadio';
import { SelectableOptionTick } from '@/components/onboarding/parent/SelectableOptionTick';
import { ONBOARDING_SELECTABLE_OPTION } from '@/constants/onboarding-selectable-option';

type SelectableOptionCardProps = {
  selected: boolean;
  onSelect: () => void;
  borderRadius?: number;
  paddingX?: number;
  paddingY?: number;
  contentGap?: number;
  /** `fixed` — pick-child / plan width; `flex` — longer option copy */
  textLayout?: 'fixed' | 'flex';
  /** Hebrew copy alignment inside the text column */
  textAlign?: 'end' | 'center';
  /**
   * `white` — default pick-child / change options.
   * `accent` — subscription plans: `1.5px solid #00FFB3`.
   */
  borderTone?: 'white' | 'accent';
  /** Mint glow behind selected state (default true). */
  showSelectedGlow?: boolean;
  /** `radio` single-select · `tick` multi-select goals */
  indicator?: 'radio' | 'tick';
  /** Centered mint ellipse for compact 2-col cards */
  compactGlow?: boolean;
  children: ReactNode;
};

/**
 * Selectable card — pick-first-child (Figma 13680:1526) + plans/options (13617:4029).
 * `dir="ltr"`: radio left, Hebrew copy right.
 */
export function SelectableOptionCard({
  selected,
  onSelect,
  borderRadius = ONBOARDING_SELECTABLE_OPTION.borderRadius,
  paddingX = ONBOARDING_SELECTABLE_OPTION.paddingX,
  paddingY = ONBOARDING_SELECTABLE_OPTION.paddingY,
  contentGap = 4,
  textLayout = 'fixed',
  textAlign = 'end',
  borderTone = 'white',
  showSelectedGlow = true,
  indicator = 'radio',
  compactGlow = false,
  children,
}: SelectableOptionCardProps) {
  const glow = ONBOARDING_SELECTABLE_OPTION.selectedGlow;
  const outlineClass =
    borderTone === 'accent'
      ? selected
        ? 'outline outline-[1.5px] outline-offset-[-1.5px] outline-[#00FFB3]'
        : 'outline outline-[1.5px] outline-offset-[-1.5px] outline-white/25 hover:outline-white/40'
      : selected
        ? 'outline outline-[1.5px] outline-offset-[-1.5px] outline-white'
        : 'outline outline-[1.5px] outline-offset-[-1.5px] outline-white/25 hover:outline-white/40';

  return (
    <button
      type="button"
      dir="ltr"
      role={indicator === 'tick' ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex w-full items-center justify-between overflow-hidden bg-white/5 transition ${outlineClass}`}
      style={{
        borderRadius,
        padding: `${paddingY}px ${paddingX}px`,
      }}
    >
      {selected && showSelectedGlow ? (
        <div
          className="pointer-events-none absolute rounded-full"
          style={
            compactGlow
              ? {
                  left: '50%',
                  top: '50%',
                  width: 56,
                  height: 56,
                  transform: 'translate(-50%, -50%)',
                  background: glow.background,
                  filter: 'blur(28px)',
                }
              : {
                  left: glow.left,
                  top: glow.top,
                  width: glow.width,
                  height: glow.height,
                  background: glow.background,
                  filter: `blur(${glow.blur})`,
                }
          }
          aria-hidden
        />
      ) : null}

      {indicator === 'tick' ? (
        <SelectableOptionTick selected={selected} />
      ) : (
        <SelectableOptionRadio selected={selected} />
      )}

      <div
        dir="rtl"
        className={`relative z-[1] flex flex-col justify-center ${
          textAlign === 'center'
            ? 'w-full flex-1 items-center text-center'
            : textLayout === 'flex'
              ? 'min-w-0 flex-1 items-end text-right'
              : 'w-[153.5px] shrink-0 items-end text-right'
        }`}
        style={{ gap: contentGap }}
      >
        {children}
      </div>
    </button>
  );
}
