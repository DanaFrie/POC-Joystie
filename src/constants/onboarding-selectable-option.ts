/** Shared selectable row — pick-child, subscription plans, parent change options. */
export const ONBOARDING_SELECTABLE_OPTION = {
  borderRadius: 24,
  paddingX: 30,
  paddingY: 25,
  /** Mint glow — Figma 13680:1526 / 13617:4029 */
  selectedGlow: {
    width: 98,
    height: 99,
    left: 205.75,
    top: 93.5,
    background: 'rgba(0, 255, 179, 0.90)',
    blur: '61.49px',
  },
  primaryCtaClass:
    'inline-flex h-[55px] w-full items-center justify-center gap-2 rounded-[22px] bg-[#00FFB3] px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95 disabled:pointer-events-none disabled:opacity-50',
} as const;
