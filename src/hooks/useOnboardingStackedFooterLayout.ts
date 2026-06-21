import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_STACKED_FOOTER_BUTTON_H_PX,
  ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX,
  ONBOARDING_STACKED_FOOTER_CONTENT_W_PX,
  ONBOARDING_STACKED_FOOTER_GUTTER_PX,
  ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX,
} from '@/constants/onboarding-footer';

/** Map Figma 375×812 footer metrics to portaled viewport coordinates. */
export function useOnboardingStackedFooterLayout() {
  const { scale, offsetX, offsetY, viewportWidth } = useFunnelViewportMetrics();

  return {
    scale,
    viewportWidth,
    shellTopPx: offsetY + ONBOARDING_STACKED_FOOTER_SHELL_TOP_PX * scale,
    buttonTopPx: offsetY + ONBOARDING_STACKED_FOOTER_BUTTON_TOP_PX * scale,
    buttonLeftPx: offsetX + ONBOARDING_STACKED_FOOTER_GUTTER_PX * scale,
    buttonWidthPx: ONBOARDING_STACKED_FOOTER_CONTENT_W_PX * scale,
    buttonHeightPx: ONBOARDING_STACKED_FOOTER_BUTTON_H_PX * scale,
  };
}
