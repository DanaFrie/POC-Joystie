import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  ONBOARDING_STACKED_FOOTER_BUTTON_H_PX,
  ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX,
  ONBOARDING_STACKED_FOOTER_CONTENT_W_PX,
  ONBOARDING_STACKED_FOOTER_GUTTER_PX,
  ONBOARDING_STACKED_FOOTER_PAD_TOP_PX,
  ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX,
} from '@/constants/onboarding-footer';

export type PortaledFooterLayout = {
  pinToViewportBottom: boolean;
  viewportWidth: number;
  scale: number;
  buttonLeftPx: number;
  buttonWidthPx: number;
  buttonHeightPx: number;
  safeBottomPx: number;
  shellHeightPx: number;
  buttonTopPx: number;
  shellTopPx: number;
  buttonBottomPx: number;
};

function readSafeBottomPx(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--v03-safe-bottom') ||
      '0'
  );
}

/** Map Figma footer to portaled viewport coordinates; pin to bottom when canvas overflows. */
export function useOnboardingStackedFooterLayout(): PortaledFooterLayout {
  const { scale, offsetX, offsetY, viewportWidth, viewportHeight } =
    useFunnelViewportMetrics();

  const safeBottomPx = readSafeBottomPx();
  const buttonHeightPx = ONBOARDING_STACKED_FOOTER_BUTTON_H_PX * scale;
  const padTopPx = ONBOARDING_STACKED_FOOTER_PAD_TOP_PX * scale;
  const shellHeightPx = padTopPx + buttonHeightPx;
  const buttonLeftPx = offsetX + ONBOARDING_STACKED_FOOTER_GUTTER_PX * scale;
  const buttonWidthPx = ONBOARDING_STACKED_FOOTER_CONTENT_W_PX * scale;

  const canvasBottomPx = offsetY + V03_SCREEN_HEIGHT * scale;
  const viewportBottomPx = viewportHeight - safeBottomPx;
  const pinToViewportBottom = canvasBottomPx > viewportBottomPx + 0.5;

  let buttonTopPx = offsetY + ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX * scale;
  let shellTopPx = offsetY + ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX * scale;
  let buttonBottomPx = safeBottomPx;

  if (pinToViewportBottom) {
    buttonBottomPx = safeBottomPx;
    buttonTopPx = viewportHeight - safeBottomPx - buttonHeightPx;
    shellTopPx = buttonTopPx - padTopPx;
  } else {
    const maxButtonTop = viewportBottomPx - buttonHeightPx;
    if (buttonTopPx > maxButtonTop) {
      buttonTopPx = Math.max(offsetY, maxButtonTop);
      shellTopPx = Math.min(shellTopPx, buttonTopPx - padTopPx);
      shellTopPx = Math.max(offsetY, shellTopPx);
    }
  }

  return {
    pinToViewportBottom,
    viewportWidth,
    scale,
    buttonLeftPx,
    buttonWidthPx,
    buttonHeightPx,
    safeBottomPx,
    shellHeightPx,
    buttonTopPx,
    shellTopPx,
    buttonBottomPx,
  };
}
