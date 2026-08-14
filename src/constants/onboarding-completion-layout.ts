/** Parent onboarding completion — Figma 13057:16567 (Screen 66). */
export const ONBOARDING_COMPLETION = {
  /** Content column top on 812 canvas (Figma absolute Y). */
  content: { top: 88, width: 327, gap: 20 },
  header: { gap: 8 },
  check: { size: 30 },
  title: {
    fontSize: 24,
    lineHeight: 1.35,
    letterSpacing: -0.72,
  },
  headline: {
    fontSize: 30,
    lineHeight: 1.1,
    letterSpacing: -0.9,
  },
  textGap: 4,
  card: {
    paddingX: 16,
    paddingY: 12,
    radius: 29,
    gap: 12,
  },
  preview: {
    /**
     * Share-card aspect (375×812). Frame squeezes inside 100vh;
     * max size is Figma on a full canvas — short viewports shrink below this.
     */
    aspectWidth: 375,
    aspectHeight: 812,
    maxWidth: 210,
    maxHeight: Math.round(210 * (812 / 375)),
    radius: 24,
  },
  shareLink: {
    fontSize: 16,
    lineHeight: 1.28,
    letterSpacing: -0.32,
  },
} as const;

/** Fallback when stored share card is unavailable. */
export const ONBOARDING_COMPLETION_IMAGE =
  '/onboarding/parent/onboarding-completion.webp' as const;

export const ONBOARDING_COMPLETION_CHECK_IMAGE =
  '/onboarding/parent/completion-check.svg' as const;

/** Demo auto-advance companion waiting → completion until RTDB bonding is wired. */
export const ONBOARDING_COMPANION_WAITING_COMPLETE_MS = 12_000;
