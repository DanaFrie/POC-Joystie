/** Parent onboarding completion — Figma 13057:16567 (Screen 66). */
export const ONBOARDING_COMPLETION = {
  content: { top: 117, width: 327, gap: 17 },
  header: { gap: 24 },
  check: { size: 49 },
  title: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.36,
  },
  headline: {
    fontSize: 30,
    lineHeight: 1.1,
    letterSpacing: -0.6,
  },
  hero: {
    width: 321.919,
    height: 346,
    imageSize: 321.919,
    glowSize: 263.619,
  },
} as const;

export const ONBOARDING_COMPLETION_IMAGE =
  '/onboarding/parent/onboarding-completion.webp' as const;

export const ONBOARDING_COMPLETION_CHECK_IMAGE =
  '/onboarding/parent/completion-check.svg' as const;

/** Demo auto-advance companion waiting → completion until RTDB bonding is wired. */
export const ONBOARDING_COMPANION_WAITING_COMPLETE_MS = 12_000;
