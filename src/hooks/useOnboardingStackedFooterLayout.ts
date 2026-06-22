import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_STACKED_FOOTER_BUTTON_H_PX,
  ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX,
  ONBOARDING_STACKED_FOOTER_CONTENT_W_PX,
  ONBOARDING_STACKED_FOOTER_GUTTER_PX,
  ONBOARDING_STACKED_FOOTER_PAD_TOP_PX,
  ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX,
} from '@/constants/onboarding-footer';

function readSafeBottomPx(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--v03-safe-bottom') ||
      '0'
  );
}

/** Map Figma 375×812 footer metrics to portaled viewport coordinates. */
export function useOnboardingStackedFooterLayout() {
  const { scale, offsetX, offsetY, viewportWidth, viewportHeight } =
    useFunnelViewportMetrics();

  const buttonHeightPx = ONBOARDING_STACKED_FOOTER_BUTTON_H_PX * scale;
  let shellTopPx = offsetY + ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX * scale;
  let buttonTopPx = offsetY + ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX * scale;

  const maxButtonTop = viewportHeight - readSafeBottomPx() - buttonHeightPx;
  if (buttonTopPx > maxButtonTop) {
    buttonTopPx = Math.max(offsetY, maxButtonTop);
    shellTopPx = Math.min(
      shellTopPx,
      buttonTopPx - ONBOARDING_STACKED_FOOTER_PAD_TOP_PX * scale
    );
    shellTopPx = Math.max(offsetY, shellTopPx);
  }

  return {
    scale,
    viewportWidth,
    shellTopPx,
    buttonTopPx,
    buttonLeftPx: offsetX + ONBOARDING_STACKED_FOOTER_GUTTER_PX * scale,
    buttonWidthPx: ONBOARDING_STACKED_FOOTER_CONTENT_W_PX * scale,
    buttonHeightPx,
  };
}
